import type { BasicPrivilege, PrivilegeManagerCallback, IUser as IUserAdmin } from "webdav-server";
import { Errors, HTTPRequestContext, Path, PrivilegeManager, Resource, type ITestableUserManager, type IUser, type HTTPAuthentication } from "webdav-server/lib/index.v2.js";
import { getSession } from "../../users/sessions.js";
import { checkPath } from "../../permissions/acls.js";

export class FolderHarborUserManager implements ITestableUserManager {
  getDefaultUser(callback: (user: IUser) => void) { callback({ uid: "-1", isDefaultUser: true, isAdministrator: false, username: "default", password: "" }); }
  getUserByNamePassword(name: string, token: string, callback: (error: Error, user?: IUser) => void) {
    getSession(token).then((session) => {
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
      return callback(Errors.None, { uid: session.userID.toString(), username: session.username, password: token, isAdministrator: false, isDefaultUser: false });
    });
  }
}
export class FolderHarborPrivilegeManager extends PrivilegeManager {
  async _can(fullPath: Path, user: IUser, resource: Resource, privilege: BasicPrivilege | string, callback: PrivilegeManagerCallback) {
    if (!user) return callback(Errors.None, false);
    const access = await checkPath(parseInt(user.uid), fullPath.toString());
    return callback(Errors.None, access);
  }
}
export class HTTPBearerAuthentication implements HTTPAuthentication {
  constructor(public userManager: ITestableUserManager, public realm: string = 'realm') { }
  askForAuthentication() { return { "WWW-Authenticate": `Bearer realm="${this.realm}"` }; }
  getUser(ctx: HTTPRequestContext, callback: (error: Error, user?: IUser | undefined) => void) {
    const onError = (error: Error) => {
      this.userManager.getDefaultUser((defaultUser) => {
        callback(error, defaultUser as IUserAdmin);
      });
    };
    const authHeader = ctx.headers.find('Authorization');
    if (!authHeader) return onError(Errors.MissingAuthorisationHeader);
    if (!authHeader.startsWith("Bearer ")) return onError(Errors.WrongHeaderFormat);

    this.userManager.getUserByNamePassword("", authHeader.split("Bearer ", 2)[1]!, (e, user) => {
      if (e) onError(Errors.BadAuthentication);
      else callback(Errors.None, user as IUserAdmin);
    });
  }
}