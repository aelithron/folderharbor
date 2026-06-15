import { Session } from "@/folderharborweb";
import { FHAuthError, FHPermissionError, FHRequestError, FolderHarbor } from "@folderharbor/sdk";
export function handleError(error: Error): { error: string } | { redirect: string } {
  if (error instanceof FHAuthError) return { redirect: `/fatal/${error.code}` }
  if (error instanceof FHPermissionError || error instanceof FHRequestError) return { error: `Error${error.code ? ` (${error.code})` : ""}: ${error.message}` }
  return { error: `Error: ${error}` }
}
export function getClient(session: Session) { return new FolderHarbor({ server: session.server, token: session.token }); }