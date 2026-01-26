import { boolean, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  username: text().primaryKey(),
  password: text().notNull(),
  locked: boolean().default(false),
  autoUnlock: timestamp({ mode: "date" })
});
export const sessionsTable = pgTable("sessions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  token: text().notNull(),
  username: text().notNull(),
  createdAt: timestamp({ mode: "date" }).notNull().defaultNow(),
  expiry: timestamp({ mode: "date" }).notNull()
});