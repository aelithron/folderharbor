import { Session } from "@/folderharborweb";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function query(session: Session, path: string, init?: RequestInit): Promise<{ error: string } | { redirect: string } |{ body: any }> {
  let body;
  const url = new URL(session.server);
  url.pathname += path;
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  headers.append("Authorization", `Bearer ${session.token}`);
  try {
    const res = await fetch(url.toString(), { ...init, headers });
    if (res.status !== 204) body = await res.json();
  } catch (err) { return { error: `Error: ${err}` } }
  if (body && "error" in body) {
    switch (body.error) {
      case "locked":
      case "invalid":
      case "expired":
        return { redirect: `/fatal/${body.error}` }
      default:
        return { error: `Error (${body.error}): ${body.message}` }
    }
  }
  return { body };
}