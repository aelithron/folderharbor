import { inArray } from "drizzle-orm";
import { getUser } from "../users/users.js";
import { rolesTable } from "../utils/schema.js";
import db from "../utils/db.js";

export const permissions: { id: `${"users" | "sessions" | "roles" | "acls" | "config"}:${string}`, description: string }[] = [
  { id: "users:create", description: "Create new users" },
  { id: "users:read", description: "Read users' information (to a limited degree)" },
  { id: "users:read.full", description: "Read users' full information" },
  { id: "users:edit", description: "Modify the information of other users" },
  { id: "users:delete", description: "Delete users" },
  { id: "users:lock", description: "Block/unblock a user from logging in" },
  
  { id: "roles:create", description: "Create new roles" },
  { id: "roles:read", description: "Read role details" },
  { id: "roles:edit", description: "Modify role details" },
  { id: "roles:delete", description: "Delete roles" },
  { id: "roles:list", description: "Get a list of role names and IDs" },

  { id: "acls:create", description: "Create new ACLs" },
  { id: "acls:read", description: "Read ACLs and their paths" },
  { id: "acls:edit", description: "Modify ACL names and paths" },
  { id: "acls:delete", description: "Delete ACLs" },
  { id: "acls:list", description: "Get a list of ACL names and IDs" }
];
export type Permission = (typeof permissions)[number]["id"];
export async function checkPermission(userID: number, permission: Permission): Promise<boolean | { error: "server" | "not_found" }> {
  const user = await getUser(userID);
  if ("error" in user) return { error: user.error };
  let roles;
  try {
    roles = await db.select().from(rolesTable).where(inArray(rolesTable.id, user.roles));
  } catch (e) {
    console.error(`Database Error - ${e}`);
    return { error: "server" };
  }
  
}