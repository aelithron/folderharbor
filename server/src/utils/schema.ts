import { boolean, integer, json, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import type { Permission } from "../permissions/permissions.js";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  username: text().unique().notNull(),
  password: text().notNull(),
  roles: integer().array().notNull().default([]),
  permissions: text().array().notNull().default([]).$type<Permission[]>(),
  acls: integer().array().notNull().default([]),
  locked: boolean().default(false).notNull(),
  failedLogins: integer().default(0).notNull(),
  resetFailedLogins: timestamp({ mode: "date", withTimezone: true }),
});
export const rolesTable = pgTable("roles", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text().notNull(),
  permissions: text().array().notNull().default([]).$type<Permission[]>(),
  acls: integer().array().default([]).notNull()
});
export const sessionsTable = pgTable("sessions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  token: text().notNull(),
  userid: integer().notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  createdAt: timestamp({ mode: "date", withTimezone: true }).notNull().defaultNow(),
  expiry: timestamp({ mode: "date", withTimezone: true }).notNull()
});
export const aclsTable = pgTable("acls", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text().notNull(),
  allow: json().$type<string[]>().notNull().default([]),
  deny: json().$type<string[]>().notNull().default([])
});