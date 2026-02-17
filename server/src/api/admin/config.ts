import express, { Router } from "express";
import { checkPermission } from "../../permissions/permissions.js";
import { getConfig } from "../../index.js";
const router: Router = express.Router();
router.get("/", async (req, res) => {
  if (!req.session) {
    console.error(`Server Error - Couldn't read session in an auth-enforced route!\nPath: ${req.originalUrl}\nMethod: ${req.method}`);
    return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
  }
  if (!await checkPermission(req.session.userID, "config:read")) return res.status(403).json({ error: "forbidden", message: "You don't have permission to do this!" });
  if (!getConfig()) {
    console.error("Server Error - Config not loaded, but requested on the API.");
    return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
  }
  return res.json(getConfig());
});
router.post("/", async (req, res) => {
  if (!req.session) {
    console.error(`Server Error - Couldn't read session in an auth-enforced route!\nPath: ${req.originalUrl}\nMethod: ${req.method}`);
    return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
  }
  if (!await checkPermission(req.session.userID, "config:edit")) return res.status(403).json({ error: "forbidden", message: "You don't have permission to do this!" });
});
export { router };