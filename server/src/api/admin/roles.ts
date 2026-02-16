import express, { Router } from "express";
import { checkPermission, permissions } from "../../permissions/permissions.js";
import { createRole, deleteRole, editRole, getAllRoles, getRole } from "../../permissions/roles.js";
import { getAllACLs } from "../../permissions/acl.js";
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
  if (!req.body.name || (req.body.name as string).trim().length < 1) return res.status(400).json({ error: "name", message: 'No role name ("name" parameter) provided, please include one and try again.' });
  if (Array.isArray(req.body.permissions)) for (const node of req.body.permissions) if (!permissions.find(otherNode => otherNode.id === node)) return res.status(400).json({ error: "permissions", message: `Permission "${node}" doesn't exist, please correct this and try again.` });
  if (Array.isArray(req.body.acls)) {
    const acls = await getAllACLs();
    if ("error" in acls) {
      switch (acls.error) {
        case "server":
          return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
        default:
          return res.status(500).json({ error: "unknown", message: "An unknown error occured." });
      }
    }
    for (const id of req.body.acls) if (!acls.find(acl => acl.id === id)) return res.status(400).json({ error: "acls", message: `ACL "${id}" doesn't exist, please correct this and try again.` });
  }
  const role = await createRole(req.body.name, { permissions: (Array.isArray(req.body.permissions) ? req.body.permissions : []), acls: (Array.isArray(req.body.acls) ? req.body.acls : []) });
  if ("error" in role) {
    switch (role.error) {
      case "server":
        return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
      default:
        return res.status(500).json({ error: "unknown", message: "An unknown error occured." });
    }
  }
  return res.json({ id: role.id });
});
router.get("/:roleID", async (req, res) => {
  if (!req.session) {
    console.error(`Server Error - Couldn't read session in an auth-enforced route!\nPath: ${req.originalUrl}\nMethod: ${req.method}`);
    return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
  }
  if (!await checkPermission(req.session.userID, "roles:read")) return res.status(403).json({ error: "forbidden", message: "You don't have permission to do this!" });
  const role = await getRole(parseInt(req.params.roleID));
  if ("error" in role) {
    switch (role.error) {
      case "server":
        return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
      case "not_found":
        return res.status(400).json({ error: "not_found", message: "The provided role couldn't be found." });
      default:
        return res.status(500).json({ error: "unknown", message: "An unknown error occured." });
    }
  }
  return res.json(role);
});
router.patch("/:roleID", async (req, res) => {
  if (!req.session) {
    console.error(`Server Error - Couldn't read session in an auth-enforced route!\nPath: ${req.originalUrl}\nMethod: ${req.method}`);
    return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
  }
  if (!await checkPermission(req.session.userID, "roles:edit")) return res.status(403).json({ error: "forbidden", message: "You don't have permission to do this!" });
  if (!req.body) return res.status(400).json({ error: "request_body", message: "Your request's body is empty or invalid." });
  if (Array.isArray(req.body.permissions)) for (const node of req.body.permissions) if (!permissions.find(otherNode => otherNode.id === node)) return res.status(400).json({ error: "permissions", message: `Permission "${node}" doesn't exist, please correct this and try again.` });
  if (Array.isArray(req.body.acls)) {
    const acls = await getAllACLs();
    if ("error" in acls) {
      switch (acls.error) {
        case "server":
          return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
        default:
          return res.status(500).json({ error: "unknown", message: "An unknown error occured." });
      }
    }
    for (const id of req.body.acls) if (!acls.find(acl => acl.id === id)) return res.status(400).json({ error: "acls", message: `ACL "${id}" doesn't exist, please correct this and try again.` });
  }
  const role = await editRole(parseInt(req.params.roleID), { name: req.body.name, permissions: (Array.isArray(req.body.permissions) ? req.body.permissions : undefined), acls: (Array.isArray(req.body.acls) ? req.body.acls : undefined) });
  if ("error" in role) {
    switch (role.error) {
      case "server":
        return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
      case "not_found":
        return res.status(400).json({ error: "not_found", message: "The provided role couldn't be found." });
      default:
        return res.status(500).json({ error: "unknown", message: "An unknown error occured." });
    }
  }
  return res.json({ success: true });
});
router.delete("/:roleID", async (req, res) => {
  if (!req.session) {
    console.error(`Server Error - Couldn't read session in an auth-enforced route!\nPath: ${req.originalUrl}\nMethod: ${req.method}`);
    return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
  }
  if (!await checkPermission(req.session.userID, "roles:delete")) return res.status(403).json({ error: "forbidden", message: "You don't have permission to do this!" });
  const result = await deleteRole(parseInt(req.params.roleID));
  if ("error" in result) {
    switch (result.error) {
      case "server":
        return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
      case "not_found":
        return res.status(400).json({ error: "not_found", message: "The provided role couldn't be found." });
      default:
        return res.status(500).json({ error: "unknown", message: "An unknown error occured." });
    }
  }
  return res.json({ success: true });
});
export { router };