"use client"
import { Session } from "@/folderharborweb";
import query from "@/utils/api";
import { db } from "@/utils/db";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CreateUser() {
  const router = useRouter();
  const [session, setSession] = useState<Session | undefined>();
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  useEffect(() => {
    async function loadSession() { if (localStorage.getItem("activeSession")) setSession(await db.sessions.get(parseInt(localStorage.getItem("activeSession")!))); }
    loadSession();
  }, []);
  async function updateInfo(e: React.SubmitEvent) {
    e.preventDefault();
    const res = await query(session!, `admin/users`, { method: "POST", body: JSON.stringify({ username, password }) });
    if ("error" in res) {
      alert(res.error);
      return;
    }
    if ("redirect" in res) {
      window.location.href = res.redirect;
      return;
    }
    router.push(`/admin/users/${res.body.id}`);
  }
  return (
    <form onSubmit={updateInfo} className="flex flex-col gap-2">
      <div className="flex flex-col gap-1 items-center mt-2">
        <label htmlFor="username">Username</label>
        <input id="username" className="border-2 border-black bg-slate-500 text-black p-1 rounded-xl w-fit" value={username} onChange={(e) => setUsername(e.target.value)} />
      </div>
      <div className="flex flex-col gap-1 items-center">
        <label htmlFor="password">Password</label>
        <input id="password" type="password" className="border-2 border-black bg-slate-500 text-black p-1 rounded-xl w-fit" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <div className="md:col-span-3 text-center"><button type="submit" className="rounded-xl p-1 px-2 mt-2 bg-violet-500 hover:text-sky-500 w-fit">Create</button></div>
    </form>
  );
}