import Image from "next/image";
import logo from "@/public/logo.webp";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe, faPlay, faServer, faTerminal } from "@fortawesome/free-solid-svg-icons";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import notByAI from "@/public/not-by-ai.svg";

export function Header() {
  return (
    <header className="flex gap-4 bg-violet-700/40 p-2 md:py-4 md:px-8 justify-between items-center align-middle rounded-xl m-4">
      <Link href={"/"}><Image src={logo} alt="The FolderHarbor logo" loading="eager" className="xs:w-3/4 sm:w-1/4 md:w-1/8" /></Link>
      <div className="flex gap-3 align-middle items-center">
        <Link href={"/server"} className="hover:text-sky-500 flex items-center gap-1"><FontAwesomeIcon icon={faServer} /> Server</Link>
        <Link href={"/cli"} className="hover:text-sky-500 flex items-center gap-1"><FontAwesomeIcon icon={faTerminal} /> CLI</Link>
        <Link href={"/web"} className="hover:text-sky-500 flex items-center gap-1"><FontAwesomeIcon icon={faGlobe} /> Web</Link>
        <Link href={"/demo"} className="hover:text-sky-500 bg-violet-500/40 py-1 px-2 rounded-xl flex items-center gap-1"><FontAwesomeIcon icon={faPlay} /> Demo</Link>
      </div>
    </header>
  );
}
export function Footer() {
  return (
    <footer className="flex gap-4 bg-violet-600/30 p-3 md:px-8 justify-between items-center align-middle rounded-xl m-4">
      <a href="https://github.com/aelithron/folderharbor" target="_blank" className="hover:text-sky-500 text-slate-500 text-lg flex gap-1 items-center"><FontAwesomeIcon icon={faGithub} /> <p className="underline">Source</p></a>
      <a href="https://notbyai.fyi" target="_blank"><Image src={notByAI} alt="Developed by a human, not by AI!" /></a>
    </footer>
  );
}