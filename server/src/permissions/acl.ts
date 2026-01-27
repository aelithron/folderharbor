import { eq } from "drizzle-orm";
import db from "../utils/db.js";
import { aclsTable, usersTable } from "../utils/schema.js";

export async function getPaths(userid: number): Promise<{ allow: string[], deny: string[] } | { error: "server" | "not_found" | "locked" }> {
  let acls;
  let user;
  try {
    acls = await db.select().from(aclsTable);
    user = await db.select().from(usersTable).where(eq(usersTable.id, userid));
  } catch (e) {
    console.error(`Database Error - ${e}`);
    return { error: "server" };
  }
  if (!user || !user[0]) return { error: "not_found" };
  if (user[0].locked) return { error: "locked" };
  for (const id of user[0].acls) {
    
  }
}