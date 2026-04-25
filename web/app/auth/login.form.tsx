"use client"
import { ClientConfig } from "@/folderharborweb";
import { db } from "@/utils/db";
import { faArrowRight, faPencil } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react"

export default function LoginForm({ defaultURL }: { defaultURL: string | undefined }) {
  const router = useRouter();
  const [stage, setStage] = useState<"server" | "credentials">("server");
  const [server, setServer] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [clientConfig, setClientConfig] = useState<ClientConfig | undefined>();
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
    const session = await db.sessions.add({ server: new URL(server).toString(), token: body.token, username: username, permissions: body.permissions || [] });
    if (session) localStorage.setItem("activeSession", session.toString());
    if (await db.sessions.count() === 1) {
      router.push("/home");
      return;
    }
    router.push("/");
  }
  async function register() {
    let body;
    const url = new URL(server);
    url.pathname += "auth/register";
    try {
      const res = await fetch(url.toString(), { method: "POST", body: JSON.stringify({ username, password }), headers: { "Content-Type": "application/json" } });
      body = await res.json();
    } catch (err) {
      alert(`Error registering you: ${err}`);
      return;
    }
    if (body.error) {
      alert(`Error registering you: ${body.message} (${body.error})`);
      return;
    }
    const session = await db.sessions.add({ server: new URL(server).toString(), token: body.token, username: username, permissions: body.permissions || [] });
    if (session) localStorage.setItem("activeSession", session.toString());
    if (await db.sessions.count() === 1) {
      router.push("/home");
      return;
    }
    router.push("/");
  }
  useEffect(() => {
    async function checkServer() {
      if (!server || stage !== "credentials") return;
      let body;
      const url = new URL(server);
      url.pathname += "clientconfig";
      try {
        const res = await fetch(url.toString());
        body = await res.json();
      } catch (err) {
        if (err instanceof TypeError && (err.message.includes("Failed to fetch") || err.message.includes("NetworkError when attempting to fetch resource.")) && window.navigator.onLine) {
          alert(`Error: This server isn't properly configured for this web panel!\nPlease ask your administrator to add "${window.location.origin}" to the "allowedOrigins" list in the server config.`);
          return;
        }
        alert(`Error checking your server: ${err}`);
        return;
      }
      if (body.error) {
        alert(`Error checking your server: ${body.message} (${body.error})`);
        return;
      }
      setClientConfig(body);
    }
    checkServer();
  }, [stage, server]);
  return (
    <div className="flex flex-col gap-2 items-center">
      {stage === "server" && <div className="flex flex-col items-center gap-2">
        <h2 className="text-lg font-semibold">Select a Server</h2>
        {defaultURL && <button className="flex p-2.5 gap-2 bg-slate-600 rounded-lg items-center text-center w-full" onClick={() => {
          setServer(defaultURL);
          setStage("credentials");
        }}>
          <div className="flex flex-col gap-1 items-center w-full">
            <h3 className="font-semibold text-lg">Default Server</h3>
            <p className="text-sm">{defaultURL}</p>
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
          <label htmlFor="server">{defaultURL ? "Or, e" : "E"}nter a server address:</label>
          <div className="flex gap-2">
            <input id="server" className="border-2 border-black bg-slate-500 text-black p-1 rounded-xl" value={server} onChange={(e) => setServer(e.target.value)} />
            <button type="submit" className="hover:text-sky-500"><FontAwesomeIcon icon={faArrowRight} /></button>
          </div>
        </form>
      </div>}
      {stage === "credentials" && <form onSubmit={handleSubmit}>
        <div className="flex gap-1 mb-2" onClick={() => setStage("server")}>Server: <pre className="hover:text-sky-500">{server} <FontAwesomeIcon icon={faPencil} /></pre></div>
        <div className="flex flex-col gap-1 items-center mb-2">
          <label htmlFor="username">Username</label>
          <input id="username" className="border-2 border-black bg-slate-500 text-black p-1 rounded-xl w-fit" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1 items-center">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" className="border-2 border-black bg-slate-500 text-black p-1 rounded-xl w-fit" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button type="submit" className="rounded-xl p-1 px-2 mt-3 bg-violet-500 hover:text-sky-500 w-fit">Sign In</button>
        {clientConfig?.registration && <div className="flex flex-col items-center justify-center mt-3">
          <p className="text-lg">Or, instead:</p>
          <button type="button" onClick={register} className="rounded-xl p-1 px-2 mt-1 bg-slate-500 hover:text-sky-500 w-fit">Register</button>
        </div>}
      </form>}
    </div>
  );
}