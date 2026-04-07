import { faLock, faXmarkCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default async function Page({ params }: { params: Promise<{ error: string }> }) {
  return (
    <div className="flex flex-col min-h-screen p-8 md:p-20 items-center text-center">
      <ErrorModules code={(await params).error} />
    </div>
  );
}
function ErrorModules({ code }: { code: string }) {
  switch (code) {
    case "locked":
      return (
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold mb-4">Error - Locked</h1>
          <FontAwesomeIcon icon={faLock} size="6x" />
          <p>Your account was locked by your administrator.</p>
        </div>
      );
    default:
      return (
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold mb-4">Error</h1>
          <FontAwesomeIcon icon={faXmarkCircle} size="6x" />
          <p>A severe, unknown error occurred.</p>
        </div>
      );
  }
}