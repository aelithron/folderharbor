import { Metadata } from "next";
import ACLs from "./acls.module";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "ACLs • Admin" }
export default function Page() {
  return (
    <main className="flex flex-col p-8 md:p-20 min-h-screen mt-10 md:mt-0">
      <ACLs />
    </main>
  );
}