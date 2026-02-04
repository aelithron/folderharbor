import express, { Router } from "express";
import { checkPermission } from "../../permissions/permissions.js";
import { getUser } from "../../users/users.js";
import { getUserSessions } from "../../users/sessions.js";
const router: Router = express.Router();
router.get("/:userID", async (req, res) => {
  if (!req.session) {
    console.error(`Server Error - Couldn't read session in an auth-enforced route!\nPath: ${req.originalUrl}\nMethod: ${req.method}`);
    return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
  }
  let accessLevel: "full" | "limited" | null = null;
  if (await checkPermission(req.session.userID, "users:read.full")) accessLevel = "full";
  if (!accessLevel && await checkPermission(req.session.userID, "users:read")) accessLevel = "limited";
  if (!accessLevel) return res.status(403).json({ error: "forbidden", message: "You don't have permission to do this!" });
  const otherUser = await getUser(parseInt(req.params.userID));
  if ("error" in otherUser) {
    switch (otherUser.error) {
      case "server":
        return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
      case "not_found":
        return res.status(400).json({ error: "not_found", message: "The provided user doesn't exist." });
      default:
        return res.status(500).json({ error: "unknown", message: "An unknown error occured." });
    }
  }
  let sessions = await getUserSessions(parseInt(req.params.userID));
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
  if (accessLevel === "full") return res.json({ username: otherUser.username, roles: otherUser.roles, permissions: otherUser.permissions, acls: otherUser.acls, failedLogins: otherUser.failedLogins, locked: otherUser.locked, sessions: (sessions.length > 0 ? sessions : undefined) });
  if (accessLevel === "limited") return res.json({ username: otherUser.username, failedLogins: otherUser.failedLogins, locked: otherUser.locked });
});
export { router };