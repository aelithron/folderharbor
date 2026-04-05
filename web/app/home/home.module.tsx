"use client"
import { Session } from "@/folderharborweb";
import { db } from "@/utils/db";
import { useEffect, useState } from "react";

export default function Home() {
  const [session, setSession] = useState<Session | undefined>(undefined);
  useEffect(() => {
    async function loadSession() { setSession(await db.sessions.get(parseInt(localStorage.getItem("activeSession")!))); }
    loadSession();
  }, []);
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-center text-2xl font-semibold">Welcome{session ? `, ${session.username}` : ""}</h1>
    </div>
  )
}