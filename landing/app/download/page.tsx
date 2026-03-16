import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faServer, faTerminal } from '@fortawesome/free-solid-svg-icons'
export default function Page() {
  return (
    <main className="flex flex-col min-h-screen p-8 md:p-20">
      <h1 className="text-3xl font-semibold text-center"><FontAwesomeIcon icon={faDownload} /> Download FolderHarbor</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="flex flex-col gap-2 items-center text-center">
          <FontAwesomeIcon icon={faServer} size="xl" />
          <h2 className="text-xl font-semibold">Server</h2>
          <a href="https://github.com/aelithron/folderharbor" target="_blank" className="hover:text-sky-500 bg-violet-500 p-2 rounded-xl"><FontAwesomeIcon icon={faDownload} /> Download</a>
        </div>
        <div className="flex flex-col gap-2 items-center text-center">
          <FontAwesomeIcon icon={faTerminal} size="xl" />
          <h2 className="text-xl font-semibold">CLI</h2>
          <a href="https://github.com/aelithron/folderharbor" target="_blank" className="hover:text-sky-500 bg-violet-500 p-2 rounded-xl"><FontAwesomeIcon icon={faDownload} /> Download</a>
        </div>
      </div>
    </main>
  );
}