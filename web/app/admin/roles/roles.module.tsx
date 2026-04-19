"use client"
import { Session } from "@/folderharborweb";
import query from "@/utils/api";
import { db } from "@/utils/db";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Roles() {
  const [session, setSession] = useState<Session | undefined>();
  const [roles, setRoles] = useState<{ id: number, name: string }[] | undefined>();
  useEffect(() => {
    async function loadSession() { if (localStorage.getItem("activeSession")) setSession(await db.sessions.get(parseInt(localStorage.getItem("activeSession")!))); }
    loadSession();
  }, []);
  useEffect(() => {
    async function loadRoles() {
      if (!session) return;
      const res = await query(session, "admin/roles");
      if ("error" in res) {
        alert(res.error);
        return;
      }
      if ("redirect" in res) {
        window.location.href = res.redirect;
        return;
      }
      setRoles(res.body);
    }
    loadRoles();
  }, [session]);
  return (
    <div className="flex flex-col">
      <div className="flex justify-between gap-2 mb-3">
        <h1 className="text-2xl font-semibold">Roles</h1>
        {session?.permissions.includes("roles:create") && <Link href={"/admin/roles/create"} className="bg-violet-500 hover:text-sky-500 py-1 px-2 rounded-lg"><FontAwesomeIcon icon={faPlus} /> Create</Link>}
      </div>
      {(session && roles) && <div className="bg-slate-700 p-2 rounded-lg gap-2">
        {roles.sort((a, b) => a.id - b.id).map((role) => <div key={role.id} className="flex gap-2 items-center">
          {session.permissions.includes("roles:read") ? <Link href={`/admin/roles/${role.id}`} className="font-semibold text-lg underline hover:text-sky-500">{role.name}</Link> : <h1 className="font-semibold text-lg">{role.name}</h1>}
          <p className="text-sm text-slate-500">(Role #{role.id})</p>
        </div>)}
      </div>}
      {(!session || !roles) && <p className="text-lg text-center mt-2">Loading...</p>}
    </div>
  );
}