"use client"
import { Session } from "@/folderharborweb";
import query from "@/utils/api";
import { db } from "@/utils/db";
import { useEffect, useState } from "react";

export default function Config() {
  const [session, setSession] = useState<Session | undefined>();
  const [config, setConfig] = useState<object | undefined>();
  useEffect(() => {
    async function loadSession() { if (localStorage.getItem("activeSession")) setSession(await db.sessions.get(parseInt(localStorage.getItem("activeSession")!))); }
    loadSession();
  }, []);
  useEffect(() => {
    async function loadConfig() {
      if (!session) return;
      const res = await query(session, `admin/config`);
      if ("error" in res) {
        alert(res.error);
        return;
      }
      if ("redirect" in res) {
        window.location.href = res.redirect;
        return;
      }
      setConfig(res.body);
    }
    loadConfig();
  }, [session]);
  return (
    <div className="flex flex-col mt-4">
      {(session && config) && <div className="flex flex-col gap-1 bg-slate-700 p-2 rounded-lg">
        <pre>{JSON.stringify(config, null, 2)}</pre>
      </div>}
      {(!session || !config) && <p className="text-lg text-center mt-2">Loading...</p>}
    </div>
  );
}