import express, { Router } from "express";
import { enforceAuth } from "../api.js";
import { router as usersRouter } from "./users.js";
import { router as rolesRouter } from "./roles.js";
import { router as aclsRouter } from "./acls.js";
import { router as configRouter } from "./config.js";
import { checkPermission, permissions } from "../../rbac/permissions.js";
import { readLogs, writeLog } from "../../utils/auditlog.js";
import { revokeSession } from "../../users/sessions.js";
const router: Router = express.Router();
router.get("/permissions", (req, res) => { res.json(permissions); });
router.use(enforceAuth());
router.use("/users", usersRouter);
router.use("/roles", rolesRouter);
router.use("/acls", aclsRouter);
router.use("/roles", rolesRouter);
router.use("/config", configRouter);
router.get("/logs", async (req, res) => {
  if (!req.session) {
    console.error(`Server Error - Couldn't read session in an auth-enforced route!\nPath: ${req.originalUrl}\nMethod: ${req.method}`);
    return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
  }
  if (!await checkPermission(req.session.userID, "logs:read")) return res.status(403).json({ error: "forbidden", message: "You don't have permission to do this!" });
  const logs = await readLogs(req.query.page ? parseInt(req.query.page as string) : undefined);
  if ("error" in logs && logs.error === "server") return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
  return res.json(logs);
});
router.delete("/session/:sessionID", async (req, res) => {
  if (!req.session) {
    console.error(`Server Error - Couldn't read session in an auth-enforced route!\nPath: ${req.originalUrl}\nMethod: ${req.method}`);
    return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
  }
  if (!await checkPermission(req.session.userID, "users:edit")) return res.status(403).json({ error: "forbidden", message: "You don't have permission to do this!" });
  const result = await revokeSession(parseInt(req.params.sessionID));
  if ("error" in result) {
    switch (result.error) {
      case "server":
        return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
      case "not_found":
        return res.status(400).json({ error: "not_found", message: "The provided session doesn't exist." });
      default:
        return res.status(500).json({ error: "unknown", message: "An unknown error occured." });
    }
  }
  await writeLog(req.session.userID, req.session.username, "sessions-delete", { id: parseInt(req.params.sessionID) }, "revoked a session");
  return res.json({ success: true });
});
export { router };