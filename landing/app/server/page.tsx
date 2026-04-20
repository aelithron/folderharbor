import { faServer, faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Metadata } from "next";
import Image from "next/image";
import serverPhoto from "@/public/shots/server.webp";

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
        <h2 className="text-2xl font-semibold"><FontAwesomeIcon icon={faStar} /> Features</h2>
        <ul className="list-disc text-start">
          <li></li>
        </ul>
      </div>
    </main>
  );
}
