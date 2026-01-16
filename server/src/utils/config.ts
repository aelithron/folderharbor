import * as z from "zod";
import path from "path";
import fs from "fs/promises";

export const Config = z.object({
  database: z.string()
});
export default async function getConfig(configPath?: string): Promise<z.Infer<typeof Config>> {
  if (!configPath) configPath = "/etc/folderharbor/config.json";
  // if (!fs.existsSync(configPath)) {}
  await fs.access(configPath);
  try {
    return Config.parse(JSON.parse());
  } catch {
    process.exit(1);
  }
}