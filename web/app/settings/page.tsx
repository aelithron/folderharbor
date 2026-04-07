import { Metadata } from "next";
import Header from "../header.module";
import Settings from "./settings.module";

export const metadata: Metadata = { title: "Settings" }
export default function Page() {
  return (
    <main>
      <Header />
      <div className="flex flex-col p-8 md:p-20 min-h-screen">
        <h1 className="text-3xl font-semibold text-center">Settings</h1>
        <Settings />
      </div>
    </main>
  );
}