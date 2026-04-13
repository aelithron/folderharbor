import { Metadata } from "next";
import Logs from "./logs.module";

export const metadata: Metadata = { title: "Logs • Admin" }
export default function Page() {
  return (
    <main className="flex flex-col p-8 md:p-20 min-h-screen">
      <h1 className="text-2xl font-semibold text-center">Server Logs</h1>
      <Logs />
    </main>
  );
}