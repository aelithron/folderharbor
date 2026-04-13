import { Metadata } from "next";
import Permissions from "./permissions.module";

export const metadata: Metadata = { title: "Permissions • Admin" }
export default function Page() {
  return (
    <main className="flex flex-col p-8 md:p-20 min-h-screen">
      <h1 className="text-2xl font-semibold text-center">Permissions</h1>
      <Permissions />
    </main>
  );
}