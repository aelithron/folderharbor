import Image from "next/image";
import logo from "@/public/logo.webp";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe, faPlay, faServer, faTerminal } from "@fortawesome/free-solid-svg-icons";
import serverPhoto from "@/public/shots/server.webp";
import cliPhoto from "@/public/shots/cli.webp";
import webPhoto from "@/public/shots/web.webp";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen p-8 md:px-16">
      <div className="flex flex-col md:flex-row gap-2 justify-center items-center align-middle">
        <Image src={logo} alt="The FolderHarbor logo" loading="eager" className="w-1/2 md:w-1/4" />
        <div className="flex flex-col gap-2 items-center justify-center text-center">
          <h1 className="text-3xl font-semibold">FolderHarbor</h1>
          <p>A powerful, multi-protocol file server with RBAC.</p>
          <Link href={"/demo"} className="bg-violet-500 p-1 rounded-xl text-lg hover:text-sky-500"><FontAwesomeIcon icon={faPlay} /> Try a Demo</Link>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 rounded-xl items-center align-middle">
        <Link href={"/server"} className="flex flex-col gap-2">
          <h1 className="text-center text-xl font-semibold hover:text-sky-500"><FontAwesomeIcon icon={faServer} /> Server</h1>
          <Image src={serverPhoto} alt="Two stylized macOS Finder windows showing FolderHarbor Server working!" className="rounded-xl" loading="eager" />
        </Link>
        <Link href={"/cli"} className="flex flex-col gap-2">
          <h1 className="text-center text-xl font-semibold hover:text-sky-500"><FontAwesomeIcon icon={faTerminal} /> CLI</h1>
          <Image src={cliPhoto} alt="A stylized picture of the help message from the FolderHarbor CLI." className="rounded-xl" loading="eager" />
        </Link>
        <Link href={"/web"} className="flex flex-col gap-2">
          <h1 className="text-center text-xl font-semibold hover:text-sky-500"><FontAwesomeIcon icon={faGlobe} /> Web Panel</h1>
          <Image src={webPhoto} alt="A stylized picture of the FolderHarbor Web Panel." className="rounded-xl" loading="eager" />
        </Link>
      </div>
    </main>
  );
}
