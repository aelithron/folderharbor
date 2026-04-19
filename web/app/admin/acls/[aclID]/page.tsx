import { Metadata } from "next";
import ACLSettings from "./acl.module";
import Link from "next/link";

export const metadata: Metadata = { title: "ACL Info • Admin" }
export default async function Page({ params }: { params: Promise<{ aclID: string }> }) {
  return (
    <div className="flex flex-col min-h-screen p-8 md:p-20 items-center text-center">
      <h1 className="text-2xl font-semibold text-center">ACL Info</h1>
      {!isNaN(parseInt((await params).aclID)) ? <ACLSettings aclID={parseInt((await params).aclID)} /> : <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Error</h1>
        <p>Invalid ACL ID &ldquo;{(await params).aclID}&ldquo;!</p>
        <Link href={"/admin/acls"} className="bg-violet-500 p-1 rounded-lg">Back</Link>
      </div>}
    </div>
  );
}
