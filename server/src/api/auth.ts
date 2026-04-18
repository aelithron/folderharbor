import express, { Router } from "express";
import { createSession, revokeSession } from "../users/sessions.js";
import { enforceAuth } from "./api.js";
import { writeLog } from "../utils/auditlog.js";
import { getEffectivePermissions } from "../rbac/permissions.js";
import { getConfig } from "../index.js";
import { createUser } from "../users/users.js";
const router: Router = express.Router();
router.post("/", async (req, res) => {
  if (!req.body) return res.status(400).json({ error: "request_body", message: "Your request's body is empty or invalid." });
  if (!req.body.username || (req.body.username as string).length < 1) return res.status(400).json({ error: "username", message: "Your request doesn't include a username." });
  if (!req.body.password || (req.body.password as string).length < 1) return res.status(400).json({ error: "password", message: "Your request doesn't include a password." });
  const session = await createSession(req.body.username, req.body.password);
  if ("error" in session) {
    switch (session.error) {
      case "server":
        return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
      case "not_found":
        return res.status(400).json({ error: "username", message: "That username doesn't exist." });
      case "wrong_password":
        await writeLog(session.userID, req.body.username, "auth-login", { authSuccess: false, protocol: "api" }, "attempted to log in");
        return res.status(403).json({ error: "password", message: "Incorrect password." });
      case "locked":
        return res.status(403).json({ error: "locked", message: "Your account is locked, please contact your administrator." });
      case "rate_limited":
        return res.status(403).json({ error: "rate_limited", message: "Too many failed login attempts, please wait before trying again or contact your administrator." });
      default:
        return res.status(500).json({ error: "unknown", message: "An unknown error occured." });
    }
  }
  const permissions = await getEffectivePermissions(session.userID);
  if ("error" in permissions) {
    switch (permissions.error) {
      case "server":
        return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
      case "not_found":
        return res.status(400).json({ error: "not_found", message: "Error looking up your session, please sign in again." });
      default:
        return res.status(500).json({ error: "unknown", message: "An unknown error occured." });
    }
  }
  await writeLog(session.userID, req.body.username, "auth-login", { authSuccess: true, protocol: "api" }, "logged in");
  return res.cookie("token", session.token).json({ ...session, permissions: permissions });
});
router.post("/register", async (req, res) => {
  if (!getConfig()?.registration.enabled) return res.status(400).json({ error: "registration", message: "This server has registration disabled! Please ask the server's administrator to create an account for you." });
  if (!req.body) return res.status(400).json({ error: "request_body", message: "Your request's body is empty or invalid." });
  if (!req.body.username || (req.body.username as string).length < 1) return res.status(400).json({ error: "username", message: "Your request doesn't include a username." });
  if (!req.body.password || (req.body.password as string).length < 1) return res.status(400).json({ error: "password", message: "Your request doesn't include a password." });
  const newUser = await createUser(req.body.username, req.body.password, { roles: (getConfig()?.registration.defaultRole ? [getConfig()!.registration.defaultRole!] : []) });
    if ("error" in newUser) {
    switch (newUser.error) {
      case "server":
        return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
      case "username_used":
        return res.status(400).json({ error: "username_used", message: "That username has already been used! Please pick another and try again, or log in instead." });
      default:
        return res.status(500).json({ error: "unknown", message: "An unknown error occured." });
    }
  }
  await writeLog(0, "System", "users-create", { id: newUser.id, newContents: { username: req.body.username, password: "[redacted]", roles: (getConfig()?.registration.defaultRole ? [getConfig()!.registration.defaultRole!] : undefined) }, protocol: "internal" }, "created a user (with registration form)");
  const session = await createSession(req.body.username, req.body.password);
  if ("error" in session) {
    switch (session.error) {
      case "server":
        return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
      case "locked":
        return res.status(403).json({ error: "locked", message: "Your account is locked, please contact your administrator." });
      case "rate_limited":
        return res.status(403).json({ error: "rate_limited", message: "Too many failed login attempts, please wait before trying again or contact your administrator." });
      default:
        return res.status(500).json({ error: "unknown", message: "An unknown error occured." });
    }
  }
  const permissions = await getEffectivePermissions(session.userID);
  if ("error" in permissions) {
    switch (permissions.error) {
      case "server":
        return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
      case "not_found":
        return res.cookie("token", session.token).json({ ...session, permissions: [] });
      default:
        return res.status(500).json({ error: "unknown", message: "An unknown error occured." });
    }
  }
  await writeLog(session.userID, req.body.username, "auth-login", { authSuccess: true, protocol: "api" }, "logged in");
  return res.cookie("token", session.token).json({ ...session, permissions: permissions });
});

router.use(enforceAuth());
router.delete("/", async (req, res) => {
  if (!req.session) {
    console.error(`Server Error - Couldn't read session in an auth-enforced route!\nPath: ${req.originalUrl}\nMethod: ${req.method}`);
    return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
  }
  const result = await revokeSession(req.session.sessionID);
  if ("error" in result) {
    switch (result.error) {
      case "server":
        return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
      case "not_found":
        return res.status(400).json({ error: "not_found", message: "Error looking up your session, please sign in again." });
      default:
        return res.status(500).json({ error: "unknown", message: "An unknown error occured." });
    }
  }
  return res.status(204).clearCookie("token").end();
});
export { router };