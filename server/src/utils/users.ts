import crypto from "crypto";
import db from "./db.js";
import { usersTable } from "./schema.js";
import { eq } from "drizzle-orm";
import * as argon2 from "argon2";

export async function authUser(username: string, password: string): Promise<{ token: string } | { error: "server" | "not_found" | "wrong_password" }> {
  let user; 
  try {
    user = await db.select().from(usersTable).where(eq(usersTable.username, username)).limit(1);
  } catch (e) {
    console.error(`Database Error - ${e}`);
    return { error: "server" };
  }
  if (!user || user.length < 1 || !user[0]) return { error: "not_found" };
  try {
    if (!await argon2.verify(user[0].password, password)) return { error: "wrong_password" };
  } catch (e) {
    console.error(`Server Error - ${e}`);
    return { error: "server" };
  }
  const authToken = crypto.randomBytes(32).toString("base64url");
  return { token: authToken };
}