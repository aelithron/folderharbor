import getArgs from "./utils/args.js";
import getConfig from "./utils/config.js";

let args;
async function startServer() {
  console.log(`Starting FolderHarbor...`);
  getConfig();
  args = getArgs();
}
async function reloadServer() {

}
startServer();