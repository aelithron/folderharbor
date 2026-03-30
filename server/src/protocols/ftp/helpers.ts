import type { FileSystem, FtpConnection } from "ftp-srv";
import { getSession, prepareSession } from "../../users/sessions.js";
import { writeLog } from "../../utils/auditlog.js";

export function ftpAuth({ username, password }: { connection: FtpConnection, username: string, password: string }, resolve: (config: { fs?: FileSystem, root?: string, cwd?: string, blacklist?: Array<string>, whitelist?: Array<string> }) => void, reject: (err?: Error) => void) {
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
      return resolve({ root: "/" });
    });
  } else {
    prepareSession(username, password).then((data) => {
      if ("error" in data) {
        switch (data.error) {
          case "server":
            reject(new Error("Something went wrong on the server's end, please contact your administrator."));
            return;
          case "not_found":
            reject(new Error("That username doesn't exist."));
            return;
          case "wrong_password":
            writeLog(data.userID, username, "auth-login", { authSuccess: false, protocol: "ftp" }, "attempted to log in");
            reject(new Error("Incorrect password."));
            return;
          case "locked":
            reject(new Error("Your account is locked, please contact your administrator."));
            return;
          case "rate_limited":
            reject(new Error("Too many failed login attempts, please wait before trying again or contact your administrator."));
            return;
          default:
            reject(new Error("An unknown error occured."));
            return;
        }
      }
      resolve({ root: "/" });
    });
  }
}