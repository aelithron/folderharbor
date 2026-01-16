import { program } from "commander";
import type z from "zod";
import getConfig, { Config } from "./utils/config.js";

let config: z.Infer<typeof Config> | null = null;
program
  .name("folderharbor").description("A powerful file server that supports many protocols")
  .option("-c, --config", "path to server config");
async function startServer() {
  await program.parseAsync();
  console.log(`Starting FolderHarbor...`);
  config = await getConfig(program.opts().config as string | undefined);

}
await startServer();