"use client"
import { Session } from "@/folderharborweb";
import { db } from "@/utils/db";
import { faGear, faSignOut, faSync, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import Image from "next/image";
import logo from "@/public/logo.webp";
import Link from "next/link";
import query from "@/utils/api";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const [open, setOpen] = useState<boolean>(false);
  const [session, setSession] = useState<Session | undefined>();
  useEffect(() => {
    async function loadSession() { setSession(await db.sessions.get(parseInt(localStorage.getItem("activeSession")!))); }
    loadSession();
  }, []);
  async function signOut() {
    const tokenCheck = confirm("Do you want to invalidate this session's token? This will disconnect any clients you logged into with this token.");
    if (tokenCheck) {
      const res = await query(session!, "auth", { method: "DELETE" });
      if ("error" in res) {
        alert(res.error);
        return;
      }
      if ("redirect" in res) {
        window.location.href = res.redirect;
        return;
      }
    }
    await db.sessions.delete(session!.webID);
    localStorage.removeItem("activeSession");
    router.push("/");
  }
  return (
    <header className="flex z-25 sticky justify-between gap-2 p-2 md:px-8 bg-violet-700/40 w-full align-middle items-center">
      <Link href={"/home"} className="text-lg flex items-center align-middle font-semibold hover:text-sky-500"><Image src={logo} alt="FolderHarbor Logo" loading="eager" height={50} width={50} className="w-auto h-auto" /> FolderHarbor</Link>
      <div className="relative">
        <button onClick={() => setOpen(!open)} className="hover:text-sky-500"><FontAwesomeIcon icon={faUser} size="lg" /></button>
        {open && <div className="absolute right-0 mt-4 flex flex-col p-2 rounded-lg bg-violet-700/40 z-50 w-max text-start items-center">
          <h1 className="text-lg font-semibold text-center">Welcome{session?.username ? `, ${session!.username}!` : "!"}</h1>
          <Link href={"/"} className="hover:text-sky-500"><FontAwesomeIcon icon={faSync} /> Switch Account</Link>
          <button onClick={() => signOut()} className="hover:text-sky-500"><FontAwesomeIcon icon={faSignOut} /> Sign Out</button>
          <Link href={"/settings"} className="hover:text-sky-500"><FontAwesomeIcon icon={faGear} /> Settings</Link>
        </div>}
      </div>
    </header>
  )
}