import { faGlobe, faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Metadata } from "next";
import webPhoto from "@/public/shots/web.webp";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = { title: "Web" }
export default function Page() {
  return (
    <main className="flex flex-col min-h-screen p-8 md:px-16">
      <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-2">
        <div className="flex flex-col gap-2 items-center justify-center text-center">
          <h1 className="text-4xl font-semibold"><FontAwesomeIcon icon={faGlobe} /> FolderHarbor Web</h1>
          <p className="text-lg">A web panel to interact with FolderHarbor servers.</p>
          <div className="flex flex-col gap-2 bg-slate-700 p-3 rounded-xl my-4">
            <h1 className="text-lg font-semibold">Download Web Panel</h1>
            <p>coming soon :3</p>
          </div>
        </div>
        <div className="flex justify-center"><Image src={webPhoto} alt="A stylized screenshot of the FolderHarbor web panel." loading="eager" className="rounded-xl" /></div>
      </div>
      <div className="flex flex-col gap-2 mt-4 text-center items-center">
        <h2 className="text-2xl font-semibold"><FontAwesomeIcon icon={faStar} /> Highlights</h2>
        <ul className="list-disc text-start">
          <li>Powerful and robust administration panels</li>
          <li>User self-service panels</li>
          <li>Support for multiple active sessions at once</li>
          <li>Designed for the <Link href={"/server"} className="underline hover:text-sky-500">FolderHarbor Server</Link></li>
          <li>Fully <a href="https://github.com/aelithron/folderharbor" className="underline hover:text-sky-500">free and open source</a> under the MIT license</li>
        </ul>
      </div>
    </main>
  );
}