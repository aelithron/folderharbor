import crypto from "crypto";
export async function authUser(username: string, password: string): Promise<{ token: string } | { error: string, message: string }> {
  // todo: authenticate against db (once i add one)
  const authToken = crypto.randomBytes(32).toString("base64url");
  return { token: authToken };
}