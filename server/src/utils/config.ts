import * as z from "zod";
import path from "path";
import fs from "fs";

const Config = z.object({
  database: z.string()
});
export default function getConfig(configPath?: string): z.Infer<typeof Config> {
  if (!configPath) configPath = "/etc/folderharbor/config.json";
  if (!fs.existsSync(configPath)) {
    
  }
  try {
    return Config.parse(JSON.parse())
  }
}