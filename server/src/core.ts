import fs from "fs/promises";
import path from "path";
import { getPaths } from "./rbac/acls.js";
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
    if (micromatch.isMatch(itemPath, paths.allow, { dot: true })) allowed = true;
    if (micromatch.isMatch(itemPath, paths.deny, { dot: true }) || micromatch.isMatch(itemPath, getConfig()!.globalExclusions)) allowed = false;
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
export async function readFile(userID: number, providedPath: string): Promise<{ contents: Buffer } | { error: "server" | "not_found" | "not_allowed" | "invalid_path" | "is_folder" }> {
  const itemPath = path.normalize(providedPath);
  const paths = await getPaths(userID);
  if ("error" in paths) return { error: paths.error };
  let allowed = false;
  if (micromatch.isMatch(itemPath, paths.allow, { dot: true })) allowed = true;
  if (micromatch.isMatch(itemPath, paths.deny, { dot: true })) allowed = false;
  if (!allowed) return { error: "not_allowed" };
  try {
    if ((await fs.stat(itemPath)).isDirectory()) return { error: "is_folder" };
  } catch (e) {
    // @ts-expect-error - e is unknown but is an error actually
    if (e.code as string === "ENOENT") return { error: "invalid_path" };
    console.error(`Server Error - Couldn't access item at path "${itemPath}" for user ID ${userID} - Error: ${e}`);
    return { error: "server" };
  }
  const file = await fs.readFile(itemPath);
  return { contents: file };
}
export async function getItemType(providedPath?: string): Promise<{ type: "folder" | "file" } | { error: "server" | "invalid_path" }> {
  if (!providedPath) providedPath = "/";
  try {
    const stat = await fs.stat(path.normalize(providedPath));
    if (stat.isDirectory()) return { type: "folder" };
    return { type: "file" };
  } catch (e) {
    // @ts-expect-error - e is unknown but is an error actually
    if (e.code as string === "ENOENT") return { error: "invalid_path" };
    console.error(`Server Error - Couldn't access item at path "${path.normalize(providedPath)}" - Error: ${e}`);
    return { error: "server" };
  }
}
export async function writeFile(userID: number, providedPath: string, contents: string): Promise<{ success: true } | { error: "server" | "not_found" | "not_allowed" | "is_folder" }> {
  const itemPath = path.normalize(providedPath);
  const paths = await getPaths(userID);
  if ("error" in paths) return { error: paths.error };
  let allowed = false;
  if (micromatch.isMatch(itemPath, paths.allow, { dot: true })) allowed = true;
  if (micromatch.isMatch(itemPath, paths.deny, { dot: true })) allowed = false;
  if (!allowed) return { error: "not_allowed" };
  try {
    if ((await fs.stat(itemPath)).isDirectory()) return { error: "is_folder" };
  } catch (e) {
    // @ts-expect-error - e is unknown but is an error actually
    if (e.code as string !== "ENOENT") {
      console.error(`Server Error - Couldn't access item at path "${itemPath}" for user ID ${userID} - Error: ${e}`);
      return { error: "server" };
    }
  }
  await fs.writeFile(itemPath, contents);
  return { success: true };
}
export async function createFolder(userID: number, providedPath: string): Promise<{ success: true } | { error: "server" | "not_found" | "not_allowed" | "already_exists" }> {
  const itemPath = path.normalize(providedPath);
  const paths = await getPaths(userID);
  if ("error" in paths) return { error: paths.error };
  let allowed = false;
  if (micromatch.isMatch(itemPath, paths.allow, { dot: true })) allowed = true;
  if (micromatch.isMatch(itemPath, paths.deny, { dot: true })) allowed = false;
  if (!allowed) return { error: "not_allowed" };
  try {
    if (await fs.stat(itemPath)) return { error: "already_exists" };
  } catch (e) {
    // @ts-expect-error - e is unknown but is an error actually
    if (e.code as string !== "ENOENT") {
      console.error(`Server Error - Couldn't access item at path "${itemPath}" for user ID ${userID} - Error: ${e}`);
      return { error: "server" };
    }
  }
  await fs.mkdir(itemPath);
  return { success: true };
}
export async function deleteItem(userID: number, providedPath: string): Promise<{ success: true } | { error: "server" | "not_found" | "not_allowed" | "invalid_path" | "subitem_not_allowed" }> {
  const itemPath = path.normalize(providedPath);
  const paths = await getPaths(userID);
  if ("error" in paths) return { error: paths.error };
  let allowed = false;
  if (micromatch.isMatch(itemPath, paths.allow, { dot: true })) allowed = true;
  if (micromatch.isMatch(itemPath, paths.deny, { dot: true })) allowed = false;
  if (!allowed) return { error: "not_allowed" };
  if ((await fs.stat(itemPath)).isDirectory()) {
    const allItems = await fs.readdir(itemPath, { withFileTypes: true });
    for (const item of allItems) {
      let allowed = false;
      const subItemPath = path.normalize(path.join(item.parentPath, item.name));
      if (micromatch.isMatch(subItemPath, getConfig()!.globalExclusions)) return { error: "subitem_not_allowed" };
      if (micromatch.isMatch(subItemPath, paths.allow, { dot: true })) allowed = true;
      if (micromatch.isMatch(subItemPath, paths.deny, { dot: true })) allowed = false;
      if (!allowed) return { error: "subitem_not_allowed" };
    }
    await fs.rm(itemPath, { recursive: true });
  } else {
    await fs.rm(itemPath);
  }
  return { success: true };
}
export async function moveItem(userID: number, providedOldPath: string, providedNewPath: string): Promise<{ success: true } | { error: "server" | "not_found" | "old_not_allowed" | "new_not_allowed" | "old_invalid" | "new_used" }> {
  const oldPath = path.normalize(providedOldPath);
  const newPath = path.normalize(providedNewPath);
  const paths = await getPaths(userID);
  if ("error" in paths) return { error: paths.error };
  let oldAllowed = false;
  let newAllowed = false;
  if (micromatch.isMatch(oldPath, paths.allow, { dot: true })) oldAllowed = true;
  if (micromatch.isMatch(oldPath, paths.deny, { dot: true })) oldAllowed = false;
  if (micromatch.isMatch(newPath, paths.allow, { dot: true })) newAllowed = true;
  if (micromatch.isMatch(newPath, paths.deny, { dot: true })) newAllowed = false;
  if (!oldAllowed) return { error: "old_not_allowed" };
  if (!newAllowed) return { error: "new_not_allowed" };
  try {
    await fs.stat(oldPath);
  } catch (e) {
    // @ts-expect-error - e is unknown but is an error actually
    if (e.code as string === "ENOENT") return { error: "old_invalid" };
    console.error(`Server Error - Couldn't access item at path "${oldPath}" for user ID ${userID} - Error: ${e}`);
    return { error: "server" };
  }
  try {
    if (await fs.stat(newPath)) return { error: "new_used" };
  } catch (e) {
    // @ts-expect-error - e is unknown but is an error actually
    if (e.code as string !== "ENOENT") {
      console.error(`Server Error - Couldn't access item at path "${newPath}" for user ID ${userID} - Error: ${e}`);
      return { error: "server" };
    }
  }
  await fs.rename(oldPath, newPath);
  return { success: true };
}