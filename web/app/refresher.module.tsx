"use client"
import { db } from "@/utils/db";
import { FolderHarbor } from "@folderharbor/sdk";
import { useEffect } from "react";

export default function RefreshSession() {
  useEffect(() => {
    async function refreshSession() {
      if (localStorage.getItem("activeSession")) {
        const session = await db.sessions.get(parseInt(localStorage.getItem("activeSession")!));
        if (!session) return;
        let res;
        try {
          res = await (new FolderHarbor({ server: session.server, token: session.token })).me.info();
        } catch { return; }
        db.sessions.update(parseInt(localStorage.getItem("activeSession")!), { permissions: res.permissions || [], username: res.username });
      }
    }
    refreshSession();
  }, []);
  return false;
}