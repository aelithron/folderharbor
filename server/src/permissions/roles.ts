import db from "../utils/db.js";
import { rolesTable } from "../utils/schema.js";
import { eq } from "drizzle-orm";

export async function createRole(name: string, acls?: number[]): Promise<{ id: number } | { error: "server" }> {
  let role;
  try {
    role = await db.insert(rolesTable).values({ name, acls }).returning();
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
export async function getRole(roleID: number): Promise<{ name: string, acls: number[] } | { error: "server" | "not_found" }> {
  let role;
  try {
    role = await db.select({ name: rolesTable.name, acls: rolesTable.acls }).from(rolesTable).where(eq(rolesTable.id, roleID)).limit(1);
  } catch (e) {
    console.error(`Database Error - ${e}`);
    return { error: "server" };
  }
  if (!role || role.length < 1 || !role[0]) return { error: "not_found" };
  return role[0];
}
export async function editRole(roleID: number, { name, acls }: { name?: string, acls?: number[] }): Promise<{ success: boolean } | { error: "server" | "not_found" }> {
  try {
    const role = await db.update(rolesTable).set({ name, acls }).where(eq(rolesTable.id, roleID)).returning();
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