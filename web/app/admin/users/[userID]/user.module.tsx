"use client"
import { Session } from "@/folderharborweb";
import query from "@/utils/api";
import { db } from "@/utils/db";
import Link from "next/link";
import { useEffect, useState } from "react";

type LimitedUser = { access: "limited" | "full", username: string, locked: boolean, failedLogins: number }
type FullUser = LimitedUser & { access: "full", roles: number[], acls: number[], permissions: string[], sessions?: { id: number, createdAt: string, expiry: string }[] }
export default function UserSettings({ userID }: { userID: number }) {
  const [session, setSession] = useState<Session | undefined>();
  const [user, setUser] = useState<LimitedUser | FullUser | undefined>();
  useEffect(() => {
    async function loadSession() { if (localStorage.getItem("activeSession")) setSession(await db.sessions.get(parseInt(localStorage.getItem("activeSession")!))); }
    loadSession();
  }, []);
  useEffect(() => {
    async function loadUser() {
      if (!session) return;
      const res = await query(session, `admin/users/${userID}`);
      if ("error" in res) {
        alert(res.error);
        return;
      }
      if ("redirect" in res) {
        window.location.href = res.redirect;
        return;
      }
      setUser(res.body);
    }
    loadUser();
  }, [session, userID]);
  return (
    <div className="flex flex-col mt-4">
      {(session && user) && <div className="bg-slate-700 p-2 rounded-lg gap-2">
        <p>a</p>
      </div>}
      {(!session || !user) && <p className="text-lg text-center mt-2">Loading...</p>}
    </div>
  );
}