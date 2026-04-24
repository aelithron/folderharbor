import { Metadata } from "next";
import Tools from "./tools.module";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Tools • Admin" }
export default function Page() {
  return (
    <main className="flex flex-col p-8 md:p-20 min-h-screen">
      <h1 className="text-2xl font-semibold text-center">Tools</h1>
      <Tools />
    </main>
  );
}