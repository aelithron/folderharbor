"use client"
import { Session } from "@/folderharborweb";
import query from "@/utils/api";
import { db } from "@/utils/db";
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { isEqual } from "lodash-es";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

type Role = { name: string, acls: number[], permissions: string[] }
export default function RoleSettings({ roleID }: { roleID: number }) {
  const [session, setSession] = useState<Session | undefined>();
  const [role, setRole] = useState<Role | undefined>();
  useEffect(() => {
    async function loadSession() { if (localStorage.getItem("activeSession")) setSession(await db.sessions.get(parseInt(localStorage.getItem("activeSession")!))); }
    loadSession();
  }, []);
  useEffect(() => {
    async function loadUser() {
      if (!session) return;
      const res = await query(session, `admin/roles/${roleID}`);
      if ("error" in res) {
        alert(res.error);
        return;
      }
      if ("redirect" in res) {
        window.location.href = res.redirect;
        return;
      }
      setRole(res.body);
    }
    loadUser();
  }, [session, roleID]);
  return (
    <div className="flex flex-col">
      <p className="text-sm text-slate-700 mb-4">Role ID: {roleID}</p>
      {(session && role) && <SettingsPanel session={session} role={role} roleID={roleID} />}
      {(!session || !role) && <p className="text-lg text-center mt-2">Loading...</p>}
    </div>
  );
}
function SettingsPanel({ session, role, roleID }: { session: Session, role: Role, roleID: number }) {
  const router = useRouter();
  const [name, setName] = useState<string>(role.name);
  async function updateInfo(e: React.SubmitEvent) {
    e.preventDefault();
    const res = await query(session, `admin/roles/${roleID}`, { method: "PATCH", body: JSON.stringify({ name: (name !== role.name ? name : undefined) }) });
    if ("error" in res) {
      alert(res.error);
      return;
    }
    if ("redirect" in res) {
      window.location.href = res.redirect;
      return;
    }
    alert(`Updated ${name !== role.name ? name : role.name}'s information!`);
  }
  async function deleteRole() {
    const check = confirm(`Are you sure you want to permanently delete the role "${role.name}" (ID ${roleID}) on "${session.server}"?`);
    if (!check) return;
    const res = await query(session, `admin/roles/${roleID}`, { method: "DELETE" });
    if ("error" in res) {
      alert(res.error);
      return;
    }
    if ("redirect" in res) {
      window.location.href = res.redirect;
      return;
    }
    router.push("/admin/roles");
  }
  return (
    <div className={`grid gap-4 grid-cols-1 ${session.permissions.includes("roles:edit") ? "md:grid-cols-3" : ""}`}>
      <div className="space-y-2">
        <h2 className="text-center text-xl font-semibold">Basic</h2>
        {session.permissions.includes("roles:edit") ? <form className="space-y-2" onSubmit={updateInfo}>
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
        {session.permissions.includes("roles:delete") && <div>
          <h2 className="text-lg">Danger</h2>
          <button onClick={deleteRole} className="rounded-xl p-1 px-2 bg-red-500 hover:text-sky-500 w-fit mt-2">Delete Role</button>
        </div>}
      </div>
      <RoleGrants session={session} role={role} roleID={roleID} />
    </div>
  );
}
function RoleGrants({ session, role, roleID }: { session: Session, role: Role, roleID: number }) {
  const [acls, setACLs] = useState<number[]>(role.acls);
  const [permissions, setPermissions] = useState<string[]>(role.permissions);
  const [newGrant, setNewGrant] = useState<{ acl: string, permission: string }>({ acl: "", permission: "" });
  const [lists, setLists] = useState<{ roles?: { id: number, name: string }[], acls?: { id: number, name: string }[], permissions?: { id: string, description: string }[] }>({});
  useEffect(() => {
    async function loadLists() {
      if (!session) return;
      let acls;
      if (session.permissions.includes("acls:list")) {
        acls = await query(session, `admin/acls`);
        if ("error" in acls) {
          alert(acls.error);
          return;
        }
        if ("redirect" in acls) {
          window.location.href = acls.redirect;
          return;
        }
      }
      const permissions = await query(session, `admin/permissions`);
      if ("error" in permissions) {
        alert(permissions.error);
        return;
      }
      if ("redirect" in permissions) {
        window.location.href = permissions.redirect;
        return;
      }
      setLists({ acls: (acls ? acls.body : undefined), permissions: permissions.body });
    }
    loadLists();
  }, [session]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function grantItem(item: any, state: any[], setState: Dispatch<SetStateAction<any[]>>) {
    if (!item || item === "") return;
    const newState = new Set<unknown>();
    for (const current of state) newState.add(current);
    newState.add(item);
    setState([...newState]);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function revokeItem(item: any, state: any[], setState: Dispatch<SetStateAction<any[]>>) { setState(state.filter((current) => current !== item)); }
  async function applyChanges() {
    const res = await query(session, `admin/roles/${roleID}`, { method: "PATCH", body: JSON.stringify({ acls: (!isEqual(acls, role.acls) ? acls : undefined), permissions: (!isEqual(permissions, role.permissions) ? permissions : undefined) }) });
    if ("error" in res) {
      alert(res.error);
      return;
    }
    if ("redirect" in res) {
      window.location.href = res.redirect;
      return;
    }
    if (res.body.message !== "Nothing to update.") alert("Saved new grants successfully!");
  }
  return (
    <div className="flex flex-col gap-4 items-center md:col-span-2">
      <h2 className="text-xl font-semibold">Grants</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
        <div className="flex flex-col justify-between">
          <div className="flex flex-col">
            <h1 className="text-lg">ACLs</h1>
            <ul className="list-disc list-inside">{acls.map((acl) => <div key={acl} className="flex justify-between">
              <li>{session.permissions.includes("acls:read") ? <Link href={`/admin/acl/${acl}`} className="underline hover:text-sky-500">{lists.acls ? `${lists.acls.find((item) => item.id === acl)?.name || "ACL"} (#${acl})` : acl}</Link> : (lists.acls ? `${lists.acls.find((item) => item.id === acl)?.name || "ACL"} (#${acl})` : acl)}</li>
              {session.permissions.includes("users:grant") && <button onClick={() => revokeItem(acl, acls, setACLs)} className="ml-1 hover:text-sky-500"><FontAwesomeIcon icon={faTrash} /></button>}
            </div>)}</ul>
            {acls.length === 0 && <p>None</p>}
          </div>
          {session.permissions.includes("users:grant") && <div className="flex gap-2 items-center justify-center mt-2">
            {lists.acls ? <select className="bg-slate-500 p-1 rounded-lg w-24" value={newGrant.acl} onChange={(e) => setNewGrant({ ...newGrant, acl: e.target.value })}>
              <option></option>
              {lists.acls.sort((a, b) => a.id - b.id).map((acl) => <option key={acl.id} value={acl.id}>{acl.name} (ID #{acl.id})</option>)}
            </select>
              : <input className="bg-slate-500 p-1 rounded-lg w-24" value={newGrant.acl} onChange={(e) => setNewGrant({ ...newGrant, acl: e.target.value })} />}
            <button onClick={() => grantItem(parseInt(newGrant.acl), acls, setACLs)} className="bg-violet-500 p-1 rounded-lg"><FontAwesomeIcon icon={faPlus} /></button>
          </div>}
        </div>
        <div className="flex flex-col justify-between">
          <div className="flex flex-col">
            <h1 className="text-lg">Permissions</h1>
            <ul className="list-disc list-inside">{permissions.map((permission) => <div key={permission} className="flex justify-between">
              <li>{permission}</li>
              {session.permissions.includes("users:grant") && <button onClick={() => revokeItem(permission, permissions, setPermissions)} className="ml-1 hover:text-sky-500"><FontAwesomeIcon icon={faTrash} /></button>}
            </div>)}</ul>
            {permissions.length === 0 && <p>None</p>}
          </div>
          {session.permissions.includes("users:grant") && <div className="flex gap-2 items-center justify-center mt-2">
            {lists.permissions ? <select className="bg-slate-500 p-1 rounded-lg w-24" value={newGrant.permission} onChange={(e) => setNewGrant({ ...newGrant, permission: e.target.value })}>
              <option></option>
              {lists.permissions.map((permission) => <option key={permission.id} value={permission.id}>{permission.id}</option>)}
            </select>
              : <input className="bg-slate-500 p-1 rounded-lg w-24" value={newGrant.permission} onChange={(e) => setNewGrant({ ...newGrant, permission: e.target.value })} />}
            <button onClick={() => grantItem(newGrant.permission, permissions, setPermissions)} className="bg-violet-500 p-1 rounded-lg"><FontAwesomeIcon icon={faPlus} /></button>
          </div>}
        </div>
      </div>
      {session.permissions.includes("users:grant") && <button onClick={applyChanges} className="rounded-xl p-1 px-2 bg-violet-500 hover:text-sky-500 w-fit">Save Grants</button>}
    </div>
  );
}