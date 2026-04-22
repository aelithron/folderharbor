import Image from "next/image";
import logo from "@/public/logo.webp";
import AccountSelector from "./selector.module";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";

export default function Home() {
  return (
    <main className="flex flex-col p-8 md:p-20 min-h-screen">
      <div className="flex flex-col items-center justify-center text-center gap-1">
        <Image src={logo} alt="FolderHarbor Logo" loading="eager" className="w-1/4 h-1/4" />
        <h1 className="text-2xl font-semibold">Welcome to FolderHarbor</h1>
        <AccountSelector />
        <p className="mt-6 text-center text-sm text-slate-500"><FontAwesomeIcon icon={faGithub} /> <a href="https://github.com/aelithron/folderharbor" target="_blank" className="underline hover:text-sky-500">FolderHarbor Web</a> ({process.env.IMAGE_TAG || "Unknown Version"})</p>
      </div>
    </main>
  );
}
