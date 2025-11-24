import type { Express } from "express";
import { createServer, type Server } from "http";
import { Server as SocketServer } from "socket.io";
import { storage } from "./storage";
import { db } from "./db";
import bcrypt from "bcryptjs";
import PokerSolver from "pokersolver";
import { games } from "@shared/schema";
import { eq } from "drizzle-orm";
import type { Card, GameState, PlayerState } from "@shared/schema";

// Session user type
declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

// Helper to generate a standard deck
function generateDeck(): Card[] {
  const suits = ["hearts", "diamonds", "clubs", "spades"];
  const ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
  const deck: Card[] = [];
  
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ rank, suit });
    }
  }
  
  return deck;
}

// Shuffle array in place
function shuffleDeck<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Convert Card to pokersolver format
function cardToPokerSolver(card: Card): string {
  const suitMap: Record<string, string> = {
    hearts: "h",
    diamonds: "d",
    clubs: "c",
    spades: "s",
  };
  return `${card.rank}${suitMap[card.suit]}`;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  const io = new SocketServer(httpServer, {
    cors: {
      origin: "*",
      credentials: true,
    },
  });

  // Store active games and their timers
  const activeGames = new Map<string, {
    roundTimer?: NodeJS.Timeout;
    connectedPlayers: Set<string>;
  }>();

  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (user.isSuspended) {
        return res.status(403).json({ message: "Account suspended" });
      }

      req.session.userId = user.id;
      res.json({ 
        id: user.id, 
        username: user.username, 
        isAdmin: user.isAdmin,
        balance: user.balance,
      });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      id: user.id,
      username: user.username,
      balance: user.balance,
      isAdmin: user.isAdmin,
    });
  });

  // Admin routes
  app.get("/api/admin/users", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const admin = await storage.getUser(req.session.userId);
    if (!admin?.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    const users = await storage.getAllUsers();
    res.json(users);
  });

  app.post("/api/admin/users", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const admin = await storage.getUser(req.session.userId);
    if (!admin?.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    try {
      const { username, password, balance } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        balance: balance || "0",
        isAdmin: false,
        isSuspended: false,
      });

      res.json(user);
    } catch (error) {
      res.status(400).json({ message: "Failed to create user" });
    }
  });

  app.patch("/api/admin/users/:id", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const admin = await storage.getUser(req.session.userId);
    if (!admin?.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    try {
      const { id } = req.params;
      const updates = req.body;
      
      const user = await storage.updateUser(id, updates);
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: "Failed to update user" });
    }
  });

  app.delete("/api/admin/users/:id", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const admin = await storage.getUser(req.session.userId);
    if (!admin?.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    try {
      const { id } = req.params;
      await storage.deleteUser(id);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ message: "Failed to delete user" });
    }
  });

  app.get("/api/admin/settings", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const admin = await storage.getUser(req.session.userId);
    if (!admin?.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    const settings = await storage.getSettings();
    res.json(settings);
  });

  app.patch("/api/admin/settings", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const admin = await storage.getUser(req.session.userId);
    if (!admin?.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    try {
      const settings = await storage.updateSettings(req.body);
      res.json(settings);
    } catch (error) {
      res.status(400).json({ message: "Failed to update settings" });
    }
  });

  // Admin metrics route
  app.get("/api/admin/metrics", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const admin = await storage.getUser(req.session.userId);
    if (!admin?.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    try {
      const allUsers = await storage.getAllUsers();
      const allTables = await storage.getAllTables();
      const settings = await storage.getSettings();
      
      let totalCommissionCollected = "0";
      let totalPotsDistributed = "0";
      
      const allGames = await db.select().from(games).where(eq(games.status, "completed"));
      for (const game of allGames) {
        totalCommissionCollected = (parseFloat(totalCommissionCollected) + parseFloat(game.commission)).toFixed(2);
        totalPotsDistributed = (parseFloat(totalPotsDistributed) + parseFloat(game.totalPot)).toFixed(2);
      }

      const metrics = {
        totalPlayers: allUsers.filter(u => !u.isAdmin).length,
        activePlayers: allUsers.filter(u => !u.isAdmin && !u.isSuspended).length,
        totalTables: allTables.length,
        totalCommissionCollected,
        totalPotsDistributed,
        commissionRate: settings.commissionRate,
        gamesCompleted: allGames.length,
      };

      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch metrics" });
    }
  });

  // Create custom table route
  app.post("/api/admin/tables", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const admin = await storage.getUser(req.session.userId);
    if (!admin?.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    try {
      const { name, stakeAmount, password, isPrivate } = req.body;
      const table = await storage.createTable({
        name,
        stakeAmount: stakeAmount.toString(),
        password: password || null,
        maxPlayers: 6,
        isPrivate: isPrivate || false,
      });
      
      // Broadcast table creation to all connected clients
      io.emit("table-created", table);
      
      res.json(table);
    } catch (error) {
      res.status(400).json({ message: "Failed to create table" });
    }
  });

  // Get audit logs route
  app.get("/api/admin/audit-logs", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const admin = await storage.getUser(req.session.userId);
    if (!admin?.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    try {
      const logs = await storage.getAuditLogs(100);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });

  // Table routes
  app.get("/api/tables", async (req, res) => {
    try {
      const tables = await storage.getAllTables();
      
      const tablesWithPlayers = await Promise.all(
        tables.map(async (table) => {
          const game = await storage.getGameByTableId(table.id);
          
          if (!game) {
            return {
              ...table,
              playerCount: 0,
              playerNames: [],
            };
          }

          const players = await storage.getGamePlayers(game.id);
          const activePlayers = players.filter(p => p.isActive);
          
          const playerNames = await Promise.all(
            activePlayers.map(async (p) => {
              const user = await storage.getUser(p.userId);
              return user?.username || "Unknown";
            })
          );

          return {
            ...table,
            playerCount: activePlayers.length,
            playerNames,
          };
        })
      );

      res.json(tablesWithPlayers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tables" });
    }
  });

  // WebSocket connection handling
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("join-table", async ({ tableId, userId }) => {
      try {
        const table = await storage.getTable(tableId);
        const user = await storage.getUser(userId);
        
        if (!table || !user) {
          socket.emit("error", { message: "Table or user not found" });
          return;
        }

        // Check balance
        const requiredBalance = parseFloat(table.stakeAmount) * 3;
        if (parseFloat(user.balance) < requiredBalance) {
          socket.emit("error", { message: "Insufficient balance" });
          return;
        }

        // Get or create game
        let game = await storage.getGameByTableId(tableId);
        
        if (!game) {
          game = await storage.createGame({
            tableId,
            status: "waiting",
            currentRound: 0,
            totalPot: "0",
            commission: "0",
          });
        }

        // Check if user already in game
        let gamePlayer = await storage.getGamePlayer(game.id, userId);
        
        if (!gamePlayer) {
          const existingPlayers = await storage.getGamePlayers(game.id);
          const activePlayers = existingPlayers.filter(p => p.isActive);
          
          if (activePlayers.length >= table.maxPlayers) {
            socket.emit("error", { message: "Table full" });
            return;
          }

          // Find available seat
          const occupiedSeats = new Set(activePlayers.map(p => p.seatPosition));
          let seatPosition = 0;
          while (occupiedSeats.has(seatPosition) && seatPosition < 6) {
            seatPosition++;
          }

          gamePlayer = await storage.createGamePlayer({
            gameId: game.id,
            userId,
            seatPosition,
            roundsWon: 0,
            isActive: true,
            winnings: "0",
          });
        }

        socket.join(`game-${game.id}`);
        
        if (!activeGames.has(game.id)) {
          activeGames.set(game.id, { connectedPlayers: new Set() });
        }
        activeGames.get(game.id)!.connectedPlayers.add(userId);

        // Broadcast updated game state
        await broadcastGameState(game.id, io);

        // Start game if we have 2+ players
        const players = await storage.getGamePlayers(game.id);
        const activePlayers = players.filter(p => p.isActive);
        
        if (activePlayers.length >= 2 && game.status === "waiting") {
          setTimeout(() => startGame(game.id, io), 2000);
        }
      } catch (error) {
        console.error("Error joining table:", error);
        socket.emit("error", { message: "Failed to join table" });
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  async function broadcastGameState(gameId: string, io: SocketServer) {
    const game = await storage.getGame(gameId);
    if (!game) return;

    const table = await storage.getTable(game.tableId);
    if (!table) return;

    const players = await storage.getGamePlayers(gameId);
    const rounds = await storage.getGameRounds(gameId);
    const currentRound = rounds.find(r => r.roundNumber === game.currentRound);

    const playerStates: PlayerState[] = await Promise.all(
      players.map(async (gp) => {
        const user = await storage.getUser(gp.userId);
        const cards = currentRound?.playerCards 
          ? (currentRound.playerCards as any)[gp.userId] || []
          : [];

        const gameData = activeGames.get(gameId);
        const isConnected = gameData?.connectedPlayers.has(gp.userId) || false;

        return {
          userId: gp.userId,
          username: user?.username || "Unknown",
          balance: user?.balance || "0",
          seatPosition: gp.seatPosition,
          cards,
          roundsWon: gp.roundsWon,
          isActive: gp.isActive,
          isConnected,
        };
      })
    );

    const lastRound = rounds[rounds.length - 1];
    const lastRoundWinner = lastRound?.winnerId 
      ? await storage.getUser(lastRound.winnerId)
      : null;

    const gameState: GameState = {
      gameId: game.id,
      tableId: game.tableId,
      tableName: table.name,
      stakeAmount: table.stakeAmount,
      status: game.status,
      currentRound: game.currentRound,
      totalPot: game.totalPot,
      players: playerStates,
      communityCards: currentRound?.communityCards as Card[] || [],
      lastRoundWinner: lastRoundWinner && lastRound ? {
        userId: lastRoundWinner.id,
        username: lastRoundWinner.username,
        handName: lastRound.winningHand || "Unknown",
      } : undefined,
    };

    io.to(`game-${gameId}`).emit("game-state", gameState);
  }

  async function startGame(gameId: string, io: SocketServer) {
    const game = await storage.getGame(gameId);
    if (!game || game.status !== "waiting") return;

    await storage.updateGame(gameId, {
      status: "in_progress",
      currentRound: 1,
      startedAt: new Date(),
    });

    await storage.createAuditLog({
      eventType: "game_started",
      gameId,
      details: { tableId: game.tableId },
    });

    await startRound(gameId, 1, io);
  }

  async function startRound(gameId: string, roundNumber: number, io: SocketServer) {
    const game = await storage.getGame(gameId);
    if (!game) return;

    const table = await storage.getTable(game.tableId);
    if (!table) return;

    const players = await storage.getGamePlayers(gameId);
    const activePlayers = players.filter(p => p.isActive);

    // Deduct stake from each player
    for (const player of activePlayers) {
      const user = await storage.getUser(player.userId);
      if (user) {
        const newBalance = (parseFloat(user.balance) - parseFloat(table.stakeAmount)).toFixed(2);
        await storage.updateUser(user.id, { balance: newBalance });
      }
    }

    // Update pot
    const roundPot = activePlayers.length * parseFloat(table.stakeAmount);
    const newTotalPot = (parseFloat(game.totalPot) + roundPot).toFixed(2);
    await storage.updateGame(gameId, { totalPot: newTotalPot });

    // Deal cards
    const deck = shuffleDeck(generateDeck());
    const communityCards = deck.slice(0, 5);
    let cardIndex = 5;

    const playerCards: Record<string, Card[]> = {};
    for (const player of activePlayers) {
      playerCards[player.userId] = deck.slice(cardIndex, cardIndex + 6);
      cardIndex += 6;
    }

    const round = await storage.createRound({
      gameId,
      roundNumber,
      communityCards: communityCards as any,
      playerCards: playerCards as any,
      winnerId: null,
      winningHand: null,
      isTie: false,
    });

    await storage.createAuditLog({
      eventType: "round_started",
      gameId,
      details: { roundNumber, playerCount: activePlayers.length },
    });

    await broadcastGameState(gameId, io);

    // Wait 10-15 seconds before determining winner
    const gameData = activeGames.get(gameId);
    if (gameData) {
      gameData.roundTimer = setTimeout(() => {
        determineRoundWinner(gameId, roundNumber, io);
      }, 12000); // 12 seconds
    }
  }

  async function determineRoundWinner(gameId: string, roundNumber: number, io: SocketServer) {
    const game = await storage.getGame(gameId);
    if (!game) return;

    const rounds = await storage.getGameRounds(gameId);
    const round = rounds.find(r => r.roundNumber === roundNumber);
    if (!round) return;

    const players = await storage.getGamePlayers(gameId);
    const activePlayers = players.filter(p => p.isActive);

    const communityCards = round.communityCards as Card[];
    const playerCards = round.playerCards as Record<string, Card[]>;

    // Evaluate hands
    const handEvaluations = activePlayers.map(player => {
      const allCards = [
        ...playerCards[player.userId],
        ...communityCards,
      ].map(cardToPokerSolver);

      const hand = PokerSolver.Hand.solve(allCards);
      
      return {
        player,
        hand,
        handName: hand.name,
      };
    });

    // Find winners
    const winners = PokerSolver.Hand.winners(handEvaluations.map(h => h.hand));
    const winnerEvals = handEvaluations.filter(h => winners.includes(h.hand));

    if (winnerEvals.length === 1) {
      // Single winner
      const winner = winnerEvals[0];
      
      await storage.updateRound(round.id, {
        winnerId: winner.player.userId,
        winningHand: winner.handName,
        isTie: false,
        completedAt: new Date(),
      });

      await storage.updateGamePlayer(winner.player.id, {
        roundsWon: winner.player.roundsWon + 1,
      });

      const updatedPlayer = await storage.getGamePlayer(gameId, winner.player.userId);
      
      // Check for table winner (2 crowns)
      if (updatedPlayer && updatedPlayer.roundsWon >= 2) {
        await endGame(gameId, [updatedPlayer], io);
      } else if (roundNumber < 3) {
        // Next round
        setTimeout(() => {
          storage.updateGame(gameId, { currentRound: roundNumber + 1 });
          startRound(gameId, roundNumber + 1, io);
        }, 15000);
      } else {
        // Game over after round 3
        const finalPlayers = await storage.getGamePlayers(gameId);
        const roundWinners = finalPlayers.filter(p => p.roundsWon > 0);
        await endGame(gameId, roundWinners, io);
      }

      const winnerUser = await storage.getUser(winner.player.userId);
      
      await storage.createAuditLog({
        eventType: "round_winner",
        gameId,
        userId: winner.player.userId,
        details: { roundNumber, handName: winner.handName, isTableWinner: updatedPlayer && updatedPlayer.roundsWon >= 2 },
      });

      io.to(`game-${gameId}`).emit("round-winner", {
        userId: winner.player.userId,
        username: winnerUser?.username,
        handName: winner.handName,
        isTableWinner: updatedPlayer && updatedPlayer.roundsWon >= 2,
      });
    } else {
      // Tie
      await storage.updateRound(round.id, {
        isTie: true,
        completedAt: new Date(),
      });

      if (roundNumber < 3) {
        setTimeout(() => {
          storage.updateGame(gameId, { currentRound: roundNumber + 1 });
          startRound(gameId, roundNumber + 1, io);
        }, 15000);
      } else {
        const finalPlayers = await storage.getGamePlayers(gameId);
        const roundWinners = finalPlayers.filter(p => p.roundsWon > 0);
        await endGame(gameId, roundWinners, io);
      }

      io.to(`game-${gameId}`).emit("round-tie");
    }

    await broadcastGameState(gameId, io);
  }

  async function endGame(gameId: string, winners: any[], io: SocketServer) {
    const game = await storage.getGame(gameId);
    if (!game) return;

    const settings = await storage.getSettings();
    const commissionRate = parseFloat(settings.commissionRate) / 100;
    const totalPot = parseFloat(game.totalPot);
    const commission = totalPot * commissionRate;
    const winnings = totalPot - commission;

    if (winners.length > 0) {
      const perWinner = winnings / winners.length;

      for (const winner of winners) {
        const user = await storage.getUser(winner.userId);
        if (user) {
          const newBalance = (parseFloat(user.balance) + perWinner).toFixed(2);
          await storage.updateUser(user.id, { balance: newBalance });
        }

        await storage.updateGamePlayer(winner.id, {
          winnings: perWinner.toFixed(2),
        });
      }
    }

    await storage.updateGame(gameId, {
      status: "completed",
      commission: commission.toFixed(2),
      completedAt: new Date(),
    });

    await storage.createAuditLog({
      eventType: "game_ended",
      gameId,
      details: { winnerCount: winners.length, totalPot: game.totalPot, commission: commission.toFixed(2) },
    });

    io.to(`game-${gameId}`).emit("game-ended", {
      winners: winners.map(w => w.userId),
      commission: commission.toFixed(2),
    });

    await broadcastGameState(gameId, io);

    // Clean up
    const gameData = activeGames.get(gameId);
    if (gameData?.roundTimer) {
      clearTimeout(gameData.roundTimer);
    }
    activeGames.delete(gameId);
  }

  return httpServer;
}
