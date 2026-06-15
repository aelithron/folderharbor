import { FHAuthError, FHPermissionError, FHRequestError } from "@folderharbor/sdk";
export async function handleErrors(error: FHRequestError | FHAuthError | FHPermissionError): Promise<{ error: string } | { redirect: string }> {
  if (error instanceof FHAuthError) return { redirect: `/fatal/${error.code}` }
  if (error instanceof FHPermissionError || error instanceof FHRequestError) return { error: `Error${error.code ? ` (${error.code})` : ""}: ${error.message}` }
  return { error: `Error: ${error}` }
}