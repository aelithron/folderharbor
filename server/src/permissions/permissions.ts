import { getUser } from "../users/users.js";
import { getUserRoles } from "./roles.js";

export const permissions: { id: `${"users" | "roles" | "acls" | "config"}:${string}`, description: string }[] = [
  { id: "users:create", description: "Create new users" },
  { id: "users:read", description: "Read users' information (to a limited degree)" },
  { id: "users:read.full", description: "Read users' full information" },
  { id: "users:edit", description: "Modify limited information of other users" },
  { id: "users:edit.full", description: "Modify the full information of other users" },
  { id: "users:delete", description: "Delete users" },
  { id: "users:grant", description: "Gtant permissions and roles to users" },
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
  { id: "acls:list", description: "Get a list of ACL names and IDs" },

  { id: "config:read", description: "Read config settings" },
  { id: "config:write", description: "Change most config settings (not global exclusions)" }
];
export type Permission = (typeof permissions)[number]["id"];
export async function checkPermission(userID: number, permission: Permission): Promise<boolean | { error: "server" | "not_found" }> {
  const user = await getUser(userID);
  if ("error" in user) return { error: user.error };
  if (user.permissions.find((userPerm) => userPerm === permission)) return true;
  const roles = await getUserRoles(userID);
  if ("error" in roles) return { error: roles.error };
  for (const role of roles) if (role.permissions.find((userPerm) => userPerm === permission)) return true;
  return false;
}