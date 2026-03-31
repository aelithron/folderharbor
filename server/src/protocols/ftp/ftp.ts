import { FtpSrv } from "ftp-srv";
import { ftpAuth } from "./helpers.js";
import { networkInterfaces } from "os";
import { Netmask } from "netmask";

export default async function startFTP(port: number, sslKey?: string, sslCert?: string): Promise<FtpSrv> {
  let server;
  const logger = {
    fatal: (msg: string) => console.error(`FTP Error - ${msg}`),
    error: () => { },
    warn: () => { },
    info: () => { },
    debug: () => { },
    trace: () => { },
    child: () => logger
  };
  if (sslKey && sslCert) {
    server = new FtpSrv({ url: "ftps://0.0.0.0:" + port, anonymous: false, tls: { key: sslKey, cert: sslCert }, log: logger, blacklist: ["PORT"], pasv_min: 6000, pasv_max: 7000, pasv_url: pasvResolver as unknown as string });
  } else {
    server = new FtpSrv({ url: "ftp://0.0.0.0:" + port, anonymous: false, log: logger, blacklist: ["PORT"], pasv_min: 6000, pasv_max: 7000, pasv_url: pasvResolver as unknown as string });
  }
  server.on("login", ({ connection, username, password }, resolve, reject) => ftpAuth({ connection, username, password }, resolve, reject));
  server.listen().then(() => { console.log(`FTP server running (port ${port})`); });
  return server;
}
function pasvResolver(address: string): string {
  const networks: { [key: string]: string } = {};
  for (const name of Object.keys(networkInterfaces())) for (const net of (networkInterfaces()!)[name]!) if (net.family === 'IPv4' && !net.internal) networks[net.address + "/24"] = net.address;
  for (const network in networks) if (new Netmask(network).contains(address) && networks[network] !== undefined) return networks[network];
  return "127.0.0.1";
}