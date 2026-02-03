import db from "../utils/db.js";
import { rolesTable } from "../utils/schema.js";
import { eq, inArray } from "drizzle-orm";
import type { Permission } from "./permissions.js";
import { getUser } from "../users/users.js";

export async function createRole(name: string, { permissions, acls }: { permissions?: Permission[], acls?: number[] }): Promise<{ id: number } | { error: "server" }> {
  let role;
  try {
    role = await db.insert(rolesTable).values({ name, permissions, acls }).returning();
  } catch (e) {
    console.error(`Database Error - ${e}`);
    return { error: "server" };
  }
  if (!role || !role[0]) {
    console.error("Server Error - Role not returned from db after creation");
    return { error: "server" };
  }
  return { id: role[0].id };
}
export async function getRole(roleID: number): Promise<{ name: string, permissions: Permission[], acls: number[] } | { error: "server" | "not_found" }> {
  let role;
  try {
    role = await db.select({ name: rolesTable.name, permissions: rolesTable.permissions, acls: rolesTable.acls }).from(rolesTable).where(eq(rolesTable.id, roleID)).limit(1);
  } catch (e) {
    console.error(`Database Error - ${e}`);
    return { error: "server" };
  }
  if (!role || role.length < 1 || !role[0]) return { error: "not_found" };
  return role[0];
}
export async function editRole(roleID: number, { name, permissions, acls }: { name?: string, permissions?: Permission[], acls?: number[] }): Promise<{ success: boolean } | { error: "server" | "not_found" }> {
  try {
    const role = await db.update(rolesTable).set({ name, permissions, acls }).where(eq(rolesTable.id, roleID)).returning();
    if (!role || role.length < 1) return { error: "not_found" };
  } catch (e) {
    console.error(`Database Error - ${e}`);
    return { error: "server" };
  }
  return { success: true };
}
export async function deleteRole(roleID: number): Promise<{ success: boolean } | { error: "server" | "not_found" }> {
  try {
    const role = await db.delete(rolesTable).where(eq(rolesTable.id, roleID)).returning();
    if (!role || role.length < 1) return { error: "not_found" };
  } catch (e) {
    console.error(`Database Error - ${e}`);
    return { error: "server" };
  }
  return { success: true };
}
export async function getUserRoles(userID: number): Promise<{ id: number, name: string, permissions: Permission[], acls: number[] }[] | { error: "server" | "not_found" }> {
  const user = await getUser(userID);
  if ("error" in user) return { error: user.error };
  let roles;
  try {
    roles = await db.select().from(rolesTable).where(inArray(rolesTable.id, user.roles));
  } catch (e) {
    console.error(`Database Error - ${e}`);
    return { error: "server" };
  }
  return roles;
}