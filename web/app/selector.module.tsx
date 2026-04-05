"use client"
import { db } from "@/utils/db";
import { useLiveQuery } from "dexie-react-hooks";
import Link from "next/link";

export default function AccountSelector() {
  const sessions = useLiveQuery(() => db.sessions.toArray());
  return (
    <div className="flex flex-col">
      {sessions === undefined && <p>Loading...</p>}
      {sessions?.length === 0 && <div className="flex flex-col">
        <p>You aren&apos;t signed in yet!</p>
        <Link href={"/auth"} className="bg-violet-500 text-white hover:text-sky-500 p-1 text-lg rounded-lg mt-3">Sign In</Link>
      </div>}
      {sessions?.length !== 0 && <div className="flex flex-col">
        <h1 className="text-lg">Sessions</h1>
        {sessions?.map((session) => <div key={session.webID} className="flex gap-2 justify-between items-center p-2 bg-slate-500 rounded-xl">
          <div>
            <p>{session.server}</p>
          </div>
          <button className="bg-red-500 p-1 rounded-xl hover:text-sky">x</button>
        </div>)}
      </div>}
    </div>
  );
}