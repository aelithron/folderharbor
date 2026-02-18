import { program } from "commander";
import type z from "zod";
import path from "path";
import loadConfig, { Config } from "./utils/config.js";
import startAPI from "./api/api.js";
import type { Server } from "http";
import dotenv from "dotenv";

let config: z.Infer<typeof Config>;
let configPath: string | undefined;
let api: Server;
program
  .name("folderharbor").description("A powerful file server that supports many protocols")
  .option("-c, --config <path>", "path to server config")
  .option("--allow-root-user", "allow the server to run as root (this can cause security risks!)")
  .option("--allow-permissive-config", "allow the server to load a configuration that is overly permissive");
async function startServer() {
  await program.parseAsync();
  if ((process.getuid && process.getgid) && (process.getuid() === 0 || process.getgid() === 0) && !program.opts().allowRootUser) {
    console.error('You started FolderHarbor as root! This is a security risk.\nIf you understand the risks, you can override this check with the "--allow-root-user" argument.');
    process.exit(1);
  }
  console.log(`Starting FolderHarbor...`);
  dotenv.config({ quiet: true });
  configPath = (program.opts().config as string | undefined) ? path.resolve(program.opts().config as string) : undefined;
  try {
    config = await loadConfig(program.opts().allowPermissiveConfig, configPath);
  } catch (e) {
    console.error(`Config Error - ${e}`);
    process.exit(1);
  }
  api = await startAPI(config.apiPort);
}
async function stopServer() {
  console.log("Stopping FolderHarbor...");
  api.close(() => console.log("Stopped API server."));
}
await startServer();
process.on("SIGTERM", async () => await stopServer());
process.on("SIGINT", async () => await stopServer());

export function getConfig(): z.Infer<typeof Config> | null {
  if (!config) return null;
  return config;
}
export function setConfig(newConfig: z.Infer<typeof Config>) { config = newConfig; }
export function getConfigPath(): string | undefined { return configPath; }