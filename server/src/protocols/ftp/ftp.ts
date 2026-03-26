import { FtpSrv } from "ftp-srv";
import { ftpAuth } from "./helpers.js";
import bunyan from "bunyan";

export default async function startFTP(port: number, sslKey?: string, sslCert?: string): Promise<FtpSrv> {
  let server;
  const logger = bunyan.createLogger({ name: "FolderHarbor FTP", level: 40 });
  if (sslKey && sslCert) {
    server = new FtpSrv({ url: "ftps://0.0.0.0:" + port, anonymous: false, tls: { key: sslKey, cert: sslCert }, log: logger });
  } else {
    server = new FtpSrv({ url: "ftp://0.0.0.0:" + port, anonymous: false, log: logger });
  }
  server.on("login", ({ connection, username, password }, resolve, reject) => ftpAuth({ connection, username, password }, resolve, reject));
  server.listen().then(() => { console.log(`FTP server running (port ${port})`); });
  return server;
}