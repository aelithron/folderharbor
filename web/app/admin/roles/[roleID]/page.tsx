import { Metadata } from "next";
import RoleSettings from "./role.module";
import Link from "next/link";

export const metadata: Metadata = { title: "Role Info • Admin" }
export default async function Page({ params }: { params: Promise<{ roleID: string }> }) {
  return (
    <div className="flex flex-col min-h-screen p-8 md:p-20 items-center text-center">
      <h1 className="text-2xl font-semibold text-center">User Info</h1>
      {!isNaN(parseInt((await params).roleID)) ? <RoleSettings roleID={parseInt((await params).roleID)} /> : <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Error</h1>
        <p>Invalid role ID &ldquo;{(await params).roleID}&ldquo;!</p>
        <Link href={"/admin/roles"} className="bg-violet-500 p-1 rounded-lg">Back</Link>
      </div>}
    </div>
  );
}
