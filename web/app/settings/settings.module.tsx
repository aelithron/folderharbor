"use client"
import { Session } from "@/folderharborweb";
import query from "@/utils/api";
import { db } from "@/utils/db";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";

type SelfInfo = { id: number, username: string, sessions: { id: number, createdAt: string, expiry: string }[], activeSession: number, failedLoginLockout: boolean, permissions: string[] };
export default function Settings() {
  const [session, setSession] = useState<Session | undefined>();
  const [selfInfo, setSelfInfo] = useState<SelfInfo | undefined>();
  const [clientConfig, setClientConfig] = useState<{ selfUsernameChanges: boolean } | undefined>();
  useEffect(() => {
    async function loadSession() { if (localStorage.getItem("activeSession")) setSession(await db.sessions.get(parseInt(localStorage.getItem("activeSession")!))); }
    loadSession();
  }, []);
  useEffect(() => {
    async function loadSelfInfo() {
      if (!session) return;
      const res = await query(session, "me");
      if ("error" in res) {
        alert(res.error);
        return;
      }
      if ("redirect" in res) {
        window.location.href = res.redirect;
        return;
      }
      setSelfInfo(res.body);
    }
    async function loadClientConfig() {
      if (!session) return;
      const res = await query(session, "clientconfig");
      if ("error" in res) {
        alert(res.error);
        return;
      }
      if ("redirect" in res) {
        window.location.href = res.redirect;
        return;
      }
      setClientConfig({ selfUsernameChanges: res.body.selfUsernameChanges });
    }
    loadSelfInfo();
    loadClientConfig();
  }, [session]);
  return (
    <div className="flex flex-col">
      {(session && selfInfo && clientConfig) && <SettingsForm session={session} selfInfo={selfInfo} clientConfig={clientConfig} />}
      {(!session || !selfInfo || !clientConfig) && <p className="text-lg text-center mt-2">Loading...</p>}
    </div>
  );
}
function SettingsForm({ session, selfInfo, clientConfig }: { session: Session, selfInfo: SelfInfo, clientConfig: { selfUsernameChanges: boolean } }) {
  const [username, setUsername] = useState<string>(selfInfo.username);
  const [password, setPassword] = useState<string>("");
  async function clearFailedLogins() {
    const res = await query(session, "me", { method: "PATCH", body: JSON.stringify({ clearLoginAttempts: true }) });
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
  async function revokeSession(id: number) {
    const res = await query(session, "me/session", { method: "DELETE", body: JSON.stringify({ sessionID: id }) });
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
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-4">
      <form className="space-y-2">
        <h2 className="text-center text-xl">Basic</h2>
        <div className="flex flex-col gap-1 items-center">
          <label htmlFor="username">Username</label>
          {clientConfig.selfUsernameChanges
            ? <input id="username" className="border-2 border-black bg-slate-500 text-black p-1 rounded-xl w-fit" value={username} onChange={(e) => setUsername(e.target.value)} />
            : <div className="flex flex-col text-center items-center">
              <p className="border-2 border-black bg-slate-500 text-black p-1 rounded-xl w-fit">{username}</p>
              <p>You can&apos;t change your own username!</p>
              <p>Please ask your administrator to change it instead.</p>
            </div>
          }
        </div>
        <div className="flex flex-col gap-1 items-center">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" placeholder="(leave blank to not change)" className="border-2 border-black bg-slate-500 text-black p-1 rounded-xl w-fit" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div className="md:col-span-3 text-center"><button type="submit" className="rounded-xl p-1 px-2 mt-2 bg-violet-500 hover:text-sky-500 w-fit">Save Changes</button></div>
      </form>
      <div className="flex flex-col gap-1 items-center">
        <h2 className="mb-2 text-xl">Failed Logins</h2>
        <pre>Locked? {selfInfo.failedLoginLockout ? "Yes" : "No"}</pre>
        <button className="rounded-xl p-1 px-2 bg-red-500 hover:text-sky-500 w-fit mt-2" onClick={() => clearFailedLogins()}>Reset</button>
      </div>
      <div className="flex flex-col gap-4 items-center">
        <h2 className="text-xl">Sessions</h2>
        {selfInfo.sessions.map((session) => <div key={session.id} className="flex gap-4 bg-slate-600 p-2 rounded-lg items-center">
          <div className="flex flex-col">
            <p className="text-lg">Session #{session.id}</p>
            <p>Created {new Date(session.createdAt).toLocaleString()}</p>
            <p>Expires {new Date(session.expiry).toLocaleString()}</p>
          </div>
          <button className="hover:text-sky-500 bg-red-500 p-1 rounded-xl" onClick={() => revokeSession(session.id)}><FontAwesomeIcon icon={faTrash} /></button>
        </div>)}
      </div>
    </div>
  );
}