"use client"
import { Session } from "@/folderharborweb";
import query from "@/utils/api";
import { db } from "@/utils/db";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ACLs() {
  const [session, setSession] = useState<Session | undefined>();
  const [acls, setACLs] = useState<{ id: number, name: string }[] | undefined>();
  useEffect(() => {
    async function loadSession() { if (localStorage.getItem("activeSession")) setSession(await db.sessions.get(parseInt(localStorage.getItem("activeSession")!))); }
    loadSession();
  }, []);
  useEffect(() => {
    async function loadACLs() {
      if (!session) return;
      const res = await query(session, "admin/acls");
      if ("error" in res) {
        alert(res.error);
        return;
      }
      if ("redirect" in res) {
        window.location.href = res.redirect;
        return;
      }
      setACLs(res.body);
    }
    loadACLs();
  }, [session]);
  return (
    <div className="flex flex-col mt-4">
      {(session && acls) && <div className="bg-slate-700 p-2 rounded-lg gap-2">
        {acls.sort((a, b) => a.id - b.id).map((acl) => <div key={acl.id} className="flex gap-2 items-center">
          {session.permissions.includes("acls:read") ? <Link href={`/admin/acls/${acl.id}`} className="font-semibold text-lg underline hover:text-sky-500">{acl.name}</Link> : <h1 className="font-semibold text-lg">{acl.name}</h1>}
          <p className="text-sm text-slate-500">(ACL #{acl.id})</p>
        </div>)}
      </div>}
      {(!session || !acls) && <p className="text-lg text-center mt-2">Loading...</p>}
    </div>
  );
}