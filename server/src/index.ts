import { program } from "commander";
import type z from "zod";
import path from "path";
import loadConfig, { Config } from "./utils/config.js";
import startAPI from "./api/api.js";
import type { Server } from "http";
import type { WebDAVServer } from "webdav-server/lib/index.v2.js";
import dotenv from "dotenv";
import startWebDAV from "./protocols/webdav/webdav.js";
import loadCert from "./utils/ssl.js";
import { recoverServer, setUpServer } from "./utils/scripts.js";
import type { FtpSrv } from "ftp-srv";
import startFTP from "./protocols/ftp/ftp.js";

let config: z.Infer<typeof Config>;
let configPath: string | undefined;
let api: Server;
let webdav: WebDAVServer;
let ftp: FtpSrv;
program
  .name("folderharbor").description("A powerful file server that supports many protocols")
  .option("-c, --config <path>", "path to server config")
  .option("--allow-root-user", "allow the server to run as root (this can cause security risks!)")
  .option("--allow-permissive-config", "allow the server to load a configuration that is overly permissive")
  .option("--setup", "run folderharbor in setup mode, don't start the full server")
  .option("--recovery", "run folderharbor in recovery mode, don't start the full server");
async function startServer() {
  await program.parseAsync();
  dotenv.config({ quiet: true });
  if (program.opts().setup) await setUpServer();
  if (program.opts().recovery) await recoverServer();
  if ((process.getuid && process.getgid) && (process.getuid() === 0 || process.getgid() === 0) && !program.opts().allowRootUser) {
    console.error('You started FolderHarbor as root! This is a security risk.\nIf you understand the risks, you can override this check with the "--allow-root-user" argument.');
    process.exit(1);
  }
  console.log(`Starting FolderHarbor...`);
  configPath = (program.opts().config as string | undefined) ? path.resolve(program.opts().config as string) : undefined;
  try {
    config = await loadConfig(program.opts().allowPermissiveConfig, configPath);
  } catch (e) {
    console.error(`Config Error - ${e}`);
    process.exit(1);
  }
  if (config.useSSL) {
    let ssl;
    try {
      ssl = await loadCert(configPath);
    } catch (e) {
      console.error(`SSL Error - ${e}`);
      process.exit(1);
    }
    api = await startAPI(config.api.port, ssl.key, ssl.cert);
    if (config.webdav.enabled) webdav = await startWebDAV(config.webdav.port, ssl.key, ssl.cert);
    if (config.ftp.enabled) ftp = await startFTP(config, ssl.key, ssl.cert);
  } else {
    api = await startAPI(config.api.port);
    if (config.webdav.enabled) webdav = await startWebDAV(config.webdav.port);
    if (config.ftp.enabled) ftp = await startFTP(config);
  }
}
async function stopServer() {
  console.log("Stopping FolderHarbor...");
  api.close(() => console.log("Stopped API server."));
  if (webdav) webdav.stop(() => console.log("Stopped WebDAV server."));
  if (ftp) ftp.close().then(() => console.log("Stopped FTP server."));
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