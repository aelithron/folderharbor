import { FtpSrv } from "ftp-srv";
import { ftpAuth } from "./helpers.js";

export default async function startFTP(port: number, sslKey?: string, sslCert?: string): Promise<FtpSrv> {
  let server;
  const logger = {
    warn: (msg: string) => console.warn(`FTP Warning - ${msg}`),
    error: (msg: string) => console.error(`FTP Error - ${msg}`),
    fatal: (msg: string) => console.error(`FTP Error - ${msg}`),
    info: () => {},
    debug: () => {},
    trace: () => {},
    child: () => logger
  };
  if (sslKey && sslCert) {
    server = new FtpSrv({ url: "ftps://0.0.0.0:" + port, anonymous: false, tls: { key: sslKey, cert: sslCert }, log: logger });
  } else {
    server = new FtpSrv({ url: "ftp://0.0.0.0:" + port, anonymous: false, log: logger });
  }
  server.on("login", ({ connection, username, password }, resolve, reject) => ftpAuth({ connection, username, password }, resolve, reject));
  server.listen().then(() => { console.log(`FTP server running (port ${port})`); });
  return server;
}