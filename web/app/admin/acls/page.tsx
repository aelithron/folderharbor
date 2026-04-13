import { Metadata } from "next";
import ACLs from "./acls.module";

export const metadata: Metadata = { title: "ACLs • Admin" }
export default function Page() {
  return (
    <main className="flex flex-col p-8 md:p-20 min-h-screen">
      <h1 className="text-2xl font-semibold text-center">ACLs</h1>
      <ACLs />
    </main>
  );
}