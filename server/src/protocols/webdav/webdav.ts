import { v2 as webdav } from "webdav-server";
import { FolderHarborPrivilegeManager, FolderHarborUserManager, HTTPBearerAuthentication } from "./managers.js";
export default async function startWebDAV(port: number): Promise<webdav.WebDAVServer>{
  const server = new webdav.WebDAVServer({ port, requireAuthentification: true, httpAuthentication: new HTTPBearerAuthentication(new FolderHarborUserManager(), "FolderHarbor"), privilegeManager: new FolderHarborPrivilegeManager() });
  await server.setFileSystemAsync("/", new webdav.PhysicalFileSystem("/"));
  server.start(() => console.log(`WebDAV server running (port ${port})`));
  return server;
}