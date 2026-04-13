"use client"
import { Session } from "@/folderharborweb";
import { db } from "@/utils/db";
import { faGear } from "@fortawesome/free-solid-svg-icons";
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
    <div className="flex flex-col mt-14.75 fixed gap-2 py-2 px-3 md:px-8 bg-violet-700/40 h-full">
      <Link href={"/admin"} className="hover:text-sky-500 underline"><FontAwesomeIcon icon={faGear} /> Dashboard</Link>
    </div>
  );
}