import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table - admin-created accounts
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  balance: decimal("balance", { precision: 10, scale: 2 }).notNull().default("0"),
  isAdmin: boolean("is_admin").notNull().default(false),
  isSuspended: boolean("is_suspended").notNull().default(false),
  totalWinnings: decimal("total_winnings", { precision: 10, scale: 2 }).notNull().default("0"),
  gamesPlayed: integer("games_played").notNull().default(0),
  gamesWon: integer("games_won").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Tables - poker tables with different stakes
export const tables = pgTable("tables", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  stakeAmount: decimal("stake_amount", { precision: 10, scale: 2 }).notNull(),
  password: text("password"),
  maxPlayers: integer("max_players").notNull().default(6),
  autoCloseMinutes: integer("auto_close_minutes").notNull().default(5),
  isPrivate: boolean("is_private").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Games - represents a complete 3-round game at a table
export const games = pgTable("games", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tableId: varchar("table_id").notNull().references(() => tables.id),
  status: text("status").notNull().default("waiting"), // waiting, in_progress, completed
  currentRound: integer("current_round").notNull().default(0),
  totalPot: decimal("total_pot", { precision: 10, scale: 2 }).notNull().default("0"),
  commission: decimal("commission", { precision: 10, scale: 2 }).notNull().default("0"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
});

// Game Players - players in a specific game
export const gamePlayers = pgTable("game_players", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  gameId: varchar("game_id").notNull().references(() => games.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  seatPosition: integer("seat_position").notNull(), // 0-5
  roundsWon: integer("rounds_won").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  winnings: decimal("winnings", { precision: 10, scale: 2 }).notNull().default("0"),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
});

// Rounds - individual rounds within a game
export const rounds = pgTable("rounds", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  gameId: varchar("game_id").notNull().references(() => games.id),
  roundNumber: integer("round_number").notNull(), // 1, 2, or 3
  communityCards: jsonb("community_cards").notNull(), // array of 5 cards
  playerCards: jsonb("player_cards").notNull(), // object with userId -> array of 6 cards
  winnerId: varchar("winner_id").references(() => users.id), // null if tie
  winningHand: text("winning_hand"), // e.g., "Royal Flush", "Full House"
  isTie: boolean("is_tie").notNull().default(false),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Audit Logs - track all significant game events
export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventType: text("event_type").notNull(), // 'game_started', 'game_ended', 'player_joined', 'round_completed', etc.
  gameId: varchar("game_id").references(() => games.id),
  userId: varchar("user_id").references(() => users.id),
  details: jsonb("details"), // Additional event data
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Player Stats - track player performance metrics
export const playerStats = pgTable("player_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  totalGamesPlayed: integer("total_games_played").notNull().default(0),
  totalGamesWon: integer("total_games_won").notNull().default(0),
  totalTableWins: integer("total_table_wins").notNull().default(0),
  totalRoundWins: integer("total_round_wins").notNull().default(0),
  totalWinnings: decimal("total_winnings", { precision: 10, scale: 2 }).notNull().default("0"),
  totalLosses: decimal("total_losses", { precision: 10, scale: 2 }).notNull().default("0"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// System settings
export const settings = pgTable("settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).notNull().default("5.00"), // percentage
  tableAutoCloseMinutes: integer("table_auto_close_minutes").notNull().default(5),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  totalWinnings: true,
  gamesPlayed: true,
  gamesWon: true,
});

export const insertTableSchema = createInsertSchema(tables).omit({
  id: true,
  createdAt: true,
});

export const insertGameSchema = createInsertSchema(games).omit({
  id: true,
  startedAt: true,
  completedAt: true,
});

export const insertGamePlayerSchema = createInsertSchema(gamePlayers).omit({
  id: true,
  joinedAt: true,
});

export const insertRoundSchema = createInsertSchema(rounds).omit({
  id: true,
  startedAt: true,
  completedAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});

export const insertPlayerStatsSchema = createInsertSchema(playerStats).omit({
  id: true,
  updatedAt: true,
});

export const insertSettingsSchema = createInsertSchema(settings).omit({
  id: true,
  updatedAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTable = z.infer<typeof insertTableSchema>;
export type Table = typeof tables.$inferSelect;

export type InsertGame = z.infer<typeof insertGameSchema>;
export type Game = typeof games.$inferSelect;

export type InsertGamePlayer = z.infer<typeof insertGamePlayerSchema>;
export type GamePlayer = typeof gamePlayers.$inferSelect;

export type InsertRound = z.infer<typeof insertRoundSchema>;
export type Round = typeof rounds.$inferSelect;

export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;

export type InsertPlayerStats = z.infer<typeof insertPlayerStatsSchema>;
export type PlayerStats = typeof playerStats.$inferSelect;

export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settings.$inferSelect;

// Card types
export type Card = {
  rank: string; // '2'-'10', 'J', 'Q', 'K', 'A'
  suit: string; // 'hearts', 'diamonds', 'clubs', 'spades'
};

// Client-side types for real-time game state
export type PlayerState = {
  userId: string;
  username: string;
  balance: string;
  seatPosition: number;
  cards: Card[];
  roundsWon: number;
  isActive: boolean;
  isConnected: boolean;
};

export type GameState = {
  gameId: string;
  tableId: string;
  tableName: string;
  stakeAmount: string;
  status: string;
  currentRound: number;
  totalPot: string;
  players: PlayerState[];
  communityCards: Card[];
  roundTimeRemaining?: number;
  lastRoundWinner?: {
    userId: string;
    username: string;
    handName: string;
  };
};
