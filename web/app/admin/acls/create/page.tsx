import { Metadata } from "next";
import CreateACL from "./create.module";

export const metadata: Metadata = { title: "New ACL • Admin" }
export default function Page() {
  return (
    <main className="flex flex-col p-8 md:p-20 min-h-screen">
      <h1 className="text-2xl font-semibold text-center">Create ACL</h1>
      <CreateACL />
    </main>
  );
}