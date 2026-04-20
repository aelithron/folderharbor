import { faGlobe, faPlay, faServer, faStar, faTerminal } from "@fortawesome/free-solid-svg-icons";
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
            <p>Go to <a href="https://panel.fh.novatea.dev/auth" className="underline hover:text-sky-500" target="_blank">the public web panel</a>. Select the default server, &quot;https://demo.fh.novatea.dev&quot;. Type any username of your choice, and enter a password (make sure to keep track of these). Then, click Register. You will be sent to the home page, welcome to FolderHarbor!</p>
            <p>In this demo server, you have nearly full administrator permissions. You can click the Admin button on the top bar to use and explore the administrator dashboard. Feel free to edit your own account, but please don&apos;t mess with other people&apos;s accounts!</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 mt-4">
          <h1 className="text-2xl font-semibold justify-center text-center"><FontAwesomeIcon icon={faServer} /> Server</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <p>On the web panel&apos;s home page, there are instructions on how to connect with WebDAV and FTP. Pick one (or both) and follow the instructions. If you want to use token-based login, click on your token.</p>
              <p>My recommendations on how to connect are below:</p>
              <ul className="list-disc ml-4">
                <li>macOS: Open Finder and click Go in the toolbar. Then, select &quot;Connect to Server...&quot; and enter the WebDAV/FTP server address from the web panel. Enter your username and password, or put the token from the web panel into the password box. NOTE: FTP is read-only in Finder, this is a macOS limitation. Use WebDAV instead for write access!</li>
                <li>Linux: Open your DE&apos;s file manager (GNOME Files, Dolphin, and Nemo all support this, and likely others). Go to the Network tab and enter the WebDAV/FTP server address from the web panel. Enter your username and password, or put the token from the web panel into the password box (make sure it starts with &quot;token_&quot;).</li>
                <li>Windows: Open the File Explorer. Go to &quot;This PC&quot; and click on the 3 dots {"->"} &quot;Add a network location&quot;. Click Next twice, then enter the WebDAV/FTP server address from the web panel into the box. Click Next, then un-check &quot;Log on anonymously&quot; and enter your username. Click Next twice more, then Finish. Finally, enter your password (or put the token from the web panel into the password box, making sure it starts with &quot;token_&quot;). NOTE: You may have better performance and luck with FTP than WebDAV on Windows, though both should work.</li>
              </ul>
              <p className="mt-2">From here, feel free to explore the files on the server a bit! If you want, you can also give your user account the &quot;Everything&quot; (ID #1) ACL, which will give you a few extra files :3</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 mt-4">
          <h1 className="text-2xl font-semibold justify-center text-center"><FontAwesomeIcon icon={faTerminal} /> CLI</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <p>FolderHarbor has a powerful CLI! You can download it from <Link href={"/cli"} target="_blank" className="underline hover:text-sky-500">this page</Link>.</p>
              <p>Once you have downloaded and installed it, run the &quot;folderharbor auth login&quot; command in your terminal. This will ask for a server address, enter &quot;https://demo.fh.novatea.dev&quot;. From there, enter your username and password from when you registered.</p>
              <p>Once authenticated, run &quot;folderharbor --help&quot;. You can then test any of the functions it lists by following the instructions for the command! I suggest starting with &quot;folderharbor account get&quot;.</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 mt-4">
          <h1 className="text-2xl font-semibold justify-center text-center"><FontAwesomeIcon icon={faStar} /> Done!</h1>
          <p>Thanks for trying out FolderHarbor! This project has taken over 3 months to complete, with over 100 hours of coding time. I&apos;m truly grateful that you&apos;ve taken the time to look at FolderHarbor. ~Nova</p>
          <p>If you want to run your own FolderHarbor server, check out the <Link href={"/server"} target="_blank" className="underline hover:text-sky-500">page for FolderHarbor Server</Link> for self-hosting instructions! You can also self-host the <Link href={"/web"} target="_blank" className="underline hover:text-sky-500">FolderHarbor web panel</Link> if you would rather not use my hosted one.</p>
        </div>
      </div>
    </main>
  );
}
