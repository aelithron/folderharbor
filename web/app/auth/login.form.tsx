"use client"
import { db } from "@/utils/db";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import { useState } from "react"

export default function LoginForm() {
  const router = useRouter();
  const [stage, setStage] = useState<"server" | "credentials">("server");
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
    const session = await db.sessions.add({ server: new URL(server).toString(), token: body.token, username: username });
    if (session) localStorage.setItem("activeSession", session.toString());
    router.push("/");
  }
  return (
    <div className="flex flex-col gap-2 items-center">
      <button onClick={() => setStage("server")}>server stage</button>
      <button onClick={() => setStage("credentials")}>credentials stage</button>
      {stage === "server" && <div className="gap-2">
        <h2 className="text-lg font-semibold">Select a Server</h2>
        {process.env.NEXT_PUBLIC_DEFAULT_URL && <button className="flex p-4 bg-slate-600 rounded-lg" onClick={() => {
          setServer(process.env.NEXT_PUBLIC_DEFAULT_URL!);
          setStage("credentials");
        }}>
          <div className="flex flex-col gap-1 align-middle">
            <h3 className="font-semibold">Default Server</h3>
            <p className="text-sm">{process.env.NEXT_PUBLIC_DEFAULT_URL}</p>
          </div>
          <FontAwesomeIcon icon={faArrowRight} />
        </button>}
      </div>}
      {stage === "credentials" && <form onSubmit={handleSubmit}>
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
        <button type="submit" className="rounded-xl p-1 px-2 mt-2 bg-violet-500 hover:text-sky-500 w-fit">Sign In</button>
      </form>}
    </div>
  );
}