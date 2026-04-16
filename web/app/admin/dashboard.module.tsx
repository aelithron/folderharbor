"use client"
import { Session } from "@/folderharborweb";
import { db } from "@/utils/db";
import { faClipboardCheck, faCrown, faScrewdriverWrench, faToolbox, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [session, setSession] = useState<Session | undefined>();
  useEffect(() => {
    async function loadSession() { if (localStorage.getItem("activeSession")) setSession(await db.sessions.get(parseInt(localStorage.getItem("activeSession")!))); }
    loadSession();
  }, []);
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
      {(session ? session.permissions : []).includes("users:list") && <Link href={"/admin/users"} className="flex flex-col bg-slate-600 p-2 rounded-lg">
        <h2 className="hover:text-sky-500 font-semibold text-lg"><FontAwesomeIcon icon={faUser} /> Users</h2>
        <p>View and edit users</p>
      </Link>}
      {(session ? session.permissions : []).includes("roles:list") && <Link href={"/admin/roles"} className="flex flex-col bg-slate-600 p-2 rounded-lg">
        <h2 className="hover:text-sky-500 font-semibold text-lg"><FontAwesomeIcon icon={faCrown} /> Roles</h2>
        <p>View and edit roles</p>
      </Link>}
      {(session ? session.permissions : []).includes("acls:list") && <Link href={"/admin/acls"} className="flex flex-col bg-slate-600 p-2 rounded-lg">
        <h2 className="hover:text-sky-500 font-semibold text-lg"><FontAwesomeIcon icon={faClipboardCheck} /> ACLs</h2>
        <p>View and edit Access Control Lists</p>
      </Link>}
      {(session ? session.permissions : []).includes("config:read") && <Link href={"/admin/config"} className="flex flex-col bg-slate-600 p-2 rounded-lg">
        <h2 className="hover:text-sky-500 font-semibold text-lg"><FontAwesomeIcon icon={faScrewdriverWrench} /> Config</h2>
        <p>Read the server configuration</p>
      </Link>}
      <Link href={"/admin/tools"} className="flex flex-col bg-slate-600 p-2 rounded-lg">
        <h2 className="hover:text-sky-500 font-semibold text-lg"><FontAwesomeIcon icon={faToolbox} /> Tools</h2>
        <p>Access some additional tools</p>
      </Link>
    </div>
  )
}