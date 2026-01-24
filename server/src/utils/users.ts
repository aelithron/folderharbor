import crypto from "crypto";
import db from "./db.js";
import { sessionsTable, usersTable } from "./schema.js";
import { eq } from "drizzle-orm";
import * as argon2 from "argon2";
import { DateTime } from "luxon";

export async function createUser(username: string, password: string): Promise<{ success: boolean, code?: "server" | "username_used" }> {
  try {
    const userCheck = await db.select().from(usersTable).where(eq(usersTable.username, username)).limit(1);
    if (userCheck.length >= 1) return { success: false, code: "username_used" };
  } catch (e) {
    console.error(`Database Error - ${e}`);
    return { success: false, code: "server" };
  }
  const hash = await argon2.hash(password);
  try {
    await db.insert(usersTable).values({ username: username, password: hash });
  } catch (e) {
    console.error(`Database Error - ${e}`);
    return { success: false, code: "server" };
  }
  return { success: true };
}

export async function getSession(token: string): Promise<{ user: string, sessionID: number } | { error: "server" | "invalid" | "expired" }> {
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  let session;
  try {
    session = await db.select().from(sessionsTable).where(eq(sessionsTable.token, tokenHash));
  } catch (e) {
    console.error(`Database Error - ${e}`);
    return { error: "server" };
  }
  if (!session || session.length < 1 || !session[0]) return { error: "invalid" };
  if (session[0].expiry.getTime() < new Date().getTime()) {
    try {
      await db.delete(sessionsTable).where(eq(sessionsTable.id, session[0].id));
    } catch (e) {
      console.error(`Database Error - ${e}`);
      return { error: "server" };
    }
    return { error: "expired" };
  }
  return { user: session[0].username, sessionID: session[0].id };
}
export async function createSession(username: string, password: string): Promise<{ token: string } | { error: "server" | "not_found" | "wrong_password" }> {
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
  const token = crypto.randomBytes(32).toString("base64url");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  try {
    await db.insert(sessionsTable).values({ token: tokenHash, username: user[0].username, expiry: DateTime.now().plus({ weeks: 1 }).toJSDate() });
  } catch (e) {
    console.error(`Database Error - ${e}`);
    return { error: "server" };
  }
  return { token };
}
export async function revokeSession(id: number): Promise<{ success: boolean } | { error: "server" | "not_found" }> {
  try {
    const session = await db.delete(sessionsTable).where(eq(sessionsTable.id, id)).returning({ id: sessionsTable.id });
    if (session.length < 1) return { error: "not_found" };
    return { success: true };
  } catch (e) {
    console.error(`Server Error - ${e}`);
    return { error: "server" };
  }
}
/*
  // auth test thingy
  console.log(await createUser("test", "test123"));
  const result = await createSession("test", "test123");
  console.log(result);
  const authResult = await getSession((result as { token: string }).token);
  console.log(authResult);
  console.log(await revokeSession((authResult as { sessionID: number }).sessionID));
*/