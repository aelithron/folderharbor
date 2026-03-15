import type { BasicPrivilege, PrivilegeManagerCallback } from "webdav-server";
import { Errors, Path, PrivilegeManager, Resource, type ITestableUserManager, type IUser } from "webdav-server/lib/index.v2.js";
import { getSession, prepareSession } from "../../users/sessions.js";
import { checkPath } from "../../permissions/acls.js";
import { writeLog } from "../../utils/auditlog.js";

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
        return callback(Errors.None, { uid: session.userID.toString(), username: session.username, password: password.split("token:")[1]!, isAdministrator: false, isDefaultUser: false });
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
              writeLog(data.userID, name, "auth-login", { authSuccess: false, authProtocol: "webdav" }, "attempted to log in");
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
  async _can(fullPath: Path, user: IUser, resource: Resource, privilege: BasicPrivilege | string, callback: PrivilegeManagerCallback) {
    if (!user) return callback(Errors.None, false);
    const access = await checkPath(parseInt(user.uid), fullPath.toString());
    return callback(Errors.None, access);
  }
}