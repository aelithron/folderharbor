import type { IUser } from "webdav-server";
import type { ITestableUserManager } from "webdav-server/lib/index.v2.js";
import { createSession } from "../../users/sessions.js";
import { writeLog } from "../../utils/auditlog.js";

export class FolderHarborUserManager implements ITestableUserManager {
  getDefaultUser(callback: (user: IUser) => void) {
    callback({ uid: "default", isDefaultUser: true, isAdministrator: false, username: "default", password: "" });
  }
  async getUserByNamePassword(name: string, password: string, callback: (error: Error, user?: IUser) => void) {
    const session = await createSession(name, password);
    if ("error" in session) {
      switch (session.error) {
        case "server":
          callback(new Error("Something went wrong on the server's end, please contact your administrator."));
          return;
        case "not_found":
          callback(new Error("That username doesn't exist."));
          return;
        case "wrong_password":
          await writeLog(session.userID, name, "auth-login", { authSuccess: false, authProtocol: "webdav" }, "attempted to log in");
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
    await writeLog(session.userID, name, "auth-login", { authSuccess: true, authProtocol: "webdav" }, "logged in");
    callback(new Error(), { uid: session.userID.toString(), username: name, password: password, isAdministrator: false, isDefaultUser: false });
  }
}