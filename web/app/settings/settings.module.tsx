"use client"
import { Session } from "@/folderharborweb";
import { getClient, handleError } from "@/utils/api";
import { db } from "@/utils/db";
import { FHClientConfig, FHSelfInfo } from "@folderharbor/sdk";
import { faLock, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Settings() {
  const [session, setSession] = useState<Session | undefined>();
  const [selfInfo, setSelfInfo] = useState<FHSelfInfo | undefined>();
  const [clientConfig, setClientConfig] = useState<FHClientConfig | undefined>();
  useEffect(() => {
    async function loadSession() { if (localStorage.getItem("activeSession")) setSession(await db.sessions.get(parseInt(localStorage.getItem("activeSession")!))); }
    loadSession();
  }, []);
  useEffect(() => {
    async function loadSelfInfo() {
      if (!session) return;
      try {
        setSelfInfo(await getClient(session).me.info());
      } catch (e) {
        const errBody = handleError(e as Error);
        if ("error" in errBody) alert(errBody.error);
        if ("redirect" in errBody) window.location.href = errBody.redirect;
      }
    }
    async function loadClientConfig() {
      if (!session) return;
      try {
        setClientConfig(await getClient(session).clientconfig());
      } catch (e) {
        const errBody = handleError(e as Error);
        if ("error" in errBody) alert(errBody.error);
        if ("redirect" in errBody) window.location.href = errBody.redirect;
      }
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
function SettingsForm({ session, selfInfo, clientConfig }: { session: Session, selfInfo: FHSelfInfo, clientConfig: FHClientConfig }) {
  const router = useRouter();
  const [username, setUsername] = useState<string>(selfInfo.username);
  const [password, setPassword] = useState<string>("");
  async function clearFailedLogins() {
    try {
      await getClient(session).me.edit({ clearLoginAttempts: true });
      alert("Successfully reset failed login attempts!");
      window.location.reload();
    } catch (e) {
      const errBody = handleError(e as Error);
      if ("error" in errBody) alert(errBody.error);
      if ("redirect" in errBody) window.location.href = errBody.redirect;
    }
  }
  async function revokeSession(id: number) {
    try {
      await getClient(session).me.revokeSession(id);
      window.location.reload();
    } catch (e) {
      const errBody = handleError(e as Error);
      if ("error" in errBody) alert(errBody.error);
      // eslint-disable-next-line react-hooks/immutability
      if ("redirect" in errBody) window.location.href = errBody.redirect;
    }
  }
  async function updateInfo(e: React.SubmitEvent) {
    e.preventDefault();
    try {
      await getClient(session).me.edit({ username: (username !== selfInfo.username ? username : undefined), password: (password !== "" ? password : undefined) });
      alert(`Updated your info successfully!${password !== "" ? `\nYou have been signed out of all sessions, and will need to log in again.\nAs a reminder, your server address is "${session.server}", and your username is "${username !== selfInfo.username ? username : selfInfo.username}".` : ""}`);
      if (password !== "") {
        db.sessions.delete(parseInt(localStorage.getItem("activeSession")!));
        localStorage.removeItem("activeSession");
        router.push("/");
        return;
      }
      if (username !== selfInfo.username) db.sessions.update(parseInt(localStorage.getItem("activeSession")!), { username: username });
    } catch (e) {
      const errBody = handleError(e as Error);
      if ("error" in errBody) alert(errBody.error);
      if ("redirect" in errBody) window.location.href = errBody.redirect;
    }
  }
  return (
    <div className={`grid grid-cols-1 ${selfInfo.permissions.length >= 1 ? "md:grid-cols-3" : "md:grid-cols-2"} gap-4 md:gap-2 my-4`}>
      <form className="space-y-2" onSubmit={updateInfo}>
        <h2 className="text-center text-xl font-semibold">Basic</h2>
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
        <div className="flex flex-col gap-1 items-center mt-6">
          <h2 className="text-xl font-semibold">Failed Logins</h2>
          <pre>Locked from new logins? {selfInfo.failedLoginLockout ? "Yes" : "No"}</pre>
          <button type="button" className="rounded-xl p-1 px-2 bg-red-500 hover:text-sky-500 w-fit mt-2" onClick={() => clearFailedLogins()}>Reset</button>
        </div>
      </form>
      <div className="flex flex-col gap-4 items-center">
        <h2 className="text-xl font-semibold">Sessions</h2>
        {selfInfo.sessions.map((session) => <div key={session.id} className="flex gap-4 bg-slate-600 p-2 rounded-lg items-center">
          <div className="flex flex-col">
            <p className="text-lg">Session #{session.id} {session.id === selfInfo.activeSession && "(Current)"}</p>
            <p>Created {new Date(session.createdAt).toLocaleString()}</p>
            <p>Expires {new Date(session.expiry).toLocaleString()}</p>
          </div>
          {session.id === selfInfo.activeSession ? <p className="bg-slate-500 p-1 rounded-xl"><FontAwesomeIcon icon={faLock} /></p> : <button className="hover:text-sky-500 bg-red-500 p-1 rounded-xl" onClick={() => revokeSession(session.id)}><FontAwesomeIcon icon={faTrash} /></button>}
        </div>)}
      </div>
      {selfInfo.permissions.length >= 1 && <div className="flex flex-col gap-3 items-center">
        <h2 className="text-xl font-semibold">Permissions</h2>
        <div className="flex flex-col gap-1 bg-slate-600 p-2 rounded-lg">{selfInfo.permissions.map((permission) => <pre key={permission}> - {permission}</pre>)}</div>
      </div>}
    </div>
  );
}