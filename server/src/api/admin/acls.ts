import express, { Router } from "express";
import { checkPermission } from "../../rbac/permissions.js";
import { createACL, deleteACL, editACL, getACL, getAllACLs } from "../../rbac/acls.js";
import { writeLog } from "../../utils/auditlog.js";
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
  if (!req.body.name || (req.body.name as string).trim().length < 1) return res.status(400).json({ error: "name", message: 'No ACL name ("name" parameter) provided' });
  const newACL = await createACL(req.body.name, { allow: (Array.isArray(req.body.allow) ? req.body.allow : undefined), deny: (Array.isArray(req.body.deny) ? req.body.deny : undefined) });
  if ("error" in newACL) {
    switch (newACL.error) {
      case "server":
        return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
      default:
        return res.status(500).json({ error: "unknown", message: "An unknown error occured." });
    }
  }
  await writeLog(req.session.userID, req.session.username, "acls-create", { id: newACL.id, newContents: { name: req.body.name, allow: (Array.isArray(req.body.allow) ? req.body.allow : undefined), deny: (Array.isArray(req.body.deny) ? req.body.deny : undefined) } }, "created an ACL");
  return res.json({ id: newACL.id });
});
router.get("/:aclID", async (req, res) => {
  if (!req.session) {
    console.error(`Server Error - Couldn't read session in an auth-enforced route!\nPath: ${req.originalUrl}\nMethod: ${req.method}`);
    return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
  }
  if (!await checkPermission(req.session.userID, "acls:read")) return res.status(403).json({ error: "forbidden", message: "You don't have permission to do this!" });
  const acl = await getACL(parseInt(req.params.aclID));
  if ("error" in acl) {
    switch (acl.error) {
      case "server":
        return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
      case "not_found":
        return res.status(400).json({ error: "not_found", message: "The provided ACL doesn't exist." });
      default:
        return res.status(500).json({ error: "unknown", message: "An unknown error occured." });
    }
  }
  await writeLog(req.session.userID, req.session.username, "acls-read", { id: parseInt(req.params.aclID) }, "read an ACL");
  return res.json(acl);
});
router.patch("/:aclID", async (req, res) => {
  if (!req.session) {
    console.error(`Server Error - Couldn't read session in an auth-enforced route!\nPath: ${req.originalUrl}\nMethod: ${req.method}`);
    return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
  }
  if (!await checkPermission(req.session.userID, "acls:edit")) return res.status(403).json({ error: "forbidden", message: "You don't have permission to do this!" });
  if (!req.body) return res.status(400).json({ error: "request_body", message: "Your request's body is empty or invalid." });
  const updateParams = { name: req.body.name, allow: (Array.isArray(req.body.allow) ? req.body.allow : undefined), deny: (Array.isArray(req.body.deny) ? req.body.deny : undefined) };
  if (Object.values(updateParams).filter((value) => value !== undefined).length === 0) return res.json({ success: true, message: "Nothing to update." });
  const result = await editACL(parseInt(req.params.aclID), updateParams);
  if ("error" in result) {
    switch (result.error) {
      case "server":
        return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
      case "not_found":
        return res.status(400).json({ error: "not_found", message: "The provided ACL doesn't exist." });
      default:
        return res.status(500).json({ error: "unknown", message: "An unknown error occured." });
    }
  }
  await writeLog(req.session.userID, req.session.username, "acls-edit", { id: parseInt(req.params.aclID), newContents: updateParams }, "edited an ACL");
  return res.json({ success: true });
});
router.patch("/:aclID/paths", async (req, res) => {
  if (!req.session) {
    console.error(`Server Error - Couldn't read session in an auth-enforced route!\nPath: ${req.originalUrl}\nMethod: ${req.method}`);
    return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
  }
  if (!await checkPermission(req.session.userID, "acls:edit")) return res.status(403).json({ error: "forbidden", message: "You don't have permission to do this!" });
  if (!req.body || !Array.isArray(req.body)) return res.status(400).json({ error: "request_body", message: "Your request's body is empty or invalid." });
  const acl = await getACL(parseInt(req.params.aclID));
  if ("error" in acl) {
    switch (acl.error) {
      case "server":
        return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
      case "not_found":
        return res.status(400).json({ error: "not_found", message: "The provided ACL doesn't exist." });
      default:
        return res.status(500).json({ error: "unknown", message: "An unknown error occured." });
    }
  }
  const changed = { allow: false, deny: false };
  const allow = new Set<string>(acl.allow);
  const deny = new Set<string>(acl.deny);
  for (const item of (req.body as { path: string, type: "allow" | "deny", delete: boolean }[])) {
    if (!("path" in item) || !("type" in item) || !("delete" in item) || (item.delete !== true && item.delete !== false)) return res.status(400).json({ error: "item", message: "An item in your request was malformed or invalid." });
    switch (item.type) {
      case "allow":
        changed.allow = true;
        if (item.delete) {
          allow.delete(item.path);
        } else {
          allow.add(item.path);
        }
        break;
      case "deny":
        changed.deny = true;
        if (item.delete) {
          deny.delete(item.path);
        } else {
          deny.add(item.path);
        }
        break;
      default:
        return res.status(400).json({ error: "item", message: "An item in your request was malformed or invalid." });
    }
  }
  if (!changed.allow && !changed.deny) return res.json({ success: true, message: "Nothing to update." });
  const updateParams: Partial<{ allow: string[], deny: string[] }> = {};
  if (changed.allow) updateParams.allow = [...allow];
  if (changed.deny) updateParams.deny = [...deny];
  const result = await editACL(parseInt(req.params.aclID), updateParams);
  if ("error" in result) {
    switch (result.error) {
      case "server":
        return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
      case "not_found":
        return res.status(400).json({ error: "not_found", message: "The provided ACL doesn't exist." });
      default:
        return res.status(500).json({ error: "unknown", message: "An unknown error occured." });
    }
  }
  await writeLog(req.session.userID, req.session.username, "acls-edit", { id: parseInt(req.params.aclID), newContents: updateParams }, "edited an ACL");
  return res.json({ success: true });
});
router.delete("/:aclID", async (req, res) => {
  if (!req.session) {
    console.error(`Server Error - Couldn't read session in an auth-enforced route!\nPath: ${req.originalUrl}\nMethod: ${req.method}`);
    return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
  }
  if (!await checkPermission(req.session.userID, "acls:delete")) return res.status(403).json({ error: "forbidden", message: "You don't have permission to do this!" });
  const result = await deleteACL(parseInt(req.params.aclID));
  if ("error" in result) {
    switch (result.error) {
      case "server":
        return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
      case "not_found":
        return res.status(400).json({ error: "not_found", message: "The provided ACL doesn't exist." });
      default:
        return res.status(500).json({ error: "unknown", message: "An unknown error occured." });
    }
  }
  await writeLog(req.session.userID, req.session.username, "acls-delete", { id: parseInt(req.params.aclID) }, "deleted an ACL");
  return res.json({ success: true });
});
export { router };