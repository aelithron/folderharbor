import { faPlay } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Metadata } from "next";

export const metadata: Metadata = { title: "Demo" }
export default function Page() {
  return (
    <main className="flex flex-col min-h-screen p-8 md:px-16">
      <div className="grid grid-cols-1 md:grid-cols-3">
        <div className="flex flex-col gap-2 items-center justify-center text-center">
          <h1 className="text-3xl font-semibold"><FontAwesomeIcon icon={faPlay} /> Try FolderHarbor</h1>
          <p>Try a demonstration of the FolderHarbor stack!</p>
        </div>
      </div>
    </main>
  );
}
