import { Metadata } from "next";
import Logs from "./logs.module";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Logs • Admin" }
export default function Page() {
  return (
    <main className="flex flex-col p-8 md:p-20 min-h-screen mt-10 md:mt-0">
      <h1 className="text-2xl font-semibold text-center">Server Logs</h1>
      <Logs />
    </main>
  );
}