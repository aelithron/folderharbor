"use client"
import { Session } from "@/folderharborweb";
import query from "@/utils/api";
import { db } from "@/utils/db";
import { useEffect, useState } from "react";

export default function Home() {
  const [session, setSession] = useState<Session | undefined>();
  const [webdavURL, setWebdavURL] = useState<string | null>(null);
  const [ftpURL, setftpURL] = useState<string | null>(null);
  useEffect(() => {
    async function loadSession() { setSession(await db.sessions.get(parseInt(localStorage.getItem("activeSession")!))); }
    loadSession();
  }, []);
  useEffect(() => {
    if (!session) return;
    query(session, "providers").then((res) => {
      if ("error" in res) {
        alert(res.error);
        return;
      }
      setWebdavURL(res.body.webdav);
      setftpURL(res.body.ftp);
    });
  }, [session]);
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-center text-2xl font-semibold">Welcome{session ? `, ${session.username}` : ""}</h1>
      <div className="flex flex-col gap-2 items-center">
        {webdavURL && <div className="flex flex-col text-center gap-2 items-center p-2 bg-slate-600 rounded-lg w-fit">
          <h1 className="text-lg font-semibold">WebDAV</h1>
          <p>The WebDAV server address is: {isSecureContext ? <button onClick={() => copyAlert(webdavURL)} className="underline hover:text-sky-500">{webdavURL}</button> : webdavURL}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
            <div className="flex flex-col gap-2">
              <h2 className="font-semibold">Token (Suggested)</h2>
              <p>A session token can be used to access WebDAV!</p>
              <p>This is more secure than a username and password, but will expire.</p>
              <p>Enter {isSecureContext ? <button onClick={() => copyAlert(session!.token)} className="underline hover:text-sky-500"><pre>{session!.token}</pre></button> : <pre>{session!.token}</pre>} into the Password box in your WebDAV client.</p>
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="font-semibold">Standard</h2>
              <p>You can also use your standard FolderHarbor server credentials to log in.</p>
              <p>This may pose security risks if you are on a WiFi network you don&apos;t trust!</p>
              <p>Just enter your normal username and password into your WebDAV client&apos;s boxes.</p>
            </div>
          </div>
        </div>}
        {ftpURL && <div className="flex flex-col text-center gap-2 items-center p-2 bg-slate-600 rounded-lg w-fit">
          <h1 className="text-lg font-semibold">FTP</h1>
          <p>The FTP server address is: {isSecureContext ? <button onClick={() => copyAlert(ftpURL)} className="underline hover:text-sky-500">{ftpURL}</button> : ftpURL}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
            <div className="flex flex-col gap-2">
              <h2 className="font-semibold">Token (Suggested)</h2>
              <p>A session token can be used to access FTP!</p>
              <p>This is more secure than a username and password, but will expire.</p>
              <p>Enter {isSecureContext ? <button onClick={() => copyAlert(session!.token)} className="underline hover:text-sky-500"><pre>{session!.token}</pre></button> : <pre>{session!.token}</pre>} into the Password box in your FTP client.</p>
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="font-semibold">Standard</h2>
              <p>You can also use your standard FolderHarbor server credentials to log in.</p>
              <p>This may pose security risks if you are on a WiFi network you don&apos;t trust!</p>
              <p>Just enter your normal username and password into your FTP client&apos;s boxes.</p>
            </div>
          </div>
        </div>}
      </div>
    </div>
  )
}
function copyAlert(text: string) {
  navigator.clipboard.writeText(text);
  alert(`Copied "${text}" to the clipboard!`);
}