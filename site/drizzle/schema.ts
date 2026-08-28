import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/** Metadados de pedidos: criados apenas após a confirmação no checkout operacional. */
export const orderStatusValues = ["pending_review", "awaiting_payment", "confirmed", "ready_for_pickup", "out_for_delivery", "completed", "cancelled"] as const;
export const fulfillmentValues = ["delivery", "pickup"] as const;

export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customerId").notNull().references(() => users.id),
  externalOrderId: varchar("externalOrderId", { length: 128 }).unique(),
  status: mysqlEnum("status", orderStatusValues).default("pending_review").notNull(),
  fulfillment: mysqlEnum("fulfillment", fulfillmentValues).notNull(),
  currency: varchar("currency", { length: 3 }).default("BRL").notNull(),
  subtotalCents: int("subtotalCents").notNull(),
  shippingCents: int("shippingCents"),
  totalCents: int("totalCents").notNull(),
  statusNote: text("statusNote"),
  source: varchar("source", { length: 32 }).default("shopify").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/** Histórico técnico de importações: não armazena dados clínicos, receitas ou credenciais. */
export const catalogSyncRuns = mysqlTable("catalogSyncRuns", {
  id: int("id").autoincrement().primaryKey(),
  source: varchar("source", { length: 32 }).notNull(),
  mode: mysqlEnum("mode", ["api", "file"]).notNull(),
  status: mysqlEnum("status", ["prepared", "running", "completed", "failed"]).default("prepared").notNull(),
  importedProducts: int("importedProducts").default(0).notNull(),
  duplicateSkus: int("duplicateSkus").default(0).notNull(),
  message: text("message"),
  startedAt: timestamp("startedAt"),
  finishedAt: timestamp("finishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type CatalogSyncRun = typeof catalogSyncRuns.$inferSelect;
