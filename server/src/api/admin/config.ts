import express, { Router } from "express";
import { checkPermission } from "../../permissions/permissions.js";
import { getConfig } from "../../index.js";
import { editConfig } from "../../utils/config.js";
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
router.patch("/", async (req, res) => {
  if (!req.session) {
    console.error(`Server Error - Couldn't read session in an auth-enforced route!\nPath: ${req.originalUrl}\nMethod: ${req.method}`);
    return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
  }
  if (!await checkPermission(req.session.userID, "config:edit")) return res.status(403).json({ error: "forbidden", message: "You don't have permission to do this!" });
  if (!req.body) return res.status(400).json({ error: "request_body", message: "Your request's body is empty or invalid." });
  if (Object.values(req.body).filter((value) => value !== undefined).length === 0) return res.json({ success: true, message: "Nothing to update." });
  const result = await editConfig(req.body);
  if ("error" in result) {
    switch (result.error) {
      case "config_unloaded":
      case "unwriteable":
        return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
      case "malformed":
        return res.status(400).json({ error: "malformed", message: `Your config is malformed!\n${result.message}` });
      case "editing_readonly":
        return res.status(400).json({ error: "editing_readonly", message: `You attempted to change a read-only setting!` });  
      default:
        return res.status(500).json({ error: "unknown", message: "An unknown error occurred." });
    }
  }
  return res.json({ success: true });
});
export { router };