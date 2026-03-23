import fs from "fs/promises";
import path from "path";
import forge from "node-forge";
import { DateTime } from "luxon";
export default async function loadCert(configPath?: string): Promise<{ key: string, cert: string }> {
  const certPath = path.join(path.dirname(configPath || "/etc/folderharbor/config.json"), "fullchain.pem");
  const keyPath = path.join(path.dirname(configPath || "/etc/folderharbor/config.json"), "privkey.pem");
  let key: string;
  let cert: string;
  const canLoad = { key: true, cert: true };
  try {
    await fs.access(keyPath, fs.constants.F_OK);
  } catch { canLoad.key = false; }
  try {
    await fs.access(certPath, fs.constants.F_OK);
  } catch { canLoad.cert = false; }
  if (!canLoad.cert && !canLoad.key) {
    console.warn("SSL cert and key are missing, generating self-signed ones...");
    const signKey = forge.pki.rsa.generateKeyPair(2048);
    const ssCert = forge.pki.createCertificate();
    ssCert.publicKey = signKey.publicKey;
    ssCert.validity.notBefore = new Date();
    ssCert.validity.notAfter = DateTime.now().plus({ years: 1 }).toJSDate();
    const attributes = [{ name: "commonName", value: "localhost" }];
    ssCert.setSubject(attributes);
    ssCert.setIssuer(attributes);
    ssCert.setExtensions([{ name: 'subjectAltName', altNames: [{ type: 2, value: 'localhost' }, { type: 7, ip: '127.0.0.1' }] }, { name: 'subjectKeyIdentifier' }]);
    ssCert.sign(signKey.privateKey);
    cert = forge.pki.certificateToPem(ssCert);
    key = forge.pki.privateKeyToPem(signKey.privateKey);
    try {
      await fs.writeFile(certPath, cert);
      await fs.writeFile(keyPath, key);
    } catch (e) { throw new Error(`Couldn't save the self signed certificates!\n${e}`); }
  } else {
    try {
      cert = await fs.readFile(certPath, "utf-8");
      key = await fs.readFile(keyPath, "utf-8");
    } catch (e) { throw new Error(`One or more of the certificate files is invalid!\n${e}`); }
  }
  return { key, cert };
}