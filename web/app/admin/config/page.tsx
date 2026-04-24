import { Metadata } from "next";
import Config from "./config.module";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Config • Admin" }
export default async function Page() {
  return (
    <div className="flex flex-col min-h-screen p-8 md:p-20">
      <h1 className="text-2xl font-semibold text-center">Server Config</h1>
      <Config />
    </div>
  );
}
