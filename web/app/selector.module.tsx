"use client"
import { Session } from "@/folderharborweb";
import { db } from "@/utils/db";
import { useLiveQuery } from "dexie-react-hooks";
import Link from "next/link";

export default function AccountSelector() {
  const sessions = useLiveQuery(() => db.sessions.toArray());
  async function logOut(session: Session) {
    const check = confirm(`Are you sure you want to log out of ${session.server}?`);
    if (!check) return;
    const tokenCheck = confirm("Do you want to invalidate this session's token? This will disconnect any clients you logged into with this token.");
    if (tokenCheck) {
      let body;
      const url = new URL(session.server);
      url.pathname += "auth";
      try {
        const res = await fetch(url.toString(), { method: "DELETE", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.token}` } });
        if (res.status !== 204) body = await res.json();
      } catch (err) {
        alert(`Error logging you out: ${err}`);
        return;
      }
      if (body && body.error) {
        alert(`Error logging you out: ${body.message} (${body.error})`);
        return;
      }
    }
    await db.sessions.delete(session.webID);
  }
  return (
    <div className="flex flex-col">
      {sessions === undefined && <p>Loading...</p>}
      {sessions?.length === 0 && <div className="flex flex-col">
        <p>You aren&apos;t signed in yet!</p>
        <Link href={"/auth"} className="bg-violet-500 text-white hover:text-sky-500 p-1 text-lg rounded-lg mt-3">Sign In</Link>
      </div>}
      {sessions?.length !== 0 && <div className="flex flex-col gap-2">
        <h1 className="text-lg">Sessions</h1>
        {sessions?.map((session) => <div key={session.webID} className="flex gap-2 justify-between items-center p-2 bg-slate-500 rounded-xl">
          <div>
            <p>{session.server}</p>
          </div>
          <button className="bg-red-500 p-1 rounded-xl hover:text-sky-500" onClick={() => logOut(session)}>x</button>
        </div>)}
      </div>}
    </div>
  );
}