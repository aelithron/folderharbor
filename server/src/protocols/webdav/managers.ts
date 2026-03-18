import type { BasicPrivilege, PrivilegeManagerCallback, ReturnCallback } from "webdav-server";
import { Errors, Path, PhysicalFileSystem, PrivilegeManager, Resource, type ITestableUserManager, type IUser, type ReadDirInfo } from "webdav-server/lib/index.v2.js";
import { getSession, prepareSession } from "../../users/sessions.js";
import { checkPath, getPaths } from "../../permissions/acls.js";
import { writeLog } from "../../utils/auditlog.js";
import fs from "fs";
import micromatch from "micromatch";
import { getConfig } from "../../index.js";
import path from "path";
import { getItemType } from "../../core.js";

export class FolderHarborUserManager implements ITestableUserManager {
  getDefaultUser(callback: (user: IUser) => void) { callback({ uid: "-1", isDefaultUser: true, isAdministrator: false, username: "default", password: "" }); }
  getUserByNamePassword(name: string, password: string, callback: (error: Error, user?: IUser) => void) {
    if (password.startsWith("token_")) {
      getSession(password.split("token_")[1]!).then((session) => {
        if ("error" in session) {
          switch (session.error) {
            case "server":
              return callback(new Error("Something went wrong on the server's end, please contact your administrator."));
            case "invalid":
              return callback(new Error("Your token is invalid, please sign in again."));
            case "locked":
              return callback(new Error("Your account is locked, please contact your administrator."));
            case "expired":
              return callback(new Error("Your session expired, please sign in again."));
            default:
              return callback(new Error("An unknown error occured."));
          }
        }
        return callback(Errors.None, { uid: session.userID.toString(), username: session.username, password: password.split("token_")[1]!, isAdministrator: false, isDefaultUser: false });
      });
    } else {
      prepareSession(name, password).then((data) => {
        if ("error" in data) {
          switch (data.error) {
            case "server":
              callback(new Error("Something went wrong on the server's end, please contact your administrator."));
              return;
            case "not_found":
              callback(new Error("That username doesn't exist."));
              return;
            case "wrong_password":
              writeLog(data.userID, name, "auth-login", { authSuccess: false, protocol: "webdav" }, "attempted to log in");
              callback(new Error("Incorrect password."));
              return;
            case "locked":
              callback(new Error("Your account is locked, please contact your administrator."));
              return;
            case "rate_limited":
              callback(new Error("Too many failed login attempts, please wait before trying again or contact your administrator."));
              return;
            default:
              callback(new Error("An unknown error occured."));
              return;
          }
        }
        callback(Errors.None, { uid: data.userID.toString(), username: name, password: password, isAdministrator: false, isDefaultUser: false });
      });
    }
  }
}
export class FolderHarborPrivilegeManager extends PrivilegeManager {
  _can(fullPath: Path, user: IUser, resource: Resource, privilege: BasicPrivilege | string, callback: PrivilegeManagerCallback) {
    if (!user) return callback(Errors.None, false);
    checkPath(parseInt(user.uid), fullPath.toString()).then((access) => { return callback(Errors.None, access); });
  }
}
export class FolderHarborFileSystem extends PhysicalFileSystem {
  _readDir(itemPath: Path, ctx: ReadDirInfo, callback: ReturnCallback<string[] | Path[]>) {
    const { realPath } = this.getRealPath(itemPath);
    fs.readdir(realPath, async (e, files) => {
      const allowedFiles: string[] = [];
      const paths = await getPaths(parseInt(ctx.context.user.uid));
      if ("error" in paths) return callback(new Error("Something went wrong on the server's end, please contact your administrator."), []);
      for (const item of files) {
        let allowed = false;
        const checkPath = path.normalize(path.join(itemPath.toString(), item));
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
        if (allowed) allowedFiles.push(item);
      }
      callback(e ? Errors.ResourceNotFound : Errors.None, allowedFiles);
    });
  }
}