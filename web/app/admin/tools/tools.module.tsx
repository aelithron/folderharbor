"use client"
import { Session } from "@/folderharborweb";
import { db } from "@/utils/db";
import { faCheck, faScroll } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Tools() {
  const [session, setSession] = useState<Session | undefined>();
  useEffect(() => {
    async function loadSession() { if (localStorage.getItem("activeSession")) setSession(await db.sessions.get(parseInt(localStorage.getItem("activeSession")!))); }
    loadSession();
  }, []);
  return (
    <div className="flex flex-col mt-4">
      {session && <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-700 p-2 rounded-lg">
          <Link href="/admin/tools/permissions" className="text-lg font-semibold hover:text-sky-500"><FontAwesomeIcon icon={faCheck} /> Permissions</Link>
          <p>View a list of server permissions</p>
        </div>
        {session.permissions.includes("logs:read") && <div className="bg-slate-700 p-2 rounded-lg">
          <Link href="/admin/tools/logs" className="text-lg font-semibold hover:text-sky-500"><FontAwesomeIcon icon={faScroll} /> Logs</Link>
          <p>View the server logs</p>
        </div>}
      </div>}
      {!session && <p className="text-lg text-center mt-2">Loading...</p>}
    </div>
  );
}