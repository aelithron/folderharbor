"use client"
import { Session } from "@/folderharborweb";
import { db } from "@/utils/db";
import { faBriefcase, faClipboardCheck, faCrown, faScrewdriverWrench, faToolbox, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AdminSidebar() {
  const [session, setSession] = useState<Session | undefined>();
  useEffect(() => {
    async function loadSession() { if (localStorage.getItem("activeSession")) setSession(await db.sessions.get(parseInt(localStorage.getItem("activeSession")!))); }
    loadSession();
  }, []);
  return (
    <div className="flex flex-col z-25 mt-14.75 fixed gap-2 py-2 px-3 md:px-8 bg-violet-700/40 h-full">
      <h2 className="text-center text-lg font-semibold mt-2">Admin</h2>
      <Link href={"/admin"} className="hover:text-sky-500"><FontAwesomeIcon icon={faBriefcase} /> Dashboard</Link>
      {(session ? session.permissions : []).includes("users:list") && <Link href={"/admin/users"} className="hover:text-sky-500"><FontAwesomeIcon icon={faUser} /> Users</Link>}
      {(session ? session.permissions : []).includes("roles:list") && <Link href={"/admin/roles"} className="hover:text-sky-500"><FontAwesomeIcon icon={faCrown} /> Roles</Link>}
      {(session ? session.permissions : []).includes("acls:list") && <Link href={"/admin/acls"} className="hover:text-sky-500"><FontAwesomeIcon icon={faClipboardCheck} /> ACLs</Link>}
      {(session ? session.permissions : []).includes("config:read") && <Link href={"/admin/config"} className="hover:text-sky-500"><FontAwesomeIcon icon={faScrewdriverWrench} /> Config</Link>}
      <Link href={"/admin/tools"} className="hover:text-sky-500"><FontAwesomeIcon icon={faToolbox} /> Tools</Link>
    </div>
  );
}