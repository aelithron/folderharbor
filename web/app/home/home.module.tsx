"use client"
import { Session } from "@/folderharborweb";
import query from "@/utils/api";
import { db } from "@/utils/db";
import { useEffect, useState } from "react";

export default function Home() {
  const [session, setSession] = useState<Session | undefined>();
  const [webdavURL, setWebdavURL] = useState<string | null>(null);
  const [ftpURL, setftpURL] = useState<string | null>(null);
  useEffect(() => {
    async function loadSession() { setSession(await db.sessions.get(parseInt(localStorage.getItem("activeSession")!))); }
    loadSession();
  }, []);
  useEffect(() => {
    if (!session) return;
    query(session, "providers").then((res) => {
      if ("error" in res) {
        alert(res.error);
        return;
      }
      setWebdavURL(res.body.webdav);
      setftpURL(res.body.ftp);
    });
  }, [session]);
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-center text-2xl font-semibold">Welcome{session ? `, ${session.username}` : ""}</h1>
      <div className="flex flex-col gap-2 items-center">
        {webdavURL && <div className="flex flex-col text-center gap-2 items-center p-2 bg-slate-600 rounded-lg w-fit">
          <h1 className="text-lg font-semibold">WebDAV</h1>
        </div>}
      </div>
    </div>
  )
}