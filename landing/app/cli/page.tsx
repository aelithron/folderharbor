import { faTerminal, faDownload, faUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Metadata } from "next";
import { headers } from "next/headers";
import Image from "next/image";
import cliPhoto from "@/public/shots/cli.webp";

export const metadata: Metadata = { title: "CLI" }
export default async function Page() {

  return (
    <main className="flex flex-col min-h-screen p-8 md:px-16">
      <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-2">
        <div className="flex flex-col gap-2 items-center justify-center text-center">
          <h1 className="text-4xl font-semibold"><FontAwesomeIcon icon={faTerminal} /> FolderHarbor CLI</h1>
          <p className="text-lg">A powerful CLI to interact with FolderHarbor servers.</p>
          <DownloadCLI />
        </div>
        <div className="flex justify-center md:col-span-2"><Image src={cliPhoto} alt="A stylized screenshot of the FolderHarbor CLI." loading="eager" className="rounded-xl md:w-3/4" /></div>
      </div>
    </main>
  );
}
async function DownloadCLI() {
  const userAgent = (await headers()).get("user-agent");
  let os: "macOS" | "linux" | "windows" | "other";
  let version: { tag: string, name: string };
  try {
    const res = await fetch("https://api.github.com/repos/aelithron/folderharbor/releases", { headers: { "User-Agent": "Aelithron-FolderHarbor-LandingPage", "Authorization": `Bearer ${process.env.GITHUB_PAT!}` } });
    const tag = (await res.json() as { tag_name: string, name: string }[]).find((item) => item.tag_name.startsWith("cli/"));
    if (!tag) return false;
    version = { name: tag.name, tag: tag.tag_name.split("/")[1] }
  } catch { return false; }
  if (userAgent) {
    if (userAgent.includes("Macintosh")) {
      os = "macOS"
    } else if (userAgent.includes("Win")) {
      os = "windows";
    } else if (userAgent.includes("iPhone") || userAgent.includes("Android")) {
      os = "other";
    } else os = "linux";
  } else os = "other";
  const base = `https://github.com/aelithron/folderharbor/releases/download/cli/${version.tag}/folderharbor-cli`;
  return (
    <div className="flex flex-col gap-2 bg-slate-700 p-3 rounded-xl my-4">
      <h1 className="text-lg font-semibold">Download {version.name}</h1>
      {os === "macOS" && <div>
        <div className="grid grid-cols-2 gap-2">
          <a href={`${base}-${version.tag}-macos-arm64`} target="_blank" className="bg-violet-500 p-1 px-2 rounded-xl hover:text-sky-500"><FontAwesomeIcon icon={faDownload} /> Apple Silicon</a>
          <a href={`${base}-${version.tag}-macos-amd64`} target="_blank" className="bg-violet-500 p-1 px-2 rounded-xl hover:text-sky-500"><FontAwesomeIcon icon={faDownload} /> Intel Macs</a>
        </div>
        <div className="flex flex-col gap-2 mt-2 text-start">
          <p className="text-center">Or, download for:</p>
          <a href={`${base}-${version.tag}-linux-amd64`} target="_blank" className="hover:text-sky-500"><FontAwesomeIcon icon={faDownload} /> Linux x86_64</a>
          <a href={`${base}-${version.tag}-linux-arm64`} target="_blank" className="hover:text-sky-500"><FontAwesomeIcon icon={faDownload} /> Linux ARM64</a>
          <a href={`${base}-${version.tag}-windows-amd64.exe`} target="_blank" className="hover:text-sky-500"><FontAwesomeIcon icon={faDownload} /> Windows</a>
          <a href={`https://github.com/aelithron/folderharbor/releases/cli%2F${version.tag}`} target="_blank" className="hover:text-sky-500 mt-2"><FontAwesomeIcon icon={faUpRightFromSquare} /> GitHub Release</a>
        </div>
      </div>}
      {os === "windows" && <div>
        <a href={`${base}-${version.tag}-windows-amd64.exe`} target="_blank" className="bg-violet-500 p-1 px-2 rounded-xl hover:text-sky-500"><FontAwesomeIcon icon={faDownload} /> Windows</a>
        <div className="flex flex-col gap-2 mt-2 text-start">
          <p className="text-center">Or, download for:</p>
          <a href={`${base}-${version.tag}-macos-arm64`} target="_blank" className="hover:text-sky-500"><FontAwesomeIcon icon={faDownload} /> Apple Silicon Macs</a>
          <a href={`${base}-${version.tag}-macos-amd64`} target="_blank" className="hover:text-sky-500"><FontAwesomeIcon icon={faDownload} /> Intel Macs</a>
          <a href={`${base}-${version.tag}-linux-amd64`} target="_blank" className="hover:text-sky-500"><FontAwesomeIcon icon={faDownload} /> Linux x86_64</a>
          <a href={`${base}-${version.tag}-linux-arm64`} target="_blank" className="hover:text-sky-500"><FontAwesomeIcon icon={faDownload} /> Linux ARM64</a>
          <a href={`https://github.com/aelithron/folderharbor/releases/cli%2F${version.tag}`} target="_blank" className="hover:text-sky-500 mt-2"><FontAwesomeIcon icon={faUpRightFromSquare} /> GitHub Release</a>
        </div>
      </div>}
      {os === "linux" && <div>
        <div className="grid grid-cols-2 gap-2">
          <a href={`${base}_${version.tag.slice(1).replaceAll("-", ".")}_amd64.deb`} target="_blank" className="bg-violet-500 p-1 px-2 rounded-xl hover:text-sky-500"><FontAwesomeIcon icon={faDownload} /> .deb x86_64</a>
          <a href={`${base}_${version.tag.slice(1).replaceAll("-", ".")}_arm64.deb`} target="_blank" className="bg-violet-500 p-1 px-2 rounded-xl hover:text-sky-500"><FontAwesomeIcon icon={faDownload} /> .deb ARM64</a>
          <a href={`${base}-${version.tag.slice(1).replaceAll("-", ".")}-1.x86_64.rpm`} target="_blank" className="bg-violet-500 p-1 px-2 rounded-xl hover:text-sky-500"><FontAwesomeIcon icon={faDownload} /> .rpm x86_64</a>
          <a href={`${base}-${version.tag.slice(1).replaceAll("-", ".")}-1.aarch64.rpm`} target="_blank" className="bg-violet-500 p-1 px-2 rounded-xl hover:text-sky-500"><FontAwesomeIcon icon={faDownload} /> .rpm ARM64</a>
          <a href={`${base}-${version.tag}-linux-amd64`} target="_blank" className=" hover:text-sky-500"><FontAwesomeIcon icon={faDownload} /> Linux x86_64</a>
          <a href={`${base}-${version.tag}-linux-arm64`} target="_blank" className="hover:text-sky-500"><FontAwesomeIcon icon={faDownload} /> Linux ARM64</a>
        </div>
        <div className="flex flex-col gap-2 mt-2 text-start">
          <p className="text-center">Or, download for:</p>
          <a href={`${base}-${version.tag}-macos-arm64`} target="_blank" className="hover:text-sky-500"><FontAwesomeIcon icon={faDownload} /> Apple Silicon Macs</a>
          <a href={`${base}-${version.tag}-macos-amd64`} target="_blank" className="hover:text-sky-500"><FontAwesomeIcon icon={faDownload} /> Intel Macs</a>
          <a href={`${base}-${version.tag}-windows-amd64.exe`} target="_blank" className="hover:text-sky-500"><FontAwesomeIcon icon={faDownload} /> Windows</a>
          <a href={`https://github.com/aelithron/folderharbor/releases/cli%2F${version.tag}`} target="_blank" className="hover:text-sky-500 mt-2"><FontAwesomeIcon icon={faUpRightFromSquare} /> GitHub Release</a>
        </div>
      </div>}
      {os === "other" && <div className="flex flex-col gap-2 mt-2 text-start">
        <a href={`${base}-${version.tag}-macos-arm64`} target="_blank" className="hover:text-sky-500"><FontAwesomeIcon icon={faDownload} /> Apple Silicon Macs</a>
        <a href={`${base}-${version.tag}-macos-amd64`} target="_blank" className="hover:text-sky-500"><FontAwesomeIcon icon={faDownload} /> Intel Macs</a>
        <a href={`${base}-${version.tag}-linux-amd64`} target="_blank" className="hover:text-sky-500"><FontAwesomeIcon icon={faDownload} /> Linux x86_64</a>
        <a href={`${base}-${version.tag}-linux-arm64`} target="_blank" className="hover:text-sky-500"><FontAwesomeIcon icon={faDownload} /> Linux ARM64</a>
        <a href={`${base}-${version.tag}-windows-amd64.exe`} target="_blank" className="hover:text-sky-500"><FontAwesomeIcon icon={faDownload} /> Windows</a>
        <a href={`https://github.com/aelithron/folderharbor/releases/cli%2F${version.tag}`} target="_blank" className="hover:text-sky-500 mt-2"><FontAwesomeIcon icon={faUpRightFromSquare} /> GitHub Release</a>
      </div>}
    </div>
  )
}