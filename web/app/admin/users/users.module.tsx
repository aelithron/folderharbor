"use client"
import { Session } from "@/folderharborweb";
import query from "@/utils/api";
import { db } from "@/utils/db";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Users() {
  const [session, setSession] = useState<Session | undefined>();
  const [users, setUsers] = useState<{ id: number, username: string }[] | undefined>();
  useEffect(() => {
    async function loadSession() { if (localStorage.getItem("activeSession")) setSession(await db.sessions.get(parseInt(localStorage.getItem("activeSession")!))); }
    loadSession();
  }, []);
  useEffect(() => {
    async function loadUsers() {
      if (!session) return;
      const res = await query(session, "admin/users");
      if ("error" in res) {
        alert(res.error);
        return;
      }
      if ("redirect" in res) {
        window.location.href = res.redirect;
        return;
      }
      setUsers(res.body);
    }
    loadUsers();
  }, [session]);
  return (
    <div className="flex flex-col mt-4">
      {(session && users) && <div className="bg-slate-700 p-2 rounded-lg gap-2">
        {users.sort((a, b) => a.id - b.id).map((user) => <div key={user.id} className="flex gap-2 items-center">
          {(session.permissions.includes("users:read") || session.permissions.includes("users:read.full")) ? <Link href={`/users/${user.id}`} className="font-semibold text-lg underline hover:text-sky-500">{user.username}</Link> : <h1 className="font-semibold text-lg">{user.username}</h1>}
          <p className="text-sm text-slate-500">(User #{user.id})</p>
        </div>)}
      </div>}
      {(!session || !users) && <p className="text-lg text-center mt-2">Loading...</p>}
    </div>
  );
}