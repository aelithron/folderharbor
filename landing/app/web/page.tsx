import { faGlobe } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Metadata } from "next";

export const metadata: Metadata = { title: "Web" }
export default function Page() {
  return (
    <main className="flex flex-col min-h-screen p-8 md:px-16">
      <div className="grid grid-cols-1 md:grid-cols-3">
        <div className="flex flex-col gap-2 items-center justify-center text-center">
          <h1 className="text-3xl font-semibold"><FontAwesomeIcon icon={faGlobe} /> FolderHarbor Web</h1>
          <p>A web panel to interact with FolderHarbor servers.</p>
        </div>
      </div>
    </main>
  );
}
