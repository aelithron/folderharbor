import express, { Router } from "express";
import { checkPermission, getPermissionIDs, permissions, type Permission } from "../../permissions/permissions.js";
import { createRole, deleteRole, editRole, getAllRoles, getRole } from "../../permissions/roles.js";
import { getAllACLs } from "../../permissions/acls.js";
import { writeLog } from "../../utils/auditlog.js";
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
  if (!req.body.name || (req.body.name as string).trim().length < 1) return res.status(400).json({ error: "name", message: 'No role name ("name" parameter) provided.' });
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
  await writeLog(req.session.userID, req.session.username, "roles-create", { id: role.id, newContents: { name: req.body.name, permissions: (Array.isArray(req.body.permissions) ? req.body.permissions : []), acls: (Array.isArray(req.body.acls) ? req.body.acls : []) } }, "created a role");
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
  await writeLog(req.session.userID, req.session.username, "roles-read", { id: parseInt(req.params.roleID) }, "read a role");
  return res.json(role);
});
router.patch("/:roleID", async (req, res) => {
  if (!req.session) {
    console.error(`Server Error - Couldn't read session in an auth-enforced route!\nPath: ${req.originalUrl}\nMethod: ${req.method}`);
    return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
  }
  if (!await checkPermission(req.session.userID, "roles:edit")) return res.status(403).json({ error: "forbidden", message: "You don't have permission to do this!" });
  if (!req.body) return res.status(400).json({ error: "request_body", message: "Your request's body is empty or invalid." });
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
  if (Array.isArray(req.body.permissions)) for (const node of req.body.permissions) if (!permissions.find(otherNode => otherNode.id === node)) return res.status(400).json({ error: "permissions", message: `Permission "${node}" doesn't exist, please correct this and try again.` });
  const updateParams = { name: req.body.name, permissions: (Array.isArray(req.body.permissions) ? req.body.permissions : undefined), acls: (Array.isArray(req.body.acls) ? req.body.acls : undefined) };
  if (Object.values(updateParams).filter((value) => value !== undefined).length === 0) return res.json({ success: true, message: "Nothing to update." });
  const role = await editRole(parseInt(req.params.roleID), updateParams);
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
  await writeLog(req.session.userID, req.session.username, "roles-edit", { id: parseInt(req.params.roleID), newContents: updateParams }, "edited a role");
  return res.json({ success: true });
});
router.patch("/:roleID/grant", async (req, res) => {
  if (!req.session) {
    console.error(`Server Error - Couldn't read session in an auth-enforced route!\nPath: ${req.originalUrl}\nMethod: ${req.method}`);
    return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
  }
  if (!await checkPermission(req.session.userID, "roles:edit")) return res.status(403).json({ error: "forbidden", message: "You don't have permission to do this!" });
  if (!req.body || !Array.isArray(req.body)) return res.status(400).json({ error: "request_body", message: "Your request's body is empty or invalid." });
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
  const allACLs = await getAllACLs();
  if ("error" in allACLs) {
    switch (allACLs.error) {
      case "server":
        return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
      default:
        return res.status(500).json({ error: "unknown", message: "An unknown error occured." });
    }
  }
  const changed = { acls: false, permissions: false };
  const acls = new Set<number>(role.acls);
  const permissions = new Set<Permission>(role.permissions);
  for (const item of (req.body as { id: number | Permission, type: "acl" | "permission", revoke: boolean }[])) {
    if (!("id" in item) || !("type" in item) || !("revoke" in item) || (item.revoke !== true && item.revoke !== false)) return res.status(400).json({ error: "item", message: "An item in your request was malformed or invalid." });
    switch (item.type) {
      case "acl":
        if (!Number.isInteger(item.id)) item.id = parseInt(item.id as string);
        if (!allACLs.find(acl => acl.id === item.id)) return res.status(400).json({ error: "acl", message: `ACL #${item.id} doesn't exist, please correct this and try again.` });
        changed.acls = true;
        if (item.revoke) {
          acls.delete(item.id as number);
        } else {
          acls.add(item.id as number);
        }
        break;
      case "permission":
        if (!getPermissionIDs().includes(item.id as Permission)) return res.status(400).json({ error: "permission", message: `Permission "${item.id}" doesn't exist, please correct this and try again.` });
        changed.permissions = true;
        if (item.revoke) {
          permissions.delete(item.id as Permission);
        } else {
          permissions.add(item.id as Permission);
        }
        break;
      default:
        return res.status(400).json({ error: "item", message: "An item in your request was malformed or invalid." });
    }
  }
  if (!changed.acls && !changed.permissions) return res.json({ success: true, message: "Nothing to update." });
  const updateParams: Partial<{ roles: number[], acls: number[], permissions: Permission[] }> = {};
  if (changed.acls) updateParams.acls = [...acls];
  if (changed.permissions) updateParams.permissions = [...permissions];
  const result = await editRole(parseInt(req.params.roleID), updateParams);
  if ("error" in result) {
    switch (result.error) {
      case "server":
        return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
      case "not_found":
        return res.status(400).json({ error: "not_found", message: "The provided role doesn't exist." });
      default:
        return res.status(500).json({ error: "unknown", message: "An unknown error occured." });
    }
  }
  await writeLog(req.session.userID, req.session.username, "roles-edit", { id: parseInt(req.params.roleID), newContents: updateParams }, "edited a role");
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
  await writeLog(req.session.userID, req.session.username, "roles-delete", { id: parseInt(req.params.roleID) }, "deleted a role");
  return res.json({ success: true });
});
export { router };