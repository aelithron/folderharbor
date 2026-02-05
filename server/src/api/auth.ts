import express, { Router } from "express";
import { createSession, revokeSession } from "../users/sessions.js";
import { enforceAuth } from "./api.js";
import { getUser } from "../users/users.js";
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
        return res.status(403).json({ error: "password", message: "Incorrect password." });
      case "locked":
        return res.status(403).json({ error: "locked", message: "Your account is locked, please contact your administrator." });
      case "rate_limited":
        return res.status(403).json({ error: "rate_limited", message: "Too many failed login attempts, please wait before trying again or contact your administrator." });
      default:
        return res.status(500).json({ error: "unknown", message: "An unknown error occured." });
    }
  }
  return res.cookie("token", session.token).json(session);
});

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
  } else {
    // todo: extend with more session info
    return res.json({ id: req.session.userID, username: req.session.username, sessionExpiry: req.session.expiry });
  }
});
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