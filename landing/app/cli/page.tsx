import { faTerminal } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Metadata } from "next";
import Image from "next/image";
import cliPhoto from "@/public/shots/cli.webp";
import DownloadCLI from "./download.module";

export const metadata: Metadata = { title: "CLI" }
export default async function Page() {
  const version = await getVersion();
  return (
    <main className="flex flex-col min-h-screen p-8 md:px-16">
      <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-2">
        <div className="flex flex-col gap-2 items-center justify-center text-center">
          <h1 className="text-4xl font-semibold"><FontAwesomeIcon icon={faTerminal} /> FolderHarbor CLI</h1>
          <p className="text-lg">A powerful CLI to interact with FolderHarbor servers.</p>
          <DownloadCLI version={version} />
        </div>
        <div className="flex justify-center md:col-span-2"><Image src={cliPhoto} alt="A stylized screenshot of the FolderHarbor web panel." loading="eager" className="rounded-xl md:w-3/4" /></div>
      </div>
    </main>
  );
}
async function getVersion(): Promise<{ tag: string, name: string } | null> {
  try {
    const res = await fetch("https://api.github.com/repos/aelithron/folderharbor/releases");
    const tag = (await res.json() as { tag_name: string, name: string }[]).find((item) => item.tag_name.startsWith("cli/"));
    if (!tag) return null;
    return { name: tag.name, tag: tag.tag_name.split("/")[1] }
  } catch { return null; }
}