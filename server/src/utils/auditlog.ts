import type z from "zod";
import db from "./db.js";
import { logsTable } from "./schema.js";
import type { Config } from "./config.js";

export type AuditAction = (
  `files-${"create" | "read" | "edit" | "delete" | "move"}` |
  `${"users" | "roles" | "acls"}-${"create" | "read" | "edit" | "delete"}` |
  `auth-${"login" | "logout" | "edit"}` |
  `config-${"read" | "edit"}`
);
export type AuditBody = Partial<{ filePath: string, oldPath: string } | { id: number, newContents: unknown } | { newConfigItems: Partial<z.infer<typeof Config>> }>;

export async function writeLog(userID: number, action: AuditAction, success: boolean, body: AuditBody | null): Promise<{ success: true } | { error: "server" }> {
  try {
    await db.insert(logsTable).values({ userid: userID, action, success, body });
    return { success: true };
  } catch (e) {
    console.error(`Database Error - ${e}`);
    return { error: "server" };
  }
}
export async function readLogs(): Promise<{ userID: number, action: AuditAction, body: AuditBody | null, createdAt: Date }[] | { error: "server" }> {
  let logs;
  try {
    logs = await db.select({ userID: logsTable.userid, action: logsTable.action, body: logsTable.body, createdAt: logsTable.createdAt }).from(logsTable);
  } catch (e) {
    console.error(`Database Error - ${e}`);
    return { error: "server" };
  }
  return logs;
}