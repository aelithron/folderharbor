import { faServer, faStar, faTerminal } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Metadata } from "next";
import Image from "next/image";
import serverPhoto from "@/public/shots/server.webp";
import Link from "next/link";
import { CopyButton } from "./copy.module";

export const metadata: Metadata = { title: "Server" }
export default async function Page() {
  let version;
  try {
    const res = await fetch("https://api.github.com/repos/aelithron/folderharbor/releases", { headers: { "User-Agent": "Aelithron-FolderHarbor-LandingPage", "Authorization": `Bearer ${process.env.GITHUB_PAT!}` } });
    const tag = (await res.json() as { tag_name: string, name: string }[]).find((item) => item.tag_name.startsWith("server/"));
    if (tag) version = { name: tag.name, tag: tag.tag_name.split("/")[1] }
  } catch {}
  return (
    <main className="flex flex-col min-h-screen p-8 md:px-16">
      <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-2">
        <div className="flex flex-col gap-2 items-center justify-center text-center">
          <h1 className="text-4xl font-semibold"><FontAwesomeIcon icon={faServer} /> FolderHarbor Server</h1>
          <p className="text-lg">The fully-featured server at the core of FolderHarbor.</p>
          <div className="flex flex-col gap-2 bg-slate-700 p-3 rounded-xl my-4">
            <h1 className="text-lg font-semibold">Download {version ? version.name : "Server"}</h1>
            <CopyButton text="curl -fsSL https://fh.novatea.dev/install.sh | sudo bash"><code className="bg-slate-800 p-2 rounded-xl flex gap-1 items-center text-sm"><FontAwesomeIcon icon={faTerminal} /> curl -fsSL https://fh.novatea.dev/install.sh | sudo bash</code></CopyButton>
          </div>
        </div>
        <div className="flex justify-center"><Image src={serverPhoto} alt="A stylized screenshot of two macOS Finder windows, showing the FolderHarbor server working." loading="eager" className="rounded-xl" /></div>
      </div>
      <div className="flex flex-col gap-2 mt-4 text-center items-center">
        <h2 className="text-2xl font-semibold"><FontAwesomeIcon icon={faStar} /> Highlights</h2>
        <ul className="list-disc text-start">
          <li>Multiple protocols supported (WebDAV and FTP)</li>
          <li>Powerful Role-Based Access Control (RBAC)</li>
          <li>Granular permission and Access Control List (ACL) system</li>
          <li>Detailed audit logging system</li>
          <li>Easily configurable through a JSON file</li>
          <li>Many security systems and options</li>
          <li>Powerful <Link href={"/cli"} className="underline hover:text-sky-500">CLI</Link> and <Link href={"/web"} className="underline hover:text-sky-500">Web Panel</Link> for administration</li>
          <li>Fully <a href="https://github.com/aelithron/folderharbor" className="underline hover:text-sky-500">free and open source</a> under the MIT license</li>
        </ul>
      </div>
    </main>
  );
}
