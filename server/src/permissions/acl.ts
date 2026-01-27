import { eq, inArray } from "drizzle-orm";
import db from "../utils/db.js";
import { aclsTable, rolesTable, usersTable } from "../utils/schema.js";

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
  for (const id of aclIDs) {
    console.log(acls.find((acl) => acl.id === id));
  }
}