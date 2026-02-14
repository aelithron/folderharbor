import express, { Router } from "express";
import { enforceAuth } from "./api.js";
import { editUser, getUser } from "../users/users.js";
import { getUserSessions, revokeSession } from "../users/sessions.js";
import { getConfig } from "../index.js";
const router: Router = express.Router();
router.use(enforceAuth());
router.get("/", async (req, res) => {
  if (!req.session) {
    console.error(`Server Error - Couldn't read session in an auth-enforced route!\nPath: ${req.originalUrl}\nMethod: ${req.method}`);
    return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
  }
  const user = await getUser(req.session.userID);
  if ("error" in user) {
    switch (user.error) {
      case "server":
        return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
      case "not_found":
        return res.status(400).json({ error: "not_found", message: "Error looking up your session, please sign in again." });
      default:
        return res.status(500).json({ error: "unknown", message: "An unknown error occured." });
    }
  }
  let sessions = await getUserSessions(req.session.userID);
  if ("error" in sessions) {
    switch (sessions.error) {
      case "server":
        return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
      case "no_sessions":
        sessions = [];
        break;
      default:
        return res.status(500).json({ error: "unknown", message: "An unknown error occured." });
    }
  }
  return res.json({ id: req.session.userID, username: user.username, sessions: (sessions.length > 0 ? sessions : undefined), activeSession: req.session.sessionID });
});
router.patch("/", async (req, res) => {
  if (!req.session) {
    console.error(`Server Error - Couldn't read session in an auth-enforced route!\nPath: ${req.originalUrl}\nMethod: ${req.method}`);
    return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
  }
  if (Object.keys(req.body).length === 0) return res.json({ success: true, message: "No data provided to change." });
  if (req.body.username && !getConfig()?.selfUsernameChanges) return res.status(400).json({ error: "username_change", message: "Changing your own username is disabled, please ask your administrator to change it instead." });
  const result = await editUser(req.session.userID, { username: req.body.username, password: req.body.password, clearLoginAttempts: req.body.clearLoginAttempts });
  if ("error" in result) {
    switch(result.error) {
      case "server":
        return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
      case "username_used":
        return res.status(400).json({ error: "username_used", message: "This username has already been used! Please pick another and try again." });
      default:
        return res.status(500).json({ error: "unknown", message: "An unknown error occured." });
    }
  }
  return res.json({ success: true });
});
router.delete("/session", async (req, res) => {
  if (!req.session) {
    console.error(`Server Error - Couldn't read session in an auth-enforced route!\nPath: ${req.originalUrl}\nMethod: ${req.method}`);
    return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
  }
  if (!req.body.sessionID || isNaN(Number.parseInt(req.body.sessionID))) return res.status(400).json({ error: "session_id", message: "Your request doesn't contain a valid 'sessionID'." });
  if (Number.parseInt(req.body.sessionID) === req.session.sessionID) return res.status(400).json({ error: "active_session", message: "You can't remove your active session this way, please sign out instead!" });
  const result = await revokeSession(Number.parseInt(req.body.sessionID));
  if ("error" in result) {
    switch(result.error) {
      case "server":
        return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
      case "not_found":
        return res.status(400).json({ error: "not_found", message: "This session doesn't exist!" });
      default:
        return res.status(500).json({ error: "unknown", message: "An unknown error occured." });
    }
  }
  return res.json({ success: true });
});
export { router };