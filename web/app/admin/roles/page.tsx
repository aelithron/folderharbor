import { Metadata } from "next";
import Roles from "./roles.module";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Roles • Admin" }
export default function Page() {
  return (
    <main className="flex flex-col p-8 md:p-20 min-h-screen mt-10 md:mt-0">
      <Roles />
    </main>
  );
}