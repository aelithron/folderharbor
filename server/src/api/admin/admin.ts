import express, { Router } from "express";
import { enforceAuth } from "../api.js";
import { router as usersRouter } from "./users.js";
import { router as rolesRouter } from "./roles.js";
import { router as aclsRouter } from "./acls.js";
import { router as configRouter } from "./config.js";
import { checkPermission, permissions } from "../../permissions/permissions.js";
import { readLogs } from "../../utils/auditlog.js";
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
  const logs = await readLogs();
  if ("error" in logs && logs.error === "server") return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
  return res.json(logs);
});
export { router };