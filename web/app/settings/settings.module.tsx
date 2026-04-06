"use client"
import { Session } from "@/folderharborweb";
import query from "@/utils/api";
import { db } from "@/utils/db";
import { useEffect, useState } from "react";

export default function Settings() {
  const [session, setSession] = useState<Session | undefined>();
  const [selfInfo, setSelfInfo] = useState<{ id: number, username: string, sessions: { id: number, createdAt: string, expiry: string }[], activeSession: number, failedLoginLockout: boolean, permissions: string[] } | undefined>();
  const [clientConfig, setClientConfig] = useState<{ selfUsernameChanges?: boolean }>({});
  useEffect(() => {
    async function loadSession() { setSession(await db.sessions.get(parseInt(localStorage.getItem("activeSession")!))); }
    loadSession();
  }, []);
  useEffect(() => {
    async function loadSelfInfo() {
      if (!session) return;
      const res = await query(session, "me");
      if ("error" in res) {
        alert(res.error);
        return;
      }
      setSelfInfo(res.body);
    }
    async function loadClientConfig() {
      if (!session) return;
      const res = await query(session, "clientconfig");
      if ("error" in res) {
        alert(res.error);
        return;
      }
      setClientConfig({ selfUsernameChanges: res.body.selfUsernameChanges });
    }
    loadSelfInfo();
    loadClientConfig();
  }, [session]);
  return (
    <div>

    </div>
  );
}