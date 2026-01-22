import { pgTable, text } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  username: text().primaryKey(),
  password: text().notNull()
});