import { 
  type User, 
  type InsertUser,
  type Table,
  type InsertTable,
  type Game,
  type InsertGame,
  type GamePlayer,
  type InsertGamePlayer,
  type Round,
  type InsertRound,
  type Settings,
  type InsertSettings,
  type AuditLog,
  type InsertAuditLog,
  type PlayerStats,
  type InsertPlayerStats,
  users,
  tables,
  games,
  gamePlayers,
  rounds,
  settings,
  auditLogs,
  playerStats,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  deleteUser(id: string): Promise<void>;
  getAllUsers(): Promise<User[]>;
  
  // Table operations
  getTable(id: string): Promise<Table | undefined>;
  getAllTables(): Promise<Table[]>;
  createTable(table: InsertTable): Promise<Table>;
  deleteTable(id: string): Promise<void>;
  updateTable(id: string, updates: Partial<Table>): Promise<Table>;
  
  // Game operations
  getGame(id: string): Promise<Game | undefined>;
  getGameByTableId(tableId: string): Promise<Game | undefined>;
  createGame(game: InsertGame): Promise<Game>;
  updateGame(id: string, updates: Partial<Game>): Promise<Game>;
  
  // Game player operations
  getGamePlayers(gameId: string): Promise<GamePlayer[]>;
  getGamePlayer(gameId: string, userId: string): Promise<GamePlayer | undefined>;
  createGamePlayer(gamePlayer: InsertGamePlayer): Promise<GamePlayer>;
  updateGamePlayer(id: string, updates: Partial<GamePlayer>): Promise<GamePlayer>;
  
  // Round operations
  getRound(id: string): Promise<Round | undefined>;
  getGameRounds(gameId: string): Promise<Round[]>;
  createRound(round: InsertRound): Promise<Round>;
  updateRound(id: string, updates: Partial<Round>): Promise<Round>;
  
  // Settings operations
  getSettings(): Promise<Settings>;
  updateSettings(updates: Partial<Settings>): Promise<Settings>;
  
  // Audit log operations
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  getAuditLogs(limit: number): Promise<AuditLog[]>;
  getGameAuditLogs(gameId: string): Promise<AuditLog[]>;
  
  // Player stats operations
  getPlayerStats(userId: string): Promise<PlayerStats | undefined>;
  createPlayerStats(stats: InsertPlayerStats): Promise<PlayerStats>;
  updatePlayerStats(userId: string, updates: Partial<PlayerStats>): Promise<PlayerStats>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    if (!user) throw new Error("User not found");
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // Table operations
  async getTable(id: string): Promise<Table | undefined> {
    const [table] = await db.select().from(tables).where(eq(tables.id, id));
    return table || undefined;
  }

  async getAllTables(): Promise<Table[]> {
    return await db.select().from(tables);
  }

  async createTable(insertTable: InsertTable): Promise<Table> {
    const [table] = await db.insert(tables).values(insertTable).returning();
    return table;
  }

  async updateTable(id: string, updates: Partial<Table>): Promise<Table> {
    const [table] = await db.update(tables).set(updates).where(eq(tables.id, id)).returning();
    if (!table) throw new Error("Table not found");
    return table;
  }

  async deleteTable(id: string): Promise<void> {
    await db.delete(tables).where(eq(tables.id, id));
  }

  // Game operations
  async getGame(id: string): Promise<Game | undefined> {
    const [game] = await db.select().from(games).where(eq(games.id, id));
    return game || undefined;
  }

  async getGameByTableId(tableId: string): Promise<Game | undefined> {
    const [game] = await db
      .select()
      .from(games)
      .where(
        and(
          eq(games.tableId, tableId),
          eq(games.status, "in_progress")
        )
      );
    return game || undefined;
  }

  async createGame(insertGame: InsertGame): Promise<Game> {
    const [game] = await db.insert(games).values(insertGame).returning();
    return game;
  }

  async updateGame(id: string, updates: Partial<Game>): Promise<Game> {
    const [game] = await db.update(games).set(updates).where(eq(games.id, id)).returning();
    if (!game) throw new Error("Game not found");
    return game;
  }

  // Game player operations
  async getGamePlayers(gameId: string): Promise<GamePlayer[]> {
    return await db.select().from(gamePlayers).where(eq(gamePlayers.gameId, gameId));
  }

  async getGamePlayer(gameId: string, userId: string): Promise<GamePlayer | undefined> {
    const [gamePlayer] = await db
      .select()
      .from(gamePlayers)
      .where(
        and(
          eq(gamePlayers.gameId, gameId),
          eq(gamePlayers.userId, userId)
        )
      );
    return gamePlayer || undefined;
  }

  async createGamePlayer(insertGamePlayer: InsertGamePlayer): Promise<GamePlayer> {
    const [gamePlayer] = await db.insert(gamePlayers).values(insertGamePlayer).returning();
    return gamePlayer;
  }

  async updateGamePlayer(id: string, updates: Partial<GamePlayer>): Promise<GamePlayer> {
    const [gamePlayer] = await db.update(gamePlayers).set(updates).where(eq(gamePlayers.id, id)).returning();
    if (!gamePlayer) throw new Error("Game player not found");
    return gamePlayer;
  }

  // Round operations
  async getRound(id: string): Promise<Round | undefined> {
    const [round] = await db.select().from(rounds).where(eq(rounds.id, id));
    return round || undefined;
  }

  async getGameRounds(gameId: string): Promise<Round[]> {
    return await db.select().from(rounds).where(eq(rounds.gameId, gameId));
  }

  async createRound(insertRound: InsertRound): Promise<Round> {
    const [round] = await db.insert(rounds).values(insertRound).returning();
    return round;
  }

  async updateRound(id: string, updates: Partial<Round>): Promise<Round> {
    const [round] = await db.update(rounds).set(updates).where(eq(rounds.id, id)).returning();
    if (!round) throw new Error("Round not found");
    return round;
  }

  // Settings operations
  async getSettings(): Promise<Settings> {
    const [setting] = await db.select().from(settings).limit(1);
    if (!setting) {
      const [newSetting] = await db.insert(settings).values({ commissionRate: "5.00" }).returning();
      return newSetting;
    }
    return setting;
  }

  async updateSettings(updates: Partial<Settings>): Promise<Settings> {
    const existingSettings = await this.getSettings();
    const [updated] = await db
      .update(settings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(settings.id, existingSettings.id))
      .returning();
    if (!updated) throw new Error("Settings not found");
    return updated;
  }

  // Audit log operations
  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    const [auditLog] = await db.insert(auditLogs).values(log).returning();
    return auditLog;
  }

  async getAuditLogs(limit: number = 100): Promise<AuditLog[]> {
    return await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(limit);
  }

  async getGameAuditLogs(gameId: string): Promise<AuditLog[]> {
    return await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.gameId, gameId))
      .orderBy(desc(auditLogs.createdAt));
  }

  // Player stats operations
  async getPlayerStats(userId: string): Promise<PlayerStats | undefined> {
    const [stats] = await db.select().from(playerStats).where(eq(playerStats.userId, userId));
    return stats || undefined;
  }

  async createPlayerStats(stats: InsertPlayerStats): Promise<PlayerStats> {
    const [newStats] = await db.insert(playerStats).values(stats).returning();
    return newStats;
  }

  async updatePlayerStats(userId: string, updates: Partial<PlayerStats>): Promise<PlayerStats> {
    const existing = await this.getPlayerStats(userId);
    if (!existing) {
      return this.createPlayerStats({ userId, ...updates });
    }
    const [updated] = await db
      .update(playerStats)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(playerStats.userId, userId))
      .returning();
    if (!updated) throw new Error("Player stats not found");
    return updated;
  }
}

export const storage = new DatabaseStorage();
