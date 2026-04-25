import { Metadata } from "next";
import Header from "../header.module";
import Settings from "./settings.module";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Settings" }
export default function Page() {
  return (
    <main>
      <Header />
      <div className="flex flex-col p-8 pt-20 md:p-20 min-h-screen">
        <h1 className="text-3xl font-semibold text-center mt-2 md:mt-0">Settings</h1>
        <Settings />
        <p className="mt-auto text-center text-sm text-slate-500"><FontAwesomeIcon icon={faGithub} /> <a href="https://github.com/aelithron/folderharbor" target="_blank" className="underline hover:text-sky-500">FolderHarbor Web</a> ({process.env.IMAGE_TAG || "Unknown Version"})</p>
      </div>
    </main>
  );
}