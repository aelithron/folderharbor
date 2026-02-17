import db from "../utils/db.js";
import { usersTable } from "../utils/schema.js";
import { eq } from "drizzle-orm";
import * as argon2 from "argon2";
import { type Permission } from "../permissions/permissions.js";

export async function createUser(username: string, password: string, { roles, acls, permissions, locked }: { roles?: number[], acls?: number[], permissions?: Permission[], locked?: boolean }): Promise<{ id: number } | { error: "server" | "username_used" }> {
  try {
    const userCheck = await db.select().from(usersTable).where(eq(usersTable.username, username)).limit(1);
    if (userCheck.length >= 1) return { error: "username_used" };
  } catch (e) {
    console.error(`Database Error - ${e}`);
    return { error: "server" };
  }
  const hash = await argon2.hash(password);
  let newUser;
  try {
    newUser = await db.insert(usersTable).values({ username: username, password: hash, locked, permissions, acls, roles }).returning();
  } catch (e) {
    console.error(`Database Error - ${e}`);
    return { error: "server" };
  }
  if (!newUser || !newUser[0]) {
    console.error(`Server Error - User not returned by database after creation`);
    return { error: "server" };
  }
  return { id: newUser[0].id };
}
export async function getUser(userID: number): Promise<{ username: string, roles: number[], permissions: Permission[], acls: number[], locked: boolean, failedLogins: number } | { error: "server" | "not_found" }> {
  let user;
  try {
    user = await db.select({ username: usersTable.username, roles: usersTable.roles, permissions: usersTable.permissions, acls: usersTable.acls, locked: usersTable.locked, failedLogins: usersTable.failedLogins }).from(usersTable).where(eq(usersTable.id, userID)).limit(1);
  } catch (e) {
    console.error(`Database Error - ${e}`);
    return { error: "server" };
  }
  if (!user || user.length < 1 || !user[0]) return { error: "not_found" };
  return user[0];
}
export async function editUser(userID: number, { username, password, locked, roles, permissions, acls, clearLoginAttempts }: { username?: string, password?: string, locked?: boolean, roles?: number[], permissions?: Permission[], acls?: number[], clearLoginAttempts?: boolean }): Promise<{ success: boolean } | { error: "server" | "not_found" | "username_used" }> {
  try {
    if (username) {
      const userCheck = await db.select().from(usersTable).where(eq(usersTable.username, username)).limit(1);
      if (userCheck.length >= 1 && userCheck[0]!.id !== userID) return { error: "username_used" };
    }
    const user = await db.update(usersTable).set({ username, password: (password ? await argon2.hash(password) : undefined), locked, roles, permissions, acls, failedLogins: (clearLoginAttempts ? 0 : undefined), resetFailedLogins: (clearLoginAttempts ? null : undefined) }).where(eq(usersTable.id, userID)).returning();
    if (!user || user.length < 1) return { error: "not_found" };
  } catch (e) {
    console.error(`Database Error - ${e}`);
    return { error: "server" };
  }
  return { success: true };
}
export async function deleteUser(userID: number): Promise<{ success: boolean } | { error: "server" | "not_found" }> {
  try {
    const user = await db.delete(usersTable).where(eq(usersTable.id, userID)).returning({ id: usersTable.id });
    if (!user || user.length < 1) return { error: "not_found" };
    return { success: true };
  } catch (e) {
    console.error(`Database Error - ${e}`);
    return { error: "server" };
  }
}
export async function getAllUsers(): Promise<{ id: number, username: string }[] | { error: "server" }> {
  try {
    return await db.select({ id: usersTable.id, username: usersTable.username }).from(usersTable);
  } catch (e) {
    console.error(`Database Error - ${e}`);
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