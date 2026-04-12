"use client"
import query from "@/utils/api";
import { db } from "@/utils/db";
import { useEffect } from "react";

export default function RefreshSession() {
  useEffect(() => {
    async function refreshSession() {
      if (localStorage.getItem("activeSession")) {
        const session = await db.sessions.get(parseInt(localStorage.getItem("activeSession")!));
        if (!session) return;
        const res = await query(session, "me");
        if ("error" in res || "redirect" in res) return;
        db.sessions.update(parseInt(localStorage.getItem("activeSession")!), { permissions: res.body.permissions || [], username: res.body.username });
      }
    }
    refreshSession();
  }, []);
  return false;
}