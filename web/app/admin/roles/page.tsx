import { Metadata } from "next";
import Roles from "./roles.module";

export const metadata: Metadata = { title: "Roles • Admin" }
export default function Page() {
  return (
    <main className="flex flex-col p-8 md:p-20 min-h-screen">
      <h1 className="text-2xl font-semibold text-center">Roles</h1>
      <Roles />
    </main>
  );
}