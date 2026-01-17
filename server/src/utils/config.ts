import * as z from "zod";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";

export const Config = z.object({
  database: z.string()
});
export default async function getConfig(configPath?: string): Promise<z.Infer<typeof Config>> {
  if (!configPath) configPath = "/etc/folderharbor/config.json";
  try {
    await fs.access(configPath, fs.constants.R_OK);
  } catch {
    if (configPath === "/etc/folderharbor/config.json") {
      console.warn("Default config is missing, copying...");
      await fs.copyFile(path.join(path.dirname(fileURLToPath(import.meta.url)), "../../example.config.json"), configPath, fs.constants.COPYFILE_EXCL);
    } else {
      throw new Error("Location couldn't be found!");
    }
  }
  const configFile = await fs.readFile(configPath, "utf8");
  try {
    return Config.parse(JSON.parse(configFile));
  } catch (e) {
    console.error(`Config is malformed!\n${e}`);
    process.exit(1);
  }
}