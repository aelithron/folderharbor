import Image from "next/image";
import logo from "@/public/logo.webp";
import Link from "next/link";

export function Header() {
  return (
    <header className="flex gap-4 bg-slate-500 p-4 md:px-8 justify-between align-middle">
      <Link href={"/"}><Image src={logo} alt="The FolderHarbor logo" width={80} height={80} /></Link>
      <div className="flex gap-3">
        <Link href={"/"} className="hover:text-sky-500">Download</Link>
      </div>
    </header>
  );
}