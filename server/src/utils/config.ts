import * as z from "zod";
import path from "path";
import fs from "fs/promises";

export const Config = z.object({
  database: z.string()
});
export default async function getConfig(configPath?: string): Promise<z.Infer<typeof Config>> {
  if (!configPath) configPath = "/etc/folderharbor/config.json";
  // if (!fs.existsSync(configPath)) {}
  const configFile = await fs.readFile(configPath, "utf8");
  try {
    return Config.parse(JSON.parse(configFile));
  } catch (e) {
    console.error(`Config is malformed!\n${e}`);
    process.exit(1);
  }
}