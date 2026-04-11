import { Metadata } from "next";
import ErrorModules from "./errors.module";

export const metadata: Metadata = { title: "Error" }
export default async function Page({ params }: { params: Promise<{ error: string }> }) {
  return (
    <div className="flex flex-col min-h-screen p-8 md:p-20 items-center text-center">
      <ErrorModules code={(await params).error} />
    </div>
  );
}
