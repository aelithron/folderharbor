"use client"
import { Session } from "@/folderharborweb";
import query from "@/utils/api";
import { db } from "@/utils/db";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
      {(session && user) && <SettingsPanel session={session} user={user} />}
      {(!session || !user) && <p className="text-lg text-center mt-2">Loading...</p>}
    </div>
  );
}
function SettingsPanel({ session, user }: { session: Session, user: LimitedUser | FullUser }) {
  const [username, setUsername] = useState<string>(user.username);
  const [password, setPassword] = useState<string>("");
  return (
    <div className={`grid gap-4 grid-cols-1 ${user.access === "full" ? "md:grid-cols-3 md:grid-rows-2" : ""}`}>
      <form className="space-y-2">
        <h2 className="text-center text-xl font-semibold">Basic</h2>
        {session.permissions.includes("users:edit") ? <div>
          <div className="flex flex-col gap-1 items-center">
            <label htmlFor="username" className="text-lg">Username</label>
            <input id="username" className="border-2 border-black bg-slate-500 text-black p-1 rounded-xl w-fit" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1 items-center">
            <label htmlFor="password" className="text-lg">Password</label>
            <input id="password" type="password" placeholder="(leave blank to not change)" className="border-2 border-black bg-slate-500 text-black p-1 rounded-xl w-fit" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="md:col-span-3 text-center"><button type="submit" className="rounded-xl p-1 px-2 mt-2 bg-violet-500 hover:text-sky-500 w-fit">Save Changes</button></div>
        </div> : <div>
          <div className="flex flex-col gap-1 items-center">
            <label htmlFor="username">Username</label>
            <pre>{username}</pre>
          </div>
        </div>}
        <div className="flex flex-col gap-1 items-center mt-6">
          <h2 className="text-lg">Failed Logins</h2>
          <p>Count: {user.failedLogins}</p>
          {session.permissions.includes("users:edit") && <button type="button" className="rounded-xl p-1 px-2 bg-red-500 hover:text-sky-500 w-fit mt-2" onClick={() => clearFailedLogins()}>Reset</button>}
        </div>
      </form>
      {user.access === "full" && <div className="flex flex-col gap-4 items-center">
        <h2 className="text-xl font-semibold">Sessions</h2>
        {(user as FullUser).sessions && (user as FullUser).sessions!.map((session) => <div key={session.id} className="flex gap-4 bg-slate-600 p-2 rounded-lg items-center">
          <div className="flex flex-col">
            <p className="text-lg">Session #{session.id}</p>
            <p>Created {new Date(session.createdAt).toLocaleString()}</p>
            <p>Expires {new Date(session.expiry).toLocaleString()}</p>
          </div>
          <button className="hover:text-sky-500 bg-red-500 p-1 rounded-xl" onClick={() => revokeSession(session.id)}><FontAwesomeIcon icon={faTrash} /></button>
        </div>)}
      </div>}
    </div>
  );
}