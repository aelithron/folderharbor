import { boolean, integer, json, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  username: text().unique().notNull(),
  password: text().notNull(),
  roles: integer().array().notNull().default([]),
  acls: integer().array().notNull().default([]),
  locked: boolean().default(false).notNull(),
  failedLogins: integer().default(0).notNull(),
  resetFailedLogins: timestamp({ mode: "date" })
});
export const rolesTable = pgTable("roles", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text().notNull(),
  acls: integer().array().default([]).notNull()
});
export const sessionsTable = pgTable("sessions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  token: text().notNull(),
  userid: integer().notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  createdAt: timestamp({ mode: "date" }).notNull().defaultNow(),
  expiry: timestamp({ mode: "date" }).notNull()
});
export const aclsTable = pgTable("acls", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text().notNull(),
  allow: json().$type<string[]>().notNull().default([]),
  deny: json().$type<string[]>().notNull().default([])
});