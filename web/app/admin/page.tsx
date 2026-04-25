import { Metadata } from "next";
import Dashboard from "./dashboard.module";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin" }
export default function Page() {
  return (
    <main className="flex flex-col p-8 pt-20 md:p-20 min-h-screen mt-10 md:mt-0">
      <h1 className="text-2xl font-semibold text-center">Welcome to FolderHarbor Admin</h1>
      <Dashboard />
    </main>
  );
}