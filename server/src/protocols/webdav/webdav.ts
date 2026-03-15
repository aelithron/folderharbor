import { v2 as webdav } from "webdav-server";
import { FolderHarborPrivilegeManager, FolderHarborUserManager } from "./managers.js";
export default async function startWebDAV(port: number): Promise<webdav.WebDAVServer> {
  const server = new webdav.WebDAVServer({ port, requireAuthentification: true, httpAuthentication: new webdav.HTTPBasicAuthentication(new FolderHarborUserManager(), "FolderHarbor"), privilegeManager: new FolderHarborPrivilegeManager(), serverName: "FolderHarbor WebDAV" });
  await server.setFileSystemAsync("/", new webdav.PhysicalFileSystem("/"));
  server.start(() => console.log(`WebDAV server running (port ${port})`));
  server.afterRequest((arg, next) => {
    // Display the method, the URI, the returned status code and the returned message
    console.log('>>', arg.request.method, arg.requested.uri, '>', arg.response.statusCode, arg.response.statusMessage);
    // If available, display the body of the response
    console.log(arg.responseBody);
    next();
  });
  return server;
}