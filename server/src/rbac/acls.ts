import { eq, inArray } from "drizzle-orm";
import db from "../utils/db.js";
import { aclsTable } from "../utils/schema.js";
import path from "path";
import { getUser } from "../users/users.js";
import { getUserRoles } from "./roles.js";
import micromatch from "micromatch";
import { getConfig } from "../index.js";
import { getItemType } from "../core.js";

export async function getPaths(userID: number): Promise<{ allow: string[], deny: string[] } | { error: "server" | "not_found" }> {
  const user = await getUser(userID);
  if ("error" in user) return { error: user.error };
  const roles = await getUserRoles(userID);
  if ("error" in roles) return { error: roles.error };
  const aclIDs = new Set<number>([...user.acls]);
  for (const role of roles) for (const acl of role.acls) aclIDs.add(acl);
  let acls;
  try {
    acls = await db().select().from(aclsTable).where(inArray(aclsTable.id, [...aclIDs]));
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
export async function checkPath(userID: number, checkedPath: string): Promise<boolean> {
  const paths = await getPaths(userID);
  if ("error" in paths) return false;
  let allowed = false;
  const itemPath = path.normalize(checkedPath);
  if (itemPath === "/") return true;
  if (micromatch.isMatch(itemPath, getConfig()!.globalExclusions, { dot: true }) && !micromatch.isMatch(itemPath, getConfig()!.globalExclusionBypasses, { dot: true })) {
    const type = await getItemType(itemPath);
    let bypassExclusions = false;
    if (!("error" in type) && type.type === "folder") for (const prefix of getConfig()!.globalExclusionBypasses.map(glob => { return path.normalize(glob.split(/[*?[{\]]/, 1)[0]!); })) if (prefix === itemPath || prefix.startsWith(itemPath + "/")) bypassExclusions = true;
    if (!bypassExclusions) return false;
  }
  if (micromatch.isMatch(itemPath, paths.allow, { dot: true })) allowed = true;
  if (micromatch.isMatch(itemPath, paths.deny, { dot: true })) allowed = false;
  const itemType = await getItemType(itemPath);
  if (!allowed && !("error" in itemType) && itemType.type === "folder") {
    for (const prefix of paths.allow.map(glob => { return path.normalize(glob.split(/[*?[{\]]/, 1)[0]!); })) {
      if (prefix === itemPath || prefix.startsWith(itemPath + "/")) {
        allowed = true;
        break;
      }
    }
  }
  return allowed;
}
export async function createACL(name: string, { allow, deny }: { allow?: string[], deny?: string[] }): Promise<{ id: number } | { error: "server" }> {
  let acl;
  try {
    acl = await db().insert(aclsTable).values({ name, allow, deny }).returning({ id: aclsTable.id });
  } catch (e) {
    console.error(`Database Error - ${e}`);
    return { error: "server" };
  }
  if (!acl || !acl[0]) {
    console.error(`Server Error - ACL not returned by db() after creation`);
    return { error: "server" };
  }
  return { id: acl[0].id };
}
export async function getACL(aclID: number): Promise<{ name: string, allow: string[], deny: string[] } | { error: "server" | "not_found" }> {
  let acl;
  try {
    acl = await db().select({ name: aclsTable.name, allow: aclsTable.allow, deny: aclsTable.deny }).from(aclsTable).where(eq(aclsTable.id, aclID)).limit(1);
  } catch (e) {
    console.error(`Database Error - ${e}`);
    return { error: "server" };
  }
  if (!acl || acl.length < 1 || !acl[0]) return { error: "not_found" };
  return acl[0];
}
export async function editACL(aclID: number, { name, allow, deny }: { name?: string, allow?: string[], deny?: string[] }): Promise<{ success: boolean } | { error: "server" | "not_found" }> {
  try {
    const acl = await db().update(aclsTable).set({ name, allow, deny }).where(eq(aclsTable.id, aclID)).returning({ id: aclsTable.id });
    if (!acl || acl.length < 1) return { error: "not_found" };
  } catch (e) {
    console.error(`Database Error - ${e}`);
    return { error: "server" };
  }
  return { success: true };
}
export async function deleteACL(aclID: number): Promise<{ success: boolean } | { error: "server" | "not_found" }> {
  try {
    const acl = await db().delete(aclsTable).where(eq(aclsTable.id, aclID)).returning({ id: aclsTable.id });
    if (!acl || acl.length < 1) return { error: "not_found" };
    return { success: true };
  } catch (e) {
    console.error(`Database Error - ${e}`);
    return { error: "server" };
  }
}
export async function getAllACLs(): Promise<{ id: number, name: string }[] | { error: "server" }> {
  try {
    return await db().select({ id: aclsTable.id, name: aclsTable.name }).from(aclsTable);
  } catch (e) {
    console.error(`Database Error - ${e}`);
    return { error: "server" };
  }
}