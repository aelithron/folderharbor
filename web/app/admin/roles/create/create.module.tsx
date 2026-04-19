"use client"
import { Session } from "@/folderharborweb";
import query from "@/utils/api";
import { db } from "@/utils/db";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CreateRole() {
  const router = useRouter();
  const [session, setSession] = useState<Session | undefined>();
  const [name, setName] = useState<string>("");
  useEffect(() => {
    async function loadSession() { if (localStorage.getItem("activeSession")) setSession(await db.sessions.get(parseInt(localStorage.getItem("activeSession")!))); }
    loadSession();
  }, []);
  async function updateInfo(e: React.SubmitEvent) {
    e.preventDefault();
    const res = await query(session!, `admin/roles`, { method: "POST", body: JSON.stringify({ name }) });
    if ("error" in res) {
      alert(res.error);
      return;
    }
    if ("redirect" in res) {
      window.location.href = res.redirect;
      return;
    }
    router.push(`/admin/roles/${res.body.id}`);
  }
  return (
    <form onSubmit={updateInfo} className="flex flex-col gap-2">
      <div className="flex flex-col gap-1 items-center mt-2">
        <label htmlFor="name">Name</label>
        <input id="name" className="border-2 border-black bg-slate-500 text-black p-1 rounded-xl w-fit" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="md:col-span-3 text-center"><button type="submit" className="rounded-xl p-1 px-2 mt-2 bg-violet-500 hover:text-sky-500 w-fit">Create</button></div>
    </form>
  );
}