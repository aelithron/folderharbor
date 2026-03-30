import Image from "next/image";
import logo from "@/public/logo.webp";
import LoginForm from "./login.form";

export default function Home() {
  return (
    <main className="flex flex-col p-8 md:p-20 min-h-screen">
      <div className="flex flex-col items-center justify-center text-center gap-1">
        <Image src={logo} alt="FolderHarbor Logo" width={250} height={250} />
        <h1 className="text-2xl font-semibold">Welcome to FolderHarbor</h1>
        <p>Please sign in to your FolderHarbor server to continue.</p>
        <LoginForm />
      </div>
    </main>
  );
}
