"use client"
import { Session } from "@/folderharborweb";
import { getClient, handleError } from "@/utils/api";
import { db } from "@/utils/db";
import { useEffect, useState } from "react";

export default function Permissions() {
  const [session, setSession] = useState<Session | undefined>();
  const [permissions, setPermissions] = useState<{ id: string, description: string }[] | undefined>();
  useEffect(() => {
    async function loadSession() { if (localStorage.getItem("activeSession")) setSession(await db.sessions.get(parseInt(localStorage.getItem("activeSession")!))); }
    loadSession();
  }, []);
  useEffect(() => {
    async function loadPermissions() {
      if (!session) return;
      try {
        setPermissions(await getClient(session).admin.permissions());
      } catch (e) {
        const errBody = handleError(e as Error);
        if ("error" in errBody) alert(errBody.error);
        if ("redirect" in errBody) window.location.href = errBody.redirect;
      }
    }
    loadPermissions();
  }, [session]);
  return (
    <div className="flex flex-col mt-4">
      {(session && permissions) && <div className="flex flex-col gap-1 bg-slate-700 p-2 rounded-lg">
        {permissions.map((node) => <div key={node.id}>
          <div className="flex gap-1"> - <p className="font-semibold">{node.id}</p> - {node.description}</div>
        </div>)}
      </div>}
      {(!session || !permissions) && <p className="text-lg text-center mt-2">Loading...</p>}
    </div>
  );
}