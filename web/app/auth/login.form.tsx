"use client"
import { db } from "@/utils/db";
import { faArrowRight, faPencil } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import { useState } from "react"

export default function LoginForm() {
  const router = useRouter();
  const [stage, setStage] = useState<"server" | "credentials">("server");
  const [server, setServer] = useState<string>("");
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
      {stage === "server" && <div className="flex flex-col items-center gap-2">
        <h2 className="text-lg font-semibold">Select a Server</h2>
        {process.env.NEXT_PUBLIC_DEFAULT_URL && <button className="flex p-2.5 gap-2 bg-slate-600 rounded-lg items-center text-center w-full" onClick={() => {
          setServer(process.env.NEXT_PUBLIC_DEFAULT_URL!);
          setStage("credentials");
        }}>
          <div className="flex flex-col gap-1 items-center w-full">
            <h3 className="font-semibold text-lg">Default Server</h3>
            <p className="text-sm">{process.env.NEXT_PUBLIC_DEFAULT_URL}</p>
          </div>
          <FontAwesomeIcon icon={faArrowRight} className="hover:text-sky-500" />
        </button>}
        <form className="flex flex-col p-2.5 gap-2 bg-slate-600 rounded-lg items-center" onSubmit={(e) => {
          e.preventDefault();
          try {
            new URL(server);
          } catch {
            alert(`Please enter a valid URL to continue (starting with "http://" or "https://").`);
            return;
          }
          setStage("credentials");
        }}>
          <label htmlFor="server">{process.env.NEXT_PUBLIC_DEFAULT_URL ? "Or, e" : "E"}nter a server address:</label>
          <div className="flex gap-2">
            <input id="server" className="border-2 border-black bg-slate-500 text-black p-1 rounded-xl" value={server} onChange={(e) => setServer(e.target.value)} />
            <button type="submit" className="hover:text-sky-500"><FontAwesomeIcon icon={faArrowRight} /></button>
          </div>
        </form>
      </div>}
      {stage === "credentials" && <form onSubmit={handleSubmit}>
        <div className="flex gap-1 mb-3" onClick={() => setStage("server")}>Server: <pre className="hover:text-sky-500">{server} <FontAwesomeIcon icon={faPencil} /></pre></div>
        <div className="flex flex-col gap-1 items-center">
          <label htmlFor="username">Username</label>
          <input id="username" className="border-2 border-black bg-slate-500 text-black p-1 rounded-xl w-fit" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1 items-center">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" className="border-2 border-black bg-slate-500 text-black p-1 rounded-xl w-fit" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button type="submit" className="rounded-xl p-1 px-2 mt-2 bg-violet-500 hover:text-sky-500 w-fit">Sign In</button>
      </form>}
    </div>
  );
}