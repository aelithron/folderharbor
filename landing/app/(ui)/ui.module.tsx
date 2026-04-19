import Image from "next/image";
import logo from "@/public/logo.webp";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe, faPlay, faServer, faTerminal } from "@fortawesome/free-solid-svg-icons";

export function Header() {
  return (
    <header className="flex gap-4 bg-violet-700/40 p-4 md:px-8 justify-between align-middle rounded-xl m-4">
      <Link href={"/"}><Image src={logo} alt="The FolderHarbor logo" loading="eager" className="w-1/8" /></Link>
      <div className="flex gap-3 align-middle items-center">
        <Link href={"/server"} className="hover:text-sky-500"><FontAwesomeIcon icon={faServer} /> Server</Link>
        <Link href={"/cli"} className="hover:text-sky-500"><FontAwesomeIcon icon={faTerminal} /> CLI</Link>
        <Link href={"/web"} className="hover:text-sky-500"><FontAwesomeIcon icon={faGlobe} /> Web Panel</Link>
        <Link href={"/demo"} className="hover:text-sky-500 bg-violet-500/40 py-1 px-2 rounded-xl"><FontAwesomeIcon icon={faPlay} /> Demo</Link>
      </div>
    </header>
  );
}