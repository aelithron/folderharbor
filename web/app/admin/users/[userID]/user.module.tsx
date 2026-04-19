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
    <div className="flex flex-col">
      <p className="text-sm text-slate-700 mb-4">User ID: {userID}</p>
      {(session && user) && <SettingsPanel session={session} user={user} userID={userID} />}
      {(!session || !user) && <p className="text-lg text-center mt-2">Loading...</p>}
    </div>
  );
}
function SettingsPanel({ session, user, userID }: { session: Session, user: LimitedUser | FullUser, userID: number }) {
  const router = useRouter();
  const [username, setUsername] = useState<string>(user.username);
  const [password, setPassword] = useState<string>("");
  async function updateInfo(e: React.SubmitEvent) {
    e.preventDefault();
    const res = await query(session, `admin/users/${userID}`, { method: "PATCH", body: JSON.stringify({ username: (username !== user.username ? username : undefined), password: (password !== "" ? password : undefined) }) });
    if ("error" in res) {
      alert(res.error);
      return;
    }
    if ("redirect" in res) {
      window.location.href = res.redirect;
      return;
    }
    alert(`Updated ${username !== user.username ? username : user.username}'s information!${password !== "" ? "\nThey have been signed out across their devices, and will need to log in again." : ""}`);
  }
  async function toggleLock() {
    const res = await query(session, `admin/users/${userID}/lock`, { method: "PATCH", body: JSON.stringify({ locked: !user.locked }) });
    if ("error" in res) {
      alert(res.error);
      return;
    }
    if ("redirect" in res) {
      window.location.href = res.redirect;
      return;
    }
    window.location.reload();
  }
  async function deleteUser() {
    const check = confirm(`Are you sure you want to permanently delete "${user.username}" (ID ${userID}) on "${session.server}"?`);
    if (!check) return;
    const res = await query(session, `admin/users/${userID}`, { method: "DELETE" });
    if ("error" in res) {
      alert(res.error);
      return;
    }
    if ("redirect" in res) {
      window.location.href = res.redirect;
      return;
    }
    router.push("/admin/users");
  }
  async function revokeSession(id: number) {
    const res = await query(session, `admin/sessions/${id}`, { method: "DELETE" });
    if ("error" in res) {
      alert(res.error);
      return;
    }
    if ("redirect" in res) {
      // eslint-disable-next-line react-hooks/immutability
      window.location.href = res.redirect;
      return;
    }
    window.location.reload();
  }
  async function clearFailedLogins() {
    const res = await query(session, `admin/users/${userID}`, { method: "PATCH", body: JSON.stringify({ clearLoginAttempts: true }) });
    if ("error" in res) {
      alert(res.error);
      return;
    }
    if ("redirect" in res) {
      window.location.href = res.redirect;
      return;
    }
    alert("Successfully reset failed login attempts!");
    window.location.reload();
  }
  return (
    <div className={`grid gap-4 grid-cols-1 ${user.access === "full" ? "md:grid-cols-3 md:grid-rows-2" : ""}`}>
      <div className="space-y-2">
        <h2 className="text-center text-xl font-semibold">Basic</h2>
        {session.permissions.includes("users:edit") ? <form className="space-y-2" onSubmit={updateInfo}>
          <div className="flex flex-col gap-1 items-center">
            <label htmlFor="username" className="text-lg">Username</label>
            <input id="username" className="border-2 border-black bg-slate-500 text-black p-1 rounded-xl w-fit" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1 items-center">
            <label htmlFor="password" className="text-lg">Password</label>
            <input id="password" type="password" placeholder="(leave blank to not change)" className="border-2 border-black bg-slate-500 text-black p-1 rounded-xl w-fit" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="md:col-span-3 text-center"><button type="submit" className="rounded-xl p-1 px-2 mt-2 bg-violet-500 hover:text-sky-500 w-fit">Save</button></div>
        </form> : <div>
          <div className="flex flex-col gap-1 items-center">
            <label htmlFor="username">Username</label>
            <pre>{username}</pre>
          </div>
        </div>}
        <div className="flex gap-3 items-center mt-6 justify-center">
          <p>Locked: {user.locked ? "Yes" : "No"}</p>
          {session.permissions.includes("users:lock") && <button onClick={toggleLock} className="rounded-xl p-1 px-2 bg-violet-500 hover:text-sky-500 w-fit">{user.locked ? "Unlock" : "Lock"}</button>}
        </div>
        <div className="flex gap-3 items-center mt-2 justify-center">
          <p>Failed Logins: {user.failedLogins}</p>
          {session.permissions.includes("users:edit") && <button onClick={clearFailedLogins} className="rounded-xl p-1 px-2 bg-red-500 hover:text-sky-500 w-fit">Reset</button>}
        </div>
        {session.permissions.includes("users:delete") && <div>
          <h2 className="text-lg">Danger</h2>
          <button onClick={deleteUser} className="rounded-xl p-1 px-2 bg-red-500 hover:text-sky-500 w-fit mt-2">Delete User</button>
        </div>}
      </div>
      {user.access === "full" && <UserGrants session={session} user={user as FullUser} userID={userID} />}
      {user.access === "full" && <div className="flex flex-col gap-3 items-center md:col-span-3">
        <h2 className="text-xl font-semibold">Sessions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {(user as FullUser).sessions && (user as FullUser).sessions!.map((sessionItem) => <div key={sessionItem.id} className="flex gap-4 bg-slate-600 p-2 rounded-lg items-center">
            <div className="flex flex-col">
              <p className="text-lg">Session #{sessionItem.id}</p>
              <p>Created {new Date(sessionItem.createdAt).toLocaleString()}</p>
              <p>Expires {new Date(sessionItem.expiry).toLocaleString()}</p>
            </div>
            {session.permissions.includes("users:edit") && <button className="hover:text-sky-500 bg-red-500 p-1 rounded-xl" onClick={() => revokeSession(sessionItem.id)}><FontAwesomeIcon icon={faTrash} /></button>}
          </div>)}
          {(!(user as FullUser).sessions || (user as FullUser).sessions!.length === 0) && <p className="md:col-span-3">None</p>}
        </div>
      </div>}
    </div>
  );
}
function UserGrants({ session, user, userID }: { session: Session, user: FullUser, userID: number }) {
  const [roles, setRoles] = useState<number[]>(user.roles);
  const [acls, setACLs] = useState<number[]>(user.acls);
  const [permissions, setPermissions] = useState<string[]>(user.permissions);
  const [newGrant, setNewGrant] = useState<{ role: string, acl: string, permission: string }>({ role: "", acl: "", permission: "" });
  const [lists, setLists] = useState<{ roles?: { id: number, name: string }[], acls?: { id: number, name: string }[], permissions?: { id: string, description: string }[] }>({});
  useEffect(() => {
    async function loadLists() {
      if (!session) return;
      let roles;
      let acls;
      if (session.permissions.includes("roles:list")) {
        roles = await query(session, `admin/roles`);
        if ("error" in roles) {
          alert(roles.error);
          return;
        }
        if ("redirect" in roles) {
          window.location.href = roles.redirect;
          return;
        }
      }
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
      setLists({ roles: (roles ? roles.body : undefined), acls: (acls ? acls.body : undefined), permissions: permissions.body });
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
    const res = await query(session, `admin/users/${userID}/grant`, { method: "PUT", body: JSON.stringify({ roles: (!isEqual(roles, user.roles) ? roles : undefined), acls: (!isEqual(acls, user.acls) ? acls : undefined), permissions: (!isEqual(permissions, user.permissions) ? permissions : undefined) }) });
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
        <div className="flex flex-col justify-between">
          <div className="flex flex-col">
            <h1 className="text-lg">Roles</h1>
            <ul className="list-disc list-inside">{roles.map((role) => <div key={role} className="flex justify-between">
              <li>{session.permissions.includes("roles:read") ? <Link href={`/admin/roles/${role}`} className="underline hover:text-sky-500">{lists.roles ? `${lists.roles.find((item) => item.id === role)?.name || "Role"} (#${role})` : role}</Link> : (lists.roles ? `${lists.roles.find((item) => item.id === role)?.name || "Role"} (#${role})` : role)}</li>
              {session.permissions.includes("users:grant") && <button onClick={() => revokeItem(role, roles, setRoles)} className="ml-1 hover:text-sky-500"><FontAwesomeIcon icon={faTrash} /></button>}
            </div>)}</ul>
            {roles.length === 0 && <p>None</p>}
          </div>
          {session.permissions.includes("users:grant") && <div className="flex gap-2 items-center justify-center mt-2">
            {lists.roles ? <select className="bg-slate-500 p-1 rounded-lg w-24" value={newGrant.role} onChange={(e) => setNewGrant({ ...newGrant, role: e.target.value })}>
              <option></option>
              {lists.roles.filter((role) => roles.find((item) => item === role.id) === undefined).sort((a, b) => a.id - b.id).map((role) => <option key={role.id} value={role.id}>{role.name} (ID #{role.id})</option>)}
            </select>
              : <input className="bg-slate-500 p-1 rounded-lg w-24" value={newGrant.role} onChange={(e) => setNewGrant({ ...newGrant, role: e.target.value })} />}
            <button onClick={() => grantItem(parseInt(newGrant.role), roles, setRoles)} className="bg-violet-500 p-1 rounded-lg"><FontAwesomeIcon icon={faPlus} /></button>
          </div>}
        </div>
        <div className="flex flex-col justify-between">
          <div className="flex flex-col">
            <h1 className="text-lg">ACLs</h1>
            <ul className="list-disc list-inside">{acls.map((acl) => <div key={acl} className="flex justify-between">
              <li>{session.permissions.includes("acls:read") ? <Link href={`/admin/acls/${acl}`} className="underline hover:text-sky-500">{lists.acls ? `${lists.acls.find((item) => item.id === acl)?.name || "ACL"} (#${acl})` : acl}</Link> : (lists.acls ? `${lists.acls.find((item) => item.id === acl)?.name || "ACL"} (#${acl})` : acl)}</li>
              {session.permissions.includes("users:grant") && <button onClick={() => revokeItem(acl, acls, setACLs)} className="ml-1 hover:text-sky-500"><FontAwesomeIcon icon={faTrash} /></button>}
            </div>)}</ul>
            {acls.length === 0 && <p>None</p>}
          </div>
          {session.permissions.includes("users:grant") && <div className="flex gap-2 items-center justify-center mt-2">
            {lists.acls ? <select className="bg-slate-500 p-1 rounded-lg w-24" value={newGrant.acl} onChange={(e) => setNewGrant({ ...newGrant, acl: e.target.value })}>
              <option></option>
              {lists.acls.filter((acl) => acls.find((item) => item === acl.id) === undefined).sort((a, b) => a.id - b.id).map((acl) => <option key={acl.id} value={acl.id}>{acl.name} (ID #{acl.id})</option>)}
            </select>
              : <input className="bg-slate-500 p-1 rounded-lg w-24" value={newGrant.acl} onChange={(e) => setNewGrant({ ...newGrant, acl: e.target.value })} />}
            <button onClick={() => grantItem(parseInt(newGrant.acl), acls, setACLs)} className="bg-violet-500 p-1 rounded-lg"><FontAwesomeIcon icon={faPlus} /></button>
          </div>}
        </div>
        <div className="flex flex-col justify-between">
          <div className="flex flex-col">
            <h1 className="text-lg">Direct Permissions</h1>
            <ul className="list-disc list-inside">{permissions.map((permission) => <div key={permission} className="flex justify-between">
              <li>{permission}</li>
              {session.permissions.includes("users:grant") && <button onClick={() => revokeItem(permission, permissions, setPermissions)} className="ml-1 hover:text-sky-500"><FontAwesomeIcon icon={faTrash} /></button>}
            </div>)}</ul>
            {permissions.length === 0 && <p>None</p>}
          </div>
          {session.permissions.includes("users:grant") && <div className="flex gap-2 items-center justify-center mt-2">
            {lists.permissions ? <select className="bg-slate-500 p-1 rounded-lg w-24" value={newGrant.permission} onChange={(e) => setNewGrant({ ...newGrant, permission: e.target.value })}>
              <option></option>
              {lists.permissions.filter((permission) => permissions.find((item) => item === permission.id) === undefined).map((permission) => <option key={permission.id} value={permission.id}>{permission.id}</option>)}
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