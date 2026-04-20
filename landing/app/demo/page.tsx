import { faGlobe, faPlay, faServer } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Metadata } from "next";
import serverPhoto from "@/public/shots/server.webp";
import cliPhoto from "@/public/shots/cli.webp";
import webPhoto from "@/public/shots/web.webp";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = { title: "Demo" }
export default function Page() {
  return (
    <main className="flex flex-col min-h-screen p-8 md:px-16">
      <div className="grid grid-cols-3 mb-4 border-4 border-violet-700/60 rounded-xl">
        <Link href={"/server"}><Image src={serverPhoto} alt="Two stylized macOS Finder windows showing FolderHarbor Server working!" className="rounded-l-lg" loading="eager" /></Link>
        <Link href={"/cli"}><Image src={cliPhoto} alt="A stylized picture of the help message from the FolderHarbor CLI." loading="eager" /></Link>
        <Link href={"/web"}><Image src={webPhoto} alt="A stylized picture of the FolderHarbor Web Panel." className="rounded-r-lg" loading="eager" /></Link>
      </div>
      <div className="flex flex-col gap-2 items-center justify-center text-center">
        <h1 className="text-3xl font-semibold"><FontAwesomeIcon icon={faPlay} /> Try FolderHarbor</h1>
        <p>Try a demonstration of the FolderHarbor stack!</p>
      </div>
      <div className="flex flex-col gap-2 mt-6">
        <h1 className="text-2xl font-semibold justify-center text-center"><FontAwesomeIcon icon={faGlobe} /> Web Panel</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2 space-y-2">
            <p>Go to <a href="https://panel.fh.novatea.dev/auth" className="underline hover:text-sky-500" target="_blank">the public web panel</a>. Select the default server, &quot;demo.fh.novatea.dev&quot;. Type any username of your choice, and enter a password (make sure to keep track of these). Then, click Register. You will be sent to the home page, welcome to FolderHarbor!</p>
            <p>In this demo server, you have nearly full administrator permissions. You can click the Admin button on the top bar to use and explore the administrator dashboard. Feel free to edit your own account, but please don&apos;t mess with other people&apos;s accounts!</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 mt-4">
          <h1 className="text-2xl font-semibold justify-center text-center"><FontAwesomeIcon icon={faServer} /> Server</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <p>On the web panel&apos;s home page, there are instructions on how to connect with WebDAV and FTP. Pick one (or both) and follow the instructions. If you want to use token-based login, click on your token.</p>
              <p>My recommendations on how to connect are below for each operating system:</p>
              <ul className="list-disc ml-4">
                <li>macOS: Open Finder and click Go in the toolbar. Then, select &quot;Connect to Server...&quot; and enter the WebDAV/FTP server address from the web panel. Enter your username and password, or put the token from the web panel into the password box. NOTE: FTP is read-only in Finder, this is a macOS limitation. Use WebDAV instead for write access!</li>
                <li>Linux: Open your DE&apos;s file manager (GNOME Files, Dolphin, and Nemo all support this, and likely others). Go to the Network tab and enter the WebDAV/FTP server address from the web panel. Enter your username and password, or put the token from the web panel into the password box (make sure it starts with &quot;token_&quot;).</li>
                <li>Windows: Open the File Explorer. Go to the Network tab and enter the WebDAV/FTP server address from the web panel. Enter your username and password, or put the token from the web panel into the password box (make sure it starts with &quot;token_&quot;).</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
