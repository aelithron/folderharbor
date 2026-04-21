import { ResourceType, v2 as webdav, type ReturnCallback } from "webdav-server";
import { FolderHarborFileSystem, FolderHarborPrivilegeManager, FolderHarborUserManager } from "./managers.js";
import { writeLog, type AuditAction } from "../../utils/auditlog.js";
import { getConfig } from "../../index.js";
export default async function startWebDAV(port: number, sslKey?: string, sslCert?: string): Promise<webdav.WebDAVServer> {
  let server;
  if (sslCert && sslKey) {
    server = new webdav.WebDAVServer({ port, requireAuthentification: true, httpAuthentication: new webdav.HTTPBasicAuthentication(new FolderHarborUserManager(), "FolderHarbor"), privilegeManager: new FolderHarborPrivilegeManager(), serverName: "FolderHarbor WebDAV", https: { key: sslKey, cert: sslCert } });
  } else {
    server = new webdav.WebDAVServer({ port, requireAuthentification: true, httpAuthentication: new webdav.HTTPBasicAuthentication(new FolderHarborUserManager(), "FolderHarbor"), privilegeManager: new FolderHarborPrivilegeManager(), serverName: "FolderHarbor WebDAV" });
  }
  await server.setFileSystemAsync("/", new FolderHarborFileSystem("/"));
  server.start(() => console.log(`WebDAV server running (port ${port})`));
  server.beforeRequest((arg, next) => {
    if (getConfig()!.filterMetadata) {
      const fileName = arg.fullUri().split('/').pop();
      if (fileName && (fileName.startsWith("._") || fileName === ".DS_Store" || fileName === "desktop.ini" || fileName === "thumbs.db")) {
        arg.response.statusCode = 200;
        return arg.response.end();
      }
    }
    return next();
  });
  server.afterRequest(async (arg, next) => {
    let action: AuditAction | undefined;
    let blurb: string | undefined;
    const fileName = arg.fullUri().split('/').pop();
    if (fileName && (fileName.startsWith("._") || fileName === ".DS_Store" || fileName === "desktop.ini" || fileName === "thumbs.db")) return next();
    if (arg.response.statusCode >= 400) return next();
    switch (arg.request.method?.toUpperCase()) {
      case "GET": {
        try {
          const resource = await (new Promise((resolve, reject) => {
            server.getResource(arg, decodeURIComponent(new URL(arg.fullUri()).pathname), (err, res) => {
              if (err) { reject(err); }
              resolve(res);
            });
          }));
          const type = await (new Promise((resolve, reject) => {
            (resource as { type(callback: ReturnCallback<ResourceType>): void }).type((err, res) => {
              if (err) { reject(err); }
              resolve(res);
            });
          }));
          if (!type || !(type as ResourceType).isDirectory) {
            console.log(decodeURIComponent(new URL(arg.fullUri()).pathname), type);
            action = "files-read";
            blurb = "read a file";
            break;
          }
        } catch (err) {
          console.log(decodeURIComponent(new URL(arg.fullUri()).pathname), err);
          action = "files-read";
          blurb = "read a file";
          break;
        }
        break;
      }
      case "PUT":
        action = `files-${arg.response.statusCode === 201 ? "create" : "edit"}`;
        blurb = `${arg.response.statusCode === 201 ? "created" : "edited"} a file`;
        break;
      case "MKCOL":
        action = "files-create";
        blurb = "created a file";
        break;
      case "DELETE":
        action = "files-delete";
        blurb = "deleted a file";
        break;
      case "MOVE":
        action = "files-move";
        blurb = "moved a file";
        break;
    }
    if (action) await writeLog(parseInt(arg.user.uid), arg.user.username, action, { protocol: "webdav", filePath: decodeURIComponent(new URL(arg.fullUri()).pathname), oldFilePath: (arg.request.headers["destination"] ? decodeURIComponent(new URL(arg.request.headers["destination"].toString(), arg.prefixUri()).pathname) : undefined) }, blurb);
    return next();
  });
  return server;
}