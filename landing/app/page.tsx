import Image from "next/image";
import logo from "@/public/logo.webp";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay } from "@fortawesome/free-solid-svg-icons";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen p-8 md:px-16">
      <div className="grid grid-cols-1 md:grid-cols-3">
        <div className="flex flex-col gap-2 items-center justify-center text-center">
          <Image src={logo} alt="The FolderHarbor logo" loading="eager" className="w-3/4" />
          <h1 className="text-3xl font-semibold">FolderHarbor</h1>
          <p>A powerful, multi-protocol file server with RBAC.</p>
          <Link href={"/demo"} className="bg-violet-500 p-1 rounded-xl text-lg hover:text-sky-500"><FontAwesomeIcon icon={faPlay} /> Try a Demo</Link>
        </div>
      </div>
      
    </main>
  );
}
