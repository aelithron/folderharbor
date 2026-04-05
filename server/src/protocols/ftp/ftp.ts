import { FtpSrv } from "ftp-srv";
import { ftpAuth } from "./helpers.js";
import { networkInterfaces } from "os";
import { Netmask } from "netmask";
import type z from "zod";
import type { Config } from "../../utils/config.js";
import { getConfig } from "../../index.js";

export default async function startFTP(config: z.infer<typeof Config>, sslKey?: string, sslCert?: string): Promise<FtpSrv> {
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
    server = new FtpSrv({ url: "ftps://0.0.0.0:" + config.ftp.port, anonymous: false, tls: { key: sslKey, cert: sslCert }, log: logger, blacklist: ["PORT"], pasv_min: config.ftp.pasv.start, pasv_max: config.ftp.pasv.end, pasv_url: pasvResolver as unknown as string });
  } else {
    server = new FtpSrv({ url: "ftp://0.0.0.0:" + config.ftp.port, anonymous: false, log: logger, blacklist: ["PORT"], pasv_min: config.ftp.pasv.start, pasv_max: config.ftp.pasv.end, pasv_url: pasvResolver as unknown as string });
  }
  server.on("login", ({ connection, username, password }, resolve, reject) => ftpAuth({ connection, username, password }, resolve, reject));
  server.listen().then(() => { console.log(`FTP server running (port ${config.ftp.port})`); });
  return server;
}
function pasvResolver(address: string): string {
  if (address === "127.0.0.1" || address === "::1") return "127.0.0.1";
  const networks: { [key: string]: string } = {};
  for (const name of Object.keys(networkInterfaces())) for (const net of (networkInterfaces()!)[name]!) if (net.family === 'IPv4' && !net.internal) networks[net.address + "/24"] = net.address;
  for (const network in networks) if (new Netmask(network).contains(address) && networks[network] !== undefined) return networks[network];
  return getConfig()?.ftp.pasv.address || "127.0.0.1";
}