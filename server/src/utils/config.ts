import * as z from "zod";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import { getConfig, setConfig } from "../index.js";

export const Config = z.object({
  apiPort: z.int().positive(),
  failedLoginLimit: z.int().positive().default(5),
  selfUsernameChanges: z.boolean().default(true),
  globalExclusions: z.array(z.string()).readonly()
});
export default async function loadConfig(allowPermissive: boolean, configPath?: string): Promise<z.Infer<typeof Config>> {
  if (!configPath) configPath = "/etc/folderharbor/config.json";
  try {
    await fs.access(configPath, fs.constants.F_OK);
  } catch {
    if (configPath === "/etc/folderharbor/config.json") {
      console.warn("Default config is missing, copying...");
      await fs.mkdir(path.dirname(configPath), { recursive: true });
      await fs.copyFile(path.join(path.dirname(fileURLToPath(import.meta.url)), "../../example.config.json"), configPath, fs.constants.COPYFILE_EXCL);
      if (process.getuid && process.getgid) await fs.chown(configPath, process.getuid(), process.getgid());
      await fs.chmod(configPath, 0o600);
    } else {
      throw new Error("Passed config path couldn't be found!");
    }
  }
  try {
    await fs.access(configPath, fs.constants.R_OK | fs.constants.W_OK);
  } catch {
    throw new Error(`The config file (${configPath}) cannot be read from and/or written to by FolderHarbor. Please check that the file's permissions are correctly set (chmod 600 and owned by this user).`);
  }
  if (!allowPermissive && process.getuid) {
    const info = await fs.stat(configPath);
    if (info.uid !== process.getuid() || (info.mode & 0o777) !== 0o600) throw new Error(`The config file (${configPath}) is overly permissive, meaning it could be read or modified by another user.\nTo fix this, set chmod 600 on the config and change the owner to this user (user ID ${process.getuid()}).\nAlternatively, if you know what you're doing, you can override this check with the "--allow-permissive-config" argument.`);
  }
  const configFile = await fs.readFile(configPath, "utf8");
  try {
    return Config.parse(JSON.parse(configFile));
  } catch (e) {
    throw new Error(`The config file (${configPath}) was incorrectly formatted!\n${e}`);
  }
}
export async function editConfig(newConfig: Partial<z.Infer<typeof Config>>, configPath?: string): Promise<{ success: true } | { error: "malformed", message: string } | { error: "config_unloaded" | "editing_readonly" | "unwriteable" }> {
  const oldConfig = getConfig();
  if (!oldConfig) {
    console.error("Server Error - The config isn't loaded, but was attempted to be edited!");
    return { error: "config_unloaded" };
  }
  if (newConfig.globalExclusions) return { error: "editing_readonly" };
  let config;
  try {
    config = Config.parse({ ...oldConfig, ...newConfig });
  } catch (e) { return { error: "malformed", message: `${e}` }; }
  if (!configPath) configPath = "/etc/folderharbor/config.json";
  await fs.writeFile(configPath, JSON.stringify(config));
  setConfig(config);
  return { success: true };
}