import Image from "next/image";
import logo from "@/public/logo.webp";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen p-8 md:px-16">
      <div className="grid grid-cols-1 md:grid-cols-3">
        <div className="flex flex-col gap-2 items-center justify-center text-center">
          <Image src={logo} alt="The FolderHarbor logo" width={300} height={300} />
          <h1 className="text-3xl font-semibold">FolderHarbor</h1>
          <p>A powerful, multi-protocol file server with RBAC.</p>
        </div>
      </div>
      
    </main>
  );
}
