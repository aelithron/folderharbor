"use client"
import { db } from "@/utils/db";
import { useState } from "react"

export default function LoginForm() {
  const [server, setServer] = useState<string>(process.env.NEXT_PUBLIC_DEFAULT_URL || "");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    let body;
    const url = new URL(server);
    url.pathname += "auth";
    try {
      const res = await fetch(url.toString(), { method: "POST", body: JSON.stringify({ username, password }), headers: { "Content-Type": "application/json" } });
      body = await res.json();
    } catch (err) {
      alert(`Error logging you in: ${err}`);
      return;
    }
    if (body.error) {
      alert(`Error logging you in: ${body.message} (${body.error})`);
      return;
    }
    await db.sessions.add({ server, token: body.token });
  }
  return (
    <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-1">
        <label htmlFor="server">Server</label>
        <input id="server" className="border-2 border-black bg-slate-500 text-black p-1 rounded-xl" value={server} onChange={(e) => setServer(e.target.value)} />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="username">Username</label>
        <input id="username" className="border-2 border-black bg-slate-500 text-black p-1 rounded-xl" value={username} onChange={(e) => setUsername(e.target.value)} />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="password">Password</label>
        <input id="password" type="password" className="border-2 border-black bg-slate-500 text-black p-1 rounded-xl" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <button type="submit" className="rounded-xl p-1 mt-2 bg-violet-500 hover:text-sky-500">Log In</button>
    </form>
  );
}