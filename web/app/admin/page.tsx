import { Metadata } from "next";

export const metadata: Metadata = { title: "Admin" }
export default function Page() {
  return (
    <main className="flex flex-col p-8 pt-20 md:p-20 min-h-screen">
      <h1 className="text-2xl font-semibold text-center">Welcome to FolderHarbor Admin</h1>
    </main>
  );
}