import Image from "next/image";
import logo from "@/public/logo.webp";
import LoginForm from "./login.form";
import { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Sign In" }
export default function Page() {
  return (
    <main className="flex flex-col p-8 md:p-20 min-h-screen">
      <div className="flex flex-col items-center justify-center text-center gap-1">
        <Image src={logo} alt="FolderHarbor Logo" loading="eager" className="w-1/4 h-1/4" />
        <h1 className="text-2xl font-semibold">Sign In</h1>
        <p>Please sign in to your FolderHarbor server to continue.</p>
        <LoginForm defaultURL={process.env.DEFAULT_URL} />
      </div>
    </main>
  );
}
