"use client"
import { Session } from "@/folderharborweb";
import { getClient, handleError } from "@/utils/api";
import { db } from "@/utils/db";
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { isEqual } from "lodash-es";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

type ACL = { name: string, allow: string[], deny: string[] }
export default function ACLSettings({ aclID }: { aclID: number }) {
  const [session, setSession] = useState<Session | undefined>();
  const [acl, setACL] = useState<ACL | undefined>();
  useEffect(() => {
    async function loadSession() { if (localStorage.getItem("activeSession")) setSession(await db.sessions.get(parseInt(localStorage.getItem("activeSession")!))); }
    loadSession();
  }, []);
  useEffect(() => {
    async function loadACL() {
      if (!session) return;
      try {
        setACL(await getClient(session).admin.acls.get(aclID));
      } catch (e) {
        const errBody = handleError(e as Error);
        if ("error" in errBody) alert(errBody.error);
        if ("redirect" in errBody) window.location.href = errBody.redirect;
      }
    }
    loadACL();
  }, [session, aclID]);
  return (
    <div className="flex flex-col">
      <p className="text-sm text-slate-700 mb-4">ACL ID: {aclID}</p>
      {(session && acl) && <SettingsPanel session={session} acl={acl} aclID={aclID} />}
      {(!session || !acl) && <p className="text-lg text-center mt-2">Loading...</p>}
    </div>
  );
}
function SettingsPanel({ session, acl, aclID }: { session: Session, acl: ACL, aclID: number }) {
  const router = useRouter();
  const [name, setName] = useState<string>(acl.name);
  async function updateInfo(e: React.SubmitEvent) {
    e.preventDefault();
    try {
      await getClient(session).admin.acls.edit(aclID, { name: (name !== acl.name ? name : undefined) });
      alert(`Updated ${name !== acl.name ? name : acl.name}'s information!`);
    } catch (e) {
      const errBody = handleError(e as Error);
      if ("error" in errBody) alert(errBody.error);
      if ("redirect" in errBody) window.location.href = errBody.redirect;
    }
  }
  async function deleteACL() {
    const check = confirm(`Are you sure you want to permanently delete the ACL "${acl.name}" (ID ${aclID}) on "${session.server}"?`);
    if (!check) return;
    try {
      await getClient(session).admin.acls.delete(aclID);
      router.push("/admin/acls");
    } catch (e) {
      const errBody = handleError(e as Error);
      if ("error" in errBody) alert(errBody.error);
      if ("redirect" in errBody) window.location.href = errBody.redirect;
    }
  }
  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
      <div className="space-y-2">
        <h2 className="text-center text-xl font-semibold">Basic</h2>
        {session.permissions.includes("acls:edit") ? <form className="space-y-2" onSubmit={updateInfo}>
          <div className="flex flex-col gap-1 items-center">
            <label htmlFor="name" className="text-lg">Name</label>
            <input id="name" className="border-2 border-black bg-slate-500 text-black p-1 rounded-xl w-fit" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="md:col-span-3 text-center"><button type="submit" className="rounded-xl p-1 px-2 mt-2 bg-violet-500 hover:text-sky-500 w-fit">Save</button></div>
        </form> : <div>
          <div className="flex flex-col gap-1 items-center">
            <label htmlFor="name">Name</label>
            <pre>{name}</pre>
          </div>
        </div>}
        {session.permissions.includes("acls:delete") && <div>
          <h2 className="text-lg">Danger</h2>
          <button onClick={deleteACL} className="rounded-xl p-1 px-2 bg-red-500 hover:text-sky-500 w-fit mt-2">Delete ACL</button>
        </div>}
      </div>
      <ACLPaths session={session} acl={acl} aclID={aclID} />
    </div>
  );
}
function ACLPaths({ session, acl, aclID }: { session: Session, acl: ACL, aclID: number }) {
  const [allow, setAllow] = useState<string[]>(acl.allow);
  const [deny, setDeny] = useState<string[]>(acl.deny);
  const [newPath, setNewPath] = useState<{ allow: string, deny: string }>({ allow: "", deny: "" });
  function addPath(item: string, state: string[], setState: Dispatch<SetStateAction<string[]>>) {
    if (!item || item === "") return;
    const newState = new Set<string>();
    for (const current of state) newState.add(current);
    newState.add(item);
    setState([...newState]);
  }
  function removePath(item: string, state: string[], setState: Dispatch<SetStateAction<string[]>>) { setState(state.filter((current) => current !== item)); }
  async function applyChanges() {
    try {
      await getClient(session).admin.acls.edit(aclID, { allow: (!isEqual(allow, acl.allow) ? allow : undefined), deny: (!isEqual(deny, acl.deny) ? deny : undefined) });
      alert("Saved new paths successfully!");
    } catch (e) {
      const errBody = handleError(e as Error);
      if ("error" in errBody) alert(errBody.error);
      if ("redirect" in errBody) window.location.href = errBody.redirect;
    }
  }
  return (
    <div className="flex flex-col gap-4 items-center md:col-span-2">
      <h2 className="text-xl font-semibold">Paths</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
        <div className="flex flex-col justify-between">
          <div className="flex flex-col">
            <h1 className="text-lg">Allow</h1>
            <ul className="list-disc list-inside">{allow.map((path) => <div key={path} className="flex justify-between">
              <li>{path}</li>
              {session.permissions.includes("acls:edit") && <button onClick={() => removePath(path, allow, setAllow)} className="ml-1 hover:text-sky-500"><FontAwesomeIcon icon={faTrash} /></button>}
            </div>)}</ul>
            {allow.length === 0 && <p>None</p>}
          </div>
          {session.permissions.includes("acls:edit") && <div className="flex gap-2 items-center justify-center mt-2">
            <input className="bg-slate-500 p-1 rounded-lg w-24" value={newPath.allow} onChange={(e) => setNewPath({ ...newPath, allow: e.target.value })} />
            <button onClick={() => addPath(newPath.allow, allow, setAllow)} className="bg-violet-500 p-1 rounded-lg"><FontAwesomeIcon icon={faPlus} /></button>
          </div>}
        </div>
        <div className="flex flex-col justify-between">
          <div className="flex flex-col">
            <h1 className="text-lg">Deny</h1>
            <ul className="list-disc list-inside">{deny.map((path) => <div key={path} className="flex justify-between">
              <li>{path}</li>
              {session.permissions.includes("acls:edit") && <button onClick={() => removePath(path, deny, setDeny)} className="ml-1 hover:text-sky-500"><FontAwesomeIcon icon={faTrash} /></button>}
            </div>)}</ul>
            {deny.length === 0 && <p>None</p>}
          </div>
          {session.permissions.includes("acls:edit") && <div className="flex gap-2 items-center justify-center mt-2">
            <input className="bg-slate-500 p-1 rounded-lg w-24" value={newPath.deny} onChange={(e) => setNewPath({ ...newPath, deny: e.target.value })} />
            <button onClick={() => addPath(newPath.deny, deny, setDeny)} className="bg-violet-500 p-1 rounded-lg"><FontAwesomeIcon icon={faPlus} /></button>
          </div>}
        </div>
      </div>
      {session.permissions.includes("acls:edit") && <button onClick={applyChanges} className="rounded-xl p-1 px-2 bg-violet-500 hover:text-sky-500 w-fit">Save Paths</button>}
    </div>
  );
}