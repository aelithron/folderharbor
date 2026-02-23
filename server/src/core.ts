import fs from "fs/promises";
import path from "path";
import { getPaths } from "./permissions/acls.js";
import micromatch from "micromatch";
import { getConfig } from "./index.js";

export async function listDir(userID: number, dirPath?: string): Promise<{ items: { name: string, path: string, type: "file" | "folder" }[] } | { error: "server" | "not_found" }> {
  if (!dirPath) dirPath = "/";
  const paths = await getPaths(userID);
  if ("error" in paths) return { error: paths.error };
  const allItems = await fs.readdir(path.normalize(dirPath), { withFileTypes: true });
  const items = [];
  for (const item of allItems) {
    let allowed = false;
    const itemPath = path.normalize(path.join(item.parentPath, item.name));
    if (micromatch.isMatch(itemPath, getConfig()!.globalExclusions)) continue;
    if (micromatch.isMatch(itemPath, paths.allow, { dot: true })) allowed = true;
    if (micromatch.isMatch(itemPath, paths.deny, { dot: true })) allowed = false;
    if (item.isDirectory() && !allowed) {
      for (const prefix of paths.allow.map(glob => { return path.normalize(glob.split(/[*?[{\]]/, 1)[0]!); })) {
        if (prefix === itemPath || prefix.startsWith(itemPath + "/")) {
          allowed = true;
          break;
        }
      }
    }
    if (allowed) items.push({ name: item.name, path: path.join(item.parentPath, item.name), type: item.isDirectory() ? "folder" : "file" as "folder" | "file" });
  }
  return { items };
}
export async function readFile(userID: number, providedPath: string): Promise<{ contents: string } | { error: "server" | "not_found" | "not_allowed" | "invalid_path" | "is_folder" }> {
  const itemPath = path.normalize(providedPath);
  const paths = await getPaths(userID);
  if ("error" in paths) return { error: paths.error };
  let allowed = false;
  if (micromatch.isMatch(itemPath, paths.allow, { dot: true })) allowed = true;
  if (micromatch.isMatch(itemPath, paths.deny, { dot: true })) allowed = false;
  if (allowed === false) return { error: "not_allowed" };
  try {
    if ((await fs.stat(itemPath)).isDirectory()) return { error: "is_folder" };
  } catch (e) {
    // @ts-expect-error - e is unknown but is an error actually
    if (e.code as string === "ENOENT") return { error: "invalid_path" };
    console.error(`Server Error - Couldn't access file at path "${itemPath}" for user ID ${userID} - Error: ${e}`);
    return { error: "server" };
  }
  const file = await fs.readFile(itemPath);
  return { contents: file.toString() };
}