import { eq, inArray } from "drizzle-orm";
import db from "../utils/db.js";
import { aclsTable, rolesTable, usersTable } from "../utils/schema.js";
import path from "path";

export async function getPaths(userid: number): Promise<{ allow: string[], deny: string[] } | { error: "server" | "not_found" }> {
  let user;
  try {
    user = await db.select().from(usersTable).where(eq(usersTable.id, userid));
  } catch (e) {
    console.error(`Database Error - ${e}`);
    return { error: "server" };
  }
  if (!user || !user[0]) return { error: "not_found" };
  const aclIDs = new Set<number>([...user[0].acls]);
  let roles;
  let acls;
  try {
    roles = await db.select().from(rolesTable).where(inArray(rolesTable.id, user[0].roles));
    for (const role of roles) for (const acl of role.acls) aclIDs.add(acl);
    acls = await db.select().from(aclsTable).where(inArray(aclsTable.id, [...aclIDs]));
  } catch (e) {
    console.error(`Database Error - ${e}`);
    return { error: "server" };
  }
  const allow = new Set<string>();
  const deny = new Set<string>();
  for (const id of aclIDs) {
    const acl = acls.find((acl) => acl.id === id);
    if (!acl) continue;
    for (const path of acl.allow) allow.add(path);
    for (const path of acl.deny) deny.add(path);
  }
  return { allow: [...allow], deny: [...deny] };
}
export async function checkPath(userid: number, checkedPath: string): Promise<boolean> {
  const paths = await getPaths(userid);
  if ((paths as { error: string }).error) return false;
  let allowed: boolean = false;
  for (const allowedPath of (paths as { allow: string[], deny: string[] }).allow) {
    if (path.matchesGlob(checkedPath, allowedPath)) {
      allowed = true;
      break;
    }
  }
  for (const deniedPath of (paths as { allow: string[], deny: string[] }).deny) {
    if (path.matchesGlob(checkedPath, deniedPath)) {
      allowed = false;
      break;
    }
  }
  return allowed;
}
export async function createACL(name: string, allow: string[], deny: string[]): Promise<{ id: number } | { error: "server" }> {
  let acl;
  try {
    acl = await db.insert(aclsTable).values({ name, allow: [...(new Set(...allow))], deny: [...(new Set(...deny))] }).returning();
  } catch (e) {
    console.error(`Database Error - ${e}`);
    return { error: "server" };
  }
  if (!acl || !acl[0]) {
    console.error(`Server Error - User not returned by database after creation`);
    return { error: "server" };
  }
  return { id: acl[0].id };
}