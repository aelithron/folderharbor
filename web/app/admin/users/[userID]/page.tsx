import { Metadata } from "next";
import UserSettings from "./user.module";
import Link from "next/link";

export const metadata: Metadata = { title: "User Info • Admin" }
export default async function Page({ params }: { params: Promise<{ userID: string }> }) {
  return (
    <div className="flex flex-col min-h-screen p-8 md:p-20 items-center text-center">
      {!isNaN(parseInt((await params).userID)) ? <UserSettings userID={parseInt((await params).userID)} /> : <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Error</h1>
        <p>Invalid user ID &ldquo;{(await params).userID}&ldquo;!</p>
        <Link href={"/admin/users"} className="bg-violet-500 p-1 rounded-lg">Back</Link>
      </div>}
    </div>
  );
}
