import { Command } from "commander";
import type z from "zod";
import getConfig, { Config } from "./utils/config.js";

let config: z.Infer<typeof Config> | null = null;
const program = new Command();
program.name("folderharbor").description("A powerful file server that supports many protocols");
async function startServer() {
  await program.parseAsync();
  console.log(`Starting FolderHarbor...`);
  config = await getConfig();

}
await startServer();