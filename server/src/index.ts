import { program } from "commander";
import type z from "zod";
import path from "path";
import getConfig, { Config } from "./utils/config.js";

let config: z.Infer<typeof Config> | null = null;
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
  console.log(`Starting FolderHarbor!`);
  try {
    config = await getConfig(program.opts().allowPermissiveConfig, (program.opts().config as string | undefined) ? path.resolve(program.opts().config as string) : undefined);
  } catch (e) {
    console.error(`Config Error - ${e}`);
    process.exit(1);
  }
  console.log("FolderHarbor ready!");
}
await startServer();