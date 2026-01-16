import yargs from "yargs";
import { hideBin } from "yargs/helpers";

export default function getArgs() {
  return yargs()
    .scriptName("folderharbor")
    .usage("$0 <cmd> [args]")
    .command("hello [name]", "welcome ter yargs!", (yargs) => yargs.positional("name", { type: "string", default: "Cambi", describe: "the name to say hello to"}))
    .help()
    .parse(hideBin(process.argv));
}