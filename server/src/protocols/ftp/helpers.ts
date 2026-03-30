import { FileSystem, type FtpConnection } from "ftp-srv";
import { getSession, prepareSession } from "../../users/sessions.js";
import { writeLog } from "../../utils/auditlog.js";
import { checkPath, getPaths } from "../../permissions/acls.js";
import path from "path";
import fs from "fs/promises";
import { getItemType } from "../../core.js";
import micromatch from "micromatch";
import { getConfig } from "../../index.js";
import type { Stats } from "fs";

type StatsWithName = Stats & { name: string };

export function ftpAuth({ username, password, connection }: { connection: FtpConnection, username: string, password: string }, resolve: (config: { fs?: FileSystem, root?: string, cwd?: string, blacklist?: Array<string>, whitelist?: Array<string> }) => void, reject: (err?: Error) => void) {
  if (password.startsWith("token_")) {
    getSession(password.split("token_")[1]!).then((session) => {
      if ("error" in session) {
        switch (session.error) {
          case "server":
            return reject(new Error("Something went wrong on the server's end, please contact your administrator."));
          case "invalid":
            return reject(new Error("Your token is invalid, please sign in again."));
          case "locked":
            return reject(new Error("Your account is locked, please contact your administrator."));
          case "expired":
            return reject(new Error("Your session expired, please sign in again."));
          default:
            return reject(new Error("An unknown error occured."));
        }
      }
      connection.userID = session.userID;
      connection.username = session.username;
      return resolve({ root: "/", fs: new FolderHarborFileSystem(connection, { root: "/", cwd: "/" }) });
    });
  } else {
    prepareSession(username, password).then((data) => {
      if ("error" in data) {
        switch (data.error) {
          case "server":
            return reject(new Error("Something went wrong on the server's end, please contact your administrator."));
          case "not_found":
            return reject(new Error("That username doesn't exist."));
          case "wrong_password":
            writeLog(data.userID, username, "auth-login", { authSuccess: false, protocol: "ftp" }, "attempted to log in");
            return reject(new Error("Incorrect password."));
          case "locked":
            return reject(new Error("Your account is locked, please contact your administrator."));
          case "rate_limited":
            return reject(new Error("Too many failed login attempts, please wait before trying again or contact your administrator."));
          default:
            return reject(new Error("An unknown error occured."));
        }
      }
      connection.userID = data.userID;
      connection.username = username;
      return resolve({ root: "/", fs: new FolderHarborFileSystem(connection, { root: "/", cwd: "/" }) });
    });
  }
}
class FolderHarborFileSystem extends FileSystem {
  async get(fileName: string): Promise<unknown> {
    // @ts-expect-error - this method exists in the code but not types
    const { fsPath } = this._resolvePath(fileName);
    const canAccess = await checkPath(this.connection.userID, fsPath);
    if (canAccess) return super.get(fileName);
    throw new Error("You don't have access to that file, or it doesn't exist.");
  }
  async list(dirPath?: string): Promise<unknown> {
    if (!dirPath) dirPath = ".";
    // @ts-expect-error - this method exists in the code but not types
    const { fsPath } = this._resolvePath(dirPath);
    const items = await fs.readdir(fsPath);
    const allowedFiles: StatsWithName[] = [];
    const paths = await getPaths(this.connection.userID);
    if ("error" in paths) throw new Error("Something went wrong on the server's end, please contact your administrator.");
    for (const item of items) {
      let allowed = false;
      const checkPath = path.resolve(path.join(fsPath, item));
      const type = await getItemType(checkPath);
      if (micromatch.isMatch(checkPath, getConfig()!.globalExclusions, { dot: true }) && !micromatch.isMatch(checkPath, getConfig()!.globalExclusionBypasses, { dot: true })) {
        let bypassExclusions = false;
        if (!("error" in type) && type.type === "folder") for (const prefix of getConfig()!.globalExclusionBypasses.map(glob => { return path.normalize(glob.split(/[*?[{\]]/, 1)[0]!); })) if (prefix === checkPath || prefix.startsWith(checkPath + "/")) bypassExclusions = true;
        if (!bypassExclusions) continue;
      }
      if (micromatch.isMatch(checkPath, paths.allow, { dot: true })) allowed = true;
      if (micromatch.isMatch(checkPath, paths.deny, { dot: true })) allowed = false;
      if (!allowed) {
        if (!("error" in type) && type.type === "folder") {
          for (const prefix of paths.allow.map(glob => { return path.normalize(glob.split(/[*?[{\]]/, 1)[0]!); })) {
            if (prefix === checkPath || prefix.startsWith(checkPath + "/")) {
              allowed = true;
              break;
            }
          }
        }
      }
      let stat;
      try {
        stat = await fs.stat(checkPath) as StatsWithName;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_) { continue; }
      stat.name = item;
      if (allowed) allowedFiles.push(stat);
    }
    return allowedFiles;
  }
  async chdir(path?: string): Promise<string> {
    // @ts-expect-error - this method exists in the code but not types
    const { fsPath } = this._resolvePath(path);
    const canAccess = await checkPath(this.connection.userID, fsPath);
    if (canAccess) return super.chdir(path);
    throw new Error("You don't have access to that folder, or it doesn't exist.");
  }
  async read(fileName: string, { start }: { start?: unknown; }): Promise<unknown> {
    // @ts-expect-error - this method exists in the code but not types
    const { fsPath } = this._resolvePath(fileName);
    const canAccess = await checkPath(this.connection.userID, fsPath);
    if (canAccess) {
      const type = await getItemType(fsPath);
      if ("error" in type) throw new Error("You don't have access to that file, or it doesn't exist.");
      if (type.type === "file") await writeLog(this.connection.userID, this.connection.username, "files-read", { filePath: fsPath, protocol: "ftp" }, "read a file");
      return super.read(fileName, { start });
    }
    throw new Error("You don't have access to that file, or it doesn't exist.");
  }
  async write(fileName: string, { append, start }: { append?: boolean; start?: unknown; }): Promise<unknown> {
    if (append === undefined) append = false;
    // @ts-expect-error - this method exists in the code but not types
    const { fsPath } = this._resolvePath(fileName);
    const canAccess = await checkPath(this.connection.userID, fsPath);
    console.log(fsPath, canAccess);
    if (canAccess) {
      await writeLog(this.connection.userID, this.connection.username, "files-edit", { filePath: fsPath, protocol: "ftp" }, "edited a file");
      return super.write(fileName, { append, start });
    }
    throw new Error("You don't have access to that file, or it doesn't exist.");
  }
  async delete(path: string): Promise<unknown> {
    // @ts-expect-error - this method exists in the code but not types
    const { fsPath } = this._resolvePath(path);
    const canAccess = await checkPath(this.connection.userID, fsPath);
    if (canAccess) {
      super.delete(path);
      await writeLog(this.connection.userID, this.connection.username, "files-delete", { filePath: fsPath, protocol: "ftp" }, "deleted a file");
      return;
    }
    throw new Error("You don't have access to that file, or it doesn't exist.");
  }
  async mkdir(path: string): Promise<unknown> {
    // @ts-expect-error - this method exists in the code but not types
    const { fsPath } = this._resolvePath(path);
    const canAccess = await checkPath(this.connection.userID, fsPath);
    if (canAccess) {
      super.mkdir(path);
      await writeLog(this.connection.userID, this.connection.username, "files-create", { filePath: fsPath, protocol: "ftp" }, "created a folder");
      return;
    }
    throw new Error("You don't have access to that file, or it doesn't exist.");
  }
  async rename(from: string, to: string): Promise<unknown> {
    // @ts-expect-error - this method exists in the code but not types
    const { fsPath: fromPath } = this._resolvePath(from);
    // @ts-expect-error - again, exists in the code but not types
    const { fsPath: toPath } = this._resolvePath(to);
    if (await checkPath(this.connection.userID, fromPath) && await checkPath(this.connection.userID, toPath)) {
      super.rename(fromPath, toPath);
      await writeLog(this.connection.userID, this.connection.username, "files-move", { filePath: toPath, oldFilePath: fromPath, protocol: "ftp" }, "moved a file");
      return;
    }
    throw new Error("You don't have access to one or more of those files, or they don't exist.");
  }
  async chmod(path: string, mode: string): Promise<unknown> {
    // @ts-expect-error - this method exists in the code but not types
    const { fsPath } = this._resolvePath(path);
    const canAccess = await checkPath(this.connection.userID, fsPath);
    if (canAccess) {
      super.chmod(path, mode);
      await writeLog(this.connection.userID, this.connection.username, "files-edit", { filePath: fsPath, protocol: "ftp" }, "edited a file");
      return;
    }
    throw new Error("You don't have access to that file, or it doesn't exist.");
  }
}