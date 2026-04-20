import { faServer, faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Metadata } from "next";
import Image from "next/image";
import serverPhoto from "@/public/shots/server.webp";
import Link from "next/link";

export const metadata: Metadata = { title: "Server" }
export default function Page() {
  return (
    <main className="flex flex-col min-h-screen p-8 md:px-16">
      <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-2">
        <div className="flex flex-col gap-2 items-center justify-center text-center">
          <h1 className="text-4xl font-semibold"><FontAwesomeIcon icon={faServer} /> FolderHarbor Server</h1>
          <p className="text-lg">The fully-featured server at the core of FolderHarbor.</p>
          <div className="flex flex-col gap-2 bg-slate-700 p-3 rounded-xl my-4">
            <h1 className="text-lg font-semibold">Download Server</h1>
            <p>coming soon :3</p>
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
