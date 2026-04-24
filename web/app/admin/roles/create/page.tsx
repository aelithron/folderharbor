import { Metadata } from "next";
import CreateRole from "./create.module";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "New Role • Admin" }
export default function Page() {
  return (
    <main className="flex flex-col p-8 md:p-20 min-h-screen">
      <h1 className="text-2xl font-semibold text-center">Create Role</h1>
      <CreateRole />
    </main>
  );
}