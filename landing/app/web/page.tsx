import { faGlobe } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Metadata } from "next";
import webPhoto from "@/public/shots/web.webp";
import Image from "next/image";

export const metadata: Metadata = { title: "Web" }
export default function Page() {
  return (
    <main className="flex flex-col min-h-screen p-8 md:px-16">
      <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-2">
        <div className="flex flex-col gap-2 items-center justify-center text-center">
          <h1 className="text-4xl font-semibold"><FontAwesomeIcon icon={faGlobe} /> FolderHarbor Web</h1>
          <p className="text-lg">A web panel to interact with FolderHarbor servers.</p>
        </div>
        <div className="flex justify-center md:col-span-2"><Image src={webPhoto} alt="A stylized screenshot of the FolderHarbor web panel." loading="eager" className="rounded-xl md:w-3/4" /></div>
      </div>
    </main>
  );
}