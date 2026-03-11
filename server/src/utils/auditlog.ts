import type z from "zod";
import db from "./db.js";
import { logsTable } from "./schema.js";
import type { Config } from "./config.js";

export type AuditAction = (
  `files-${"create" | "read" | "edit" | "delete" | "move"}` |
  `${"users" | "roles" | "acls"}-${"create" | "read" | "edit" | "delete"}` |
  "auth-login" |
  `config-${"read" | "edit"}`
);
export type AuditBody = Partial<{ filePath: string, oldFilePath: string, fileType: "file" | "folder" } | { id: number, accessLevel: "full" | "limited", newContents: unknown } | { authSuccess: boolean } | { newConfigItems: Partial<z.infer<typeof Config>> }>;

export async function writeLog(userID: number, username: string | null, action: AuditAction, body: AuditBody | null, blurb?: string) {
  try {
    await db.insert(logsTable).values({ userid: userID, username, action, blurb, body });
  } catch (e) {
    console.error(`Logging - Database Error - ${e}`);
    return;
  }
}
export async function readLogs(): Promise<{ userID: number, username: string | null, action: AuditAction, body: AuditBody | null, blurb: string, createdAt: Date }[] | { error: "server" }> {
  let logs;
  try {
    logs = await db.select({ userID: logsTable.userid, username: logsTable.username, action: logsTable.action, body: logsTable.body, blurb: logsTable.blurb, createdAt: logsTable.createdAt }).from(logsTable);
  } catch (e) {
    console.error(`Database Error - ${e}`);
    return { error: "server" };
  }
  return logs;
}