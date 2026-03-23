import fs from "fs/promises";
import path from "path";
export default async function loadCert(configPath?: string): Promise<{ key: string, cert: string }> {
  const certPath = path.join(path.dirname(configPath || "/etc/folderharbor"), "fullchain.pem");
  const keyPath = path.join(path.dirname(configPath || "/etc/folderharbor"), "privkey.pem");
  let key: string;
  let cert: string;
  try {
    cert = await fs.readFile(certPath, "utf-8");
    key = await fs.readFile(keyPath, "utf-8");
  } catch (e) {
    throw new Error(`One or more of the SSL certificate files is invalid!\n${e}`);
  }
  return { key, cert };
}