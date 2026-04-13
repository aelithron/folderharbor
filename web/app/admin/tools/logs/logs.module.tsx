"use client"
import { Session } from "@/folderharborweb";
import query from "@/utils/api";
import { db } from "@/utils/db";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";

export default function Logs() {
  const [session, setSession] = useState<Session | undefined>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [logs, setLogs] = useState<{ userID: number, username: string | null, action: string, body: any | null, blurb: string, createdAt: string }[] | undefined>();
  const [page, setPage] = useState<number>(1);
  const [pageCount, setPageCount] = useState<number>(1);
  useEffect(() => {
    async function loadSession() { if (localStorage.getItem("activeSession")) setSession(await db.sessions.get(parseInt(localStorage.getItem("activeSession")!))); }
    loadSession();
  }, []);
  useEffect(() => {
    async function loadLogs() {
      if (!session) return;
      const res = await query(session, `admin/logs?page=${page}`);
      if ("error" in res) {
        alert(res.error);
        return;
      }
      if ("redirect" in res) {
        window.location.href = res.redirect;
        return;
      }
      setLogs(res.body.logs);
      setPageCount(res.body.pageCount);
    }
    loadLogs();
  }, [session, page]);
  return (
    <div className="flex flex-col mt-4">
      {(session && logs) && <div className="flex flex-col gap-2">
        {logs.map((entry) => <div key={entry.createdAt} className="bg-slate-700 p-2 rounded-lg">
          <div className="flex gap-1"><p className="font-semibold">{entry.username}</p> (ID #{entry.userID}) {entry.blurb} at {new Date(entry.createdAt).toLocaleString()} ({entry.action})</div>
          {entry.body && <pre className="word-wrap break-all">{JSON.stringify(entry.body, null, 2)}</pre>}
        </div>)}
        <div className="flex gap-2 justify-center items-center">
          <button onClick={() => setPage(Math.max(page - 1, 1))} className={(page <= 1 ? "text-slate-500" : "hover:text-sky-500")}><FontAwesomeIcon icon={faArrowLeft} /></button>
          <p>Page {page}/{pageCount}</p>
          <button onClick={() => setPage(Math.min(page + 1, pageCount))} className={(page >= pageCount ? "text-slate-500" : "hover:text-sky-500")}><FontAwesomeIcon icon={faArrowRight} /></button>
        </div>
      </div>}
      {(!session || !logs) && <p className="text-lg text-center mt-2">Loading...</p>}
    </div>
  );
}