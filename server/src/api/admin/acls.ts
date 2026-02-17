import express, { Router } from "express";
import { checkPermission } from "../../permissions/permissions.js";
import { createACL, getAllACLs } from "../../permissions/acls.js";
const router: Router = express.Router();
router.get("/", async (req, res) => {
  if (!req.session) {
    console.error(`Server Error - Couldn't read session in an auth-enforced route!\nPath: ${req.originalUrl}\nMethod: ${req.method}`);
    return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
  }
  if (!await checkPermission(req.session.userID, "acls:list")) return res.status(403).json({ error: "forbidden", message: "You don't have permission to do this!" });
  const acls = await getAllACLs();
  if ("error" in acls) {
    switch (acls.error) {
      case "server":
        return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
      default:
        return res.status(500).json({ error: "unknown", message: "An unknown error occured." });
    }
  }
  return res.json(acls);
});
router.post("/", async (req, res) => {
  if (!req.session) {
    console.error(`Server Error - Couldn't read session in an auth-enforced route!\nPath: ${req.originalUrl}\nMethod: ${req.method}`);
    return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
  }
  if (!await checkPermission(req.session.userID, "acls:create")) return res.status(403).json({ error: "forbidden", message: "You don't have permission to do this!" });
  if (!req.body) return res.status(400).json({ error: "request_body", message: "Your request's body is empty or invalid." });
  if (!req.body.name || (req.body.name as string).trim().length < 1) return res.status(400).json({ error: "name", message: "ACL 'name' is missing, please resend after fixing!" });
  const newACL = await createACL(req.body.name, {  });
  if ("error" in newACL) {
    switch (newACL.error) {
      case "server":
        return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
      default:
        return res.status(500).json({ error: "unknown", message: "An unknown error occured." });
    }
  }
  return res.json({ id: newACL.id });
});
router.get("/:aclID", async (req, res) => {
  if (!req.session) {
    console.error(`Server Error - Couldn't read session in an auth-enforced route!\nPath: ${req.originalUrl}\nMethod: ${req.method}`);
    return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
  }
  if (!await checkPermission(req.session.userID, "acls:read")) return res.status(403).json({ error: "forbidden", message: "You don't have permission to do this!" });
});
router.patch("/:aclID", async (req, res) => {
  if (!req.session) {
    console.error(`Server Error - Couldn't read session in an auth-enforced route!\nPath: ${req.originalUrl}\nMethod: ${req.method}`);
    return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
  }
  if (!await checkPermission(req.session.userID, "acls:edit")) return res.status(403).json({ error: "forbidden", message: "You don't have permission to do this!" });
  if (!req.body) return res.status(400).json({ error: "request_body", message: "Your request's body is empty or invalid." });
});
router.delete("/:aclID", async (req, res) => {
  if (!req.session) {
    console.error(`Server Error - Couldn't read session in an auth-enforced route!\nPath: ${req.originalUrl}\nMethod: ${req.method}`);
    return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
  }
  if (!await checkPermission(req.session.userID, "acls:delete")) return res.status(403).json({ error: "forbidden", message: "You don't have permission to do this!" });
});
export { router };