"use client";
import { Session } from "@/folderharborweb";
import { db } from "@/utils/db";
import { faClock, faLock, faSignOut, faSync, faUserLock, faWarning, faXmarkCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ErrorModules({ code }: { code: string }) {
  const router = useRouter();
  const [session, setSession] = useState<Session | undefined>();
  async function resetData() {
    await db.delete({ disableAutoOpen: false });
    router.push("/");
  }
  async function signOut() {
    await db.sessions.delete(session?.webID);
    router.push("/");
  }
  useEffect(() => {
    async function loadSession() { if (localStorage.getItem("activeSession")) setSession(await db.sessions.get(parseInt(localStorage.getItem("activeSession")!))); }
    loadSession();
  }, []);
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
    case "invalid":
      return (
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold mb-4">Error - Invalid Session</h1>
          <FontAwesomeIcon icon={faUserLock} size="6x" />
          <p>Your session{session ? ` (as ${session.username})` : ""} on {session ? decodeURI(session.server) : "your FolderHarbor server"} is invalid. Please sign in again.</p>
          <button onClick={signOut} className="hover:text-sky-500 bg-violet-500 p-2 rounded-lg"><FontAwesomeIcon icon={faSignOut} /> Sign Out</button>
        </div>
      );
    case "expired":
      return (
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold mb-4">Error - Expired Session</h1>
          <FontAwesomeIcon icon={faClock} size="6x" />
          <p>Your session{session ? ` (as ${session.username})` : ""} on {session ? decodeURI(session.server) : "your FolderHarbor server"} has expired. Please sign in again.</p>
          <button onClick={signOut} className="hover:text-sky-500 bg-violet-500 p-2 rounded-lg"><FontAwesomeIcon icon={faSignOut} /> Sign Out</button>
        </div>
      );
    default:
      return (
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold mb-4">Error</h1>
          <FontAwesomeIcon icon={faXmarkCircle} size="6x" />
          <p>A severe, unknown error occurred.</p>
          <div className="flex gap-2">
            <Link href={"/"} className="hover:text-sky-500 bg-violet-500 p-2 rounded-lg"><FontAwesomeIcon icon={faSync} /> Switch Account</Link>
            <button onClick={resetData} className="hover:text-sky-500 bg-red-500 p-2 rounded-lg"><FontAwesomeIcon icon={faWarning} /> Reset Local Data</button>
          </div>
        </div>
      );
  }
}