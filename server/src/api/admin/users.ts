import express, { Router } from "express";
import { checkPermission, getPermissionIDs, type Permission } from "../../permissions/permissions.js";
import { createUser, deleteUser, editUser, getAllUsers, getUser } from "../../users/users.js";
import { getUserSessions } from "../../users/sessions.js";
import { getAllACLs } from "../../permissions/acls.js";
import { getAllRoles } from "../../permissions/roles.js";
import { writeLog } from "../../utils/auditlog.js";
const router: Router = express.Router();
router.get("/", async (req, res) => {
  if (!req.session) {
    console.error(`Server Error - Couldn't read session in an auth-enforced route!\nPath: ${req.originalUrl}\nMethod: ${req.method}`);
    return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
  }
  if (!await checkPermission(req.session.userID, "users:list")) return res.status(403).json({ error: "forbidden", message: "You don't have permission to do this!" });
  const users = await getAllUsers();
  if ("error" in users) {
    switch (users.error) {
      case "server":
        return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
      default:
        return res.status(500).json({ error: "unknown", message: "An unknown error occured." });
    }
  }
  return res.json(users);
});
router.post("/", async (req, res) => {
  if (!req.session) {
    console.error(`Server Error - Couldn't read session in an auth-enforced route!\nPath: ${req.originalUrl}\nMethod: ${req.method}`);
    return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
  }
  if (!await checkPermission(req.session.userID, "users:create")) return res.status(403).json({ error: "forbidden", message: "You don't have permission to do this!" });
  if (!req.body) return res.status(400).json({ error: "request_body", message: "Your request's body is empty or invalid." });
  if (!req.body.username || (req.body.username as string).length < 1) return res.status(400).json({ error: "username", message: 'No username ("username" parameter) provided.' });
  if (!req.body.password || (req.body.password as string).length < 1) return res.status(400).json({ error: "password", message: 'No password ("password" parameter) provided.' });
  const newUser = await createUser(req.body.username, req.body.password, {});
  if ("error" in newUser) {
    switch (newUser.error) {
      case "server":
        return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
      case "username_used":
        return res.status(400).json({ error: "username_used", message: "This username has already been used! Please pick another and try again." });
      default:
        return res.status(500).json({ error: "unknown", message: "An unknown error occured." });
    }
  }
  await writeLog(req.session.userID, req.session.username, "users-create", { id: newUser.id, newContents: { username: req.body.username, password: "[redacted]" } }, "created a user");
  return res.json({ id: newUser.id });
});
router.get("/:userID", async (req, res) => {
  if (!req.session) {
    console.error(`Server Error - Couldn't read session in an auth-enforced route!\nPath: ${req.originalUrl}\nMethod: ${req.method}`);
    return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
  }
  let accessLevel: "full" | "limited" | null = null;
  if (await checkPermission(req.session.userID, "users:read.full")) {
    accessLevel = "full";
  } else if (await checkPermission(req.session.userID, "users:read")) {
    accessLevel = "limited";
  } else return res.status(403).json({ error: "forbidden", message: "You don't have permission to do this!" });
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
  await writeLog(req.session.userID, req.session.username, "users-read", { id: parseInt(req.params.userID), accessLevel }, "read a user");
  if (accessLevel === "full") return res.json({ access: "full", username: otherUser.username, roles: otherUser.roles, permissions: otherUser.permissions, acls: otherUser.acls, failedLogins: otherUser.failedLogins, locked: otherUser.locked, sessions: (sessions.length > 0 ? sessions : undefined) });
  if (accessLevel === "limited") return res.json({ access: "limited", username: otherUser.username, failedLogins: otherUser.failedLogins, locked: otherUser.locked });
});
router.patch("/:userID", async (req, res) => {
  if (!req.session) {
    console.error(`Server Error - Couldn't read session in an auth-enforced route!\nPath: ${req.originalUrl}\nMethod: ${req.method}`);
    return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
  }
  if (!await checkPermission(req.session.userID, "users:edit")) return res.status(403).json({ error: "forbidden", message: "You don't have permission to do this!" });
  if (!req.body) return res.status(400).json({ error: "request_body", message: "Your request's body is empty or invalid." });
  let updateParams: Partial<{ username: string, password: string, clearLoginAttempts: boolean }> = {};
  updateParams = { username: req.body.username, password: req.body.password, clearLoginAttempts: req.body.clearLoginAttempts };
  if (Object.values(updateParams).filter((value) => value !== undefined).length === 0) return res.json({ success: true, message: "Nothing to update." });
  const result = await editUser(parseInt(req.params.userID), updateParams);
  if (result === undefined) return res.status(500).json({ error: "unknown", message: "An unknown error occurred." });
  if ("error" in result) {
    switch (result.error) {
      case "server":
        return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
      case "not_found":
        return res.status(400).json({ error: "not_found", message: "The provided user doesn't exist." });
      case "username_used":
        return res.status(400).json({ error: "username_used", message: "This username has already been used! Please pick another and try again." });
      default:
        return res.status(500).json({ error: "unknown", message: "An unknown error occured." });
    }
  }
  if (updateParams.password) updateParams.password = "[redacted]";
  await writeLog(req.session.userID, req.session.username, "users-edit", { id: parseInt(req.params.userID), newContents: updateParams }, "edited a user");
  return res.json({ success: true });
});
router.patch("/:userID/lock", async (req, res) => {
  if (!req.session) {
    console.error(`Server Error - Couldn't read session in an auth-enforced route!\nPath: ${req.originalUrl}\nMethod: ${req.method}`);
    return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
  }
  if (!await checkPermission(req.session.userID, "users:lock")) return res.status(403).json({ error: "forbidden", message: "You don't have permission to do this!" });
  if (!req.body) return res.status(400).json({ error: "request_body", message: "Your request's body is empty or invalid." });
  if (req.body.locked !== true && req.body.locked !== false) return res.status(400).json({ error: "request_body", message: "Your request's body is missing a valid 'locked' attribute (not a boolean)." });
  if (Number.parseInt(req.params.userID) === req.session.userID) return res.status(400).json({ error: "editing_self", message: "You can't lock/unlock yourself." });
  const result = await editUser(parseInt(req.params.userID), { locked: req.body.locked });
  if ("error" in result) {
    switch (result.error) {
      case "server":
        return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
      case "not_found":
        return res.status(400).json({ error: "not_found", message: "The provided user doesn't exist." });
      default:
        return res.status(500).json({ error: "unknown", message: "An unknown error occured." });
    }
  }
  await writeLog(req.session.userID, req.session.username, "users-edit", { id: parseInt(req.params.userID), newContents: { locked: req.body.locked } }, "edited a user");
  return res.json({ success: true });
});
router.patch("/:userID/grant", async (req, res) => {
  if (!req.session) {
    console.error(`Server Error - Couldn't read session in an auth-enforced route!\nPath: ${req.originalUrl}\nMethod: ${req.method}`);
    return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
  }
  if (!await checkPermission(req.session.userID, "users:grant")) return res.status(403).json({ error: "forbidden", message: "You don't have permission to do this!" });
  if (!req.body || !Array.isArray(req.body)) return res.status(400).json({ error: "request_body", message: "Your request's body is empty or invalid." });
  const user = await getUser(parseInt(req.params.userID));
  if ("error" in user) {
    switch (user.error) {
      case "server":
        return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
      case "not_found":
        return res.status(400).json({ error: "not_found", message: "Error looking up your session, please sign in again." });
      default:
        return res.status(500).json({ error: "unknown", message: "An unknown error occured." });
    }
  }
  const allRoles = await getAllRoles();
  if ("error" in allRoles) {
    switch (allRoles.error) {
      case "server":
        return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
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
  const changed = { roles: false, acls: false, permissions: false };
  const roles = new Set<number>(user.roles);
  const acls = new Set<number>(user.acls);
  const permissions = new Set<Permission>(user.permissions);
  for (const item of (req.body as { id: number | Permission, type: "role" | "acl" | "permission", revoke: boolean }[])) {
    if (!("id" in item) || !("type" in item) || !("revoke" in item) || (item.revoke !== true && item.revoke !== false)) return res.status(400).json({ error: "item", message: "An item in your request was malformed or invalid." });
    switch (item.type) {
      case "role":
        if (!allRoles.find(role => role.id === item.id)) return res.status(400).json({ error: "role", message: `Role #${item.id} doesn't exist, please correct this and try again.` });
        changed.roles = true;
        if (item.revoke) {
          roles.delete(item.id as number);
        } else {
          roles.add(item.id as number);
        }
        break;
      case "acl":
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
  if (!changed.roles && !changed.acls && !changed.permissions) return res.json({ success: true, message: "Nothing to update." });
  const updateParams: Partial<{ roles: number[], acls: number[], permissions: Permission[] }> = {};
  if (changed.roles) updateParams.roles = [...roles];
  if (changed.acls) updateParams.acls = [...acls];
  if (changed.permissions) updateParams.permissions = [...permissions];
  const result = await editUser(parseInt(req.params.userID), updateParams);
  if ("error" in result) {
    switch (result.error) {
      case "server":
        return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
      case "not_found":
        return res.status(400).json({ error: "not_found", message: "The provided user doesn't exist." });
      default:
        return res.status(500).json({ error: "unknown", message: "An unknown error occured." });
    }
  }
  await writeLog(req.session.userID, req.session.username, "users-edit", { id: parseInt(req.params.userID), newContents: updateParams }, "edited a user");
  return res.json({ success: true });
});
router.delete("/:userID", async (req, res) => {
  if (!req.session) {
    console.error(`Server Error - Couldn't read session in an auth-enforced route!\nPath: ${req.originalUrl}\nMethod: ${req.method}`);
    return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
  }
  if (!await checkPermission(req.session.userID, "users:delete")) return res.status(403).json({ error: "forbidden", message: "You don't have permission to do this!" });
  const result = await deleteUser(parseInt(req.params.userID));
  if ("error" in result) {
    switch (result.error) {
      case "server":
        return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
      case "not_found":
        return res.status(400).json({ error: "not_found", message: "The provided user doesn't exist." });
      default:
        return res.status(500).json({ error: "unknown", message: "An unknown error occured." });
    }
  }
  await writeLog(req.session.userID, req.session.username, "users-delete", { id: parseInt(req.params.userID) }, "deleted a user");
  return res.json({ success: true });
});
export { router };