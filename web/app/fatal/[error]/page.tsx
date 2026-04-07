import { faLock, faSync, faXmarkCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Error" }
export default async function Page({ params, searchParams }: { params: Promise<{ error: string }>, searchParams: Promise<{ server: string, username: string }> }) {
  return (
    <div className="flex flex-col min-h-screen p-8 md:p-20 items-center text-center">
      <ErrorModules code={(await params).error} session={((await searchParams).server && (await searchParams).username) ? await searchParams : undefined} />
    </div>
  );
}
function ErrorModules({ code, session }: { code: string, session?: { username: string, server: string } }) {
  switch (code) {
    case "locked":
      return (
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold mb-4">Error - Locked</h1>
          <FontAwesomeIcon icon={faLock} size="6x" />
          <p>Your account{session ? ` (${session.username})` : ""} was locked by {session ? `the administrator of ${decodeURI(session.server)}` : "your administrator"}.</p>
          <Link href={"/"} className="hover:text-sky-500 bg-violet-500 p-2 rounded-lg"><FontAwesomeIcon icon={faSync} /> Switch Account</Link>
        </div>
      );
    default:
      return (
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold mb-4">Error</h1>
          <FontAwesomeIcon icon={faXmarkCircle} size="6x" />
          <p>A severe, unknown error occurred.</p>
        </div>
      );
  }
}