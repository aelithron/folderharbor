import express, { Router } from "express";
import { checkPermission } from "../../permissions/permissions.js";
import { getAllRoles } from "../../permissions/roles.js";
const router: Router = express.Router();
router.get("/", async (req, res) => {
  if (!req.session) {
    console.error(`Server Error - Couldn't read session in an auth-enforced route!\nPath: ${req.originalUrl}\nMethod: ${req.method}`);
    return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
  }
  if (!await checkPermission(req.session.userID, "roles:list")) return res.status(403).json({ error: "forbidden", message: "You don't have permission to do this!" });
  const roles = await getAllRoles();
  if ("error" in roles) {
    switch (roles.error) {
      case "server":
        return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
      default:
        return res.status(500).json({ error: "unknown", message: "An unknown error occured." });
    }
  }
  return res.json(roles);
});
router.post("/", async (req, res) => {
  if (!req.session) {
    console.error(`Server Error - Couldn't read session in an auth-enforced route!\nPath: ${req.originalUrl}\nMethod: ${req.method}`);
    return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
  }
  if (!await checkPermission(req.session.userID, "roles:create")) return res.status(403).json({ error: "forbidden", message: "You don't have permission to do this!" });
  if (!req.body) return res.status(400).json({ error: "request_body", message: "Your request's body is empty or invalid." });
});
router.get("/:roleID", async (req, res) => {
  if (!req.session) {
    console.error(`Server Error - Couldn't read session in an auth-enforced route!\nPath: ${req.originalUrl}\nMethod: ${req.method}`);
    return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
  }
  if (!await checkPermission(req.session.userID, "roles:read")) return res.status(403).json({ error: "forbidden", message: "You don't have permission to do this!" });
});
router.patch("/:roleID", async (req, res) => {
  if (!req.session) {
    console.error(`Server Error - Couldn't read session in an auth-enforced route!\nPath: ${req.originalUrl}\nMethod: ${req.method}`);
    return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
  }
  if (!await checkPermission(req.session.userID, "roles:edit")) return res.status(403).json({ error: "forbidden", message: "You don't have permission to do this!" });
  if (!req.body) return res.status(400).json({ error: "request_body", message: "Your request's body is empty or invalid." });
});
router.delete("/:roleID", async (req, res) => {
  if (!req.session) {
    console.error(`Server Error - Couldn't read session in an auth-enforced route!\nPath: ${req.originalUrl}\nMethod: ${req.method}`);
    return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
  }
  if (!await checkPermission(req.session.userID, "roles:delete")) return res.status(403).json({ error: "forbidden", message: "You don't have permission to do this!" });
});
export { router };