import fs from "fs/promises";
import path from "path";
import { getPaths } from "./permissions/acls.js";
import type { Dirent } from "fs";
import micromatch from "micromatch";

export async function listDir(userID: number, dirPath?: string): Promise<{ items: Dirent[] } | { error: "server" | "not_found" | "invalid_path" }> {
  if (!dirPath) dirPath = "/";
  const paths = await getPaths(userID);
  if ("error" in paths) return { error: paths.error };
  const pathPrefixes = paths.allow.map(glob => { return path.normalize(glob.split(/[*?[{\]]/, 1)[0]!); });
  const allItems = await fs.readdir(path.normalize(dirPath), { withFileTypes: true });
  const items = [];
  for (const item of allItems) {
    let allowed = false;
    const itemPath = path.normalize(path.join(item.parentPath, item.name));
    if (micromatch.isMatch(itemPath, paths.allow, { dot: true })) allowed = true;
    if (micromatch.isMatch(itemPath, paths.deny, { dot: true })) allowed = false;
    if (item.isDirectory() && !allowed) {
      for (const prefix of pathPrefixes) {
        if (prefix === itemPath || prefix.startsWith(itemPath + "/")) {
          allowed = true;
          break;
        }
      }
    }
    if (allowed) items.push(item);
  }
  return { items };
}