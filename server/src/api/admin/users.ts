import express, { Router } from "express";
import { checkPermission, getPermissionIDs } from "../../permissions/permissions.js";
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
router.patch("/:userID/grant/:type", async (req, res) => {
  if (!req.session) {
    console.error(`Server Error - Couldn't read session in an auth-enforced route!\nPath: ${req.originalUrl}\nMethod: ${req.method}`);
    return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
  }
  if (!await checkPermission(req.session.userID, "users:grant")) return res.status(403).json({ error: "forbidden", message: "You don't have permission to do this!" });
  if (!req.body) return res.status(400).json({ error: "request_body", message: "Your request's body is empty or invalid." });
  const updateParams: Partial<{ roles: number[], acls: number[], permissions: (`users:${string}` | `roles:${string}` | `acls:${string}` | `config:${string}` | `logs:${string}`)[] }> = {};
  const user = await getUser(req.session.userID);
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
  switch (req.params.type) {
    case "roles": {
      const roles = new Set<number>(user.roles);
      if (!req.body.roles || !Array.isArray(req.body.roles)) return res.status(400).json({ error: "roles", message: `Your "roles" array is missing/malformed!` });
      const allRoles = await getAllRoles();
      if ("error" in allRoles) {
        switch (allRoles.error) {
          case "server":
            return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
          default:
            return res.status(500).json({ error: "unknown", message: "An unknown error occured." });
        }
      }
      for (const item of (req.body.roles as number[])) {
        if (!allRoles.find(acl => acl.id === item)) return res.status(400).json({ error: "roles", message: `Role "${item}" doesn't exist, please correct this and try again.` });
        roles.add(item);
      }
      updateParams.roles = [...roles];
      break;
    }
    case "acls": {
      const acls = new Set<number>(user.acls);
      if (!req.body.acls || !Array.isArray(req.body.acls)) return res.status(400).json({ error: "acls", message: `Your "acls" array is missing/malformed!` });
      const allACLs = await getAllACLs();
      if ("error" in allACLs) {
        switch (allACLs.error) {
          case "server":
            return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
          default:
            return res.status(500).json({ error: "unknown", message: "An unknown error occured." });
        }
      }
      for (const item of (req.body.acls as number[])) {
        if (!allACLs.find(acl => acl.id === item)) return res.status(400).json({ error: "acls", message: `ACL "${item}" doesn't exist, please correct this and try again.` });
        acls.add(item);
      }
      updateParams.acls = [...acls];
      break;
    }
    case "permissions": {
      const permissions = new Set<`users:${string}` | `roles:${string}` | `acls:${string}` | `config:${string}` | `logs:${string}`>(user.permissions);
      if (!req.body.permissions || !Array.isArray(req.body.permissions)) return res.status(400).json({ error: "permissions", message: `Your "permissions" array is missing/malformed!` });
      for (const item of (req.body.permissions as (`users:${string}` | `roles:${string}` | `acls:${string}` | `config:${string}` | `logs:${string}`)[])) {
        if (!getPermissionIDs().includes(item)) return res.status(400).json({ error: "permissions", message: `Permission "${item}" doesn't exist, please correct this and try again.` });
        permissions.add(item);
      }
      updateParams.permissions = [...permissions];
      break;
    }
    default:
      return res.status(400).json({ error: "type", message: "That item type doesn't exist, or isn't grantable!" });
  }
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
router.patch("/:userID/revoke/:type", async (req, res) => {
  if (!req.session) {
    console.error(`Server Error - Couldn't read session in an auth-enforced route!\nPath: ${req.originalUrl}\nMethod: ${req.method}`);
    return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
  }
  if (!await checkPermission(req.session.userID, "users:edit.full")) return res.status(403).json({ error: "forbidden", message: "You don't have permission to do this!" });
  if (!req.body) return res.status(400).json({ error: "request_body", message: "Your request's body is empty or invalid." });
  const updateParams: Partial<{ roles: number[], acls: number[], permissions: (`users:${string}` | `roles:${string}` | `acls:${string}` | `config:${string}` | `logs:${string}`)[] }> = {};
  const user = await getUser(req.session.userID);
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
  switch (req.params.type) {
    case "roles": {
      const roles = new Set<number>(user.roles);
      if (!req.body.roles || !Array.isArray(req.body.roles)) return res.status(400).json({ error: "roles", message: `Your "roles" array is missing/malformed!` });
      const allRoles = await getAllRoles();
      if ("error" in allRoles) {
        switch (allRoles.error) {
          case "server":
            return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
          default:
            return res.status(500).json({ error: "unknown", message: "An unknown error occured." });
        }
      }
      for (const item of (req.body.roles as number[])) {
        if (!allRoles.find(acl => acl.id === item)) return res.status(400).json({ error: "roles", message: `Role "${item}" doesn't exist, please correct this and try again.` });
        roles.delete(item);
      }
      updateParams.roles = [...roles];
      break;
    }
    case "acls": {
      const acls = new Set<number>(user.acls);
      if (!req.body.acls || !Array.isArray(req.body.acls)) return res.status(400).json({ error: "acls", message: `Your "acls" array is missing/malformed!` });
      const allACLs = await getAllACLs();
      if ("error" in allACLs) {
        switch (allACLs.error) {
          case "server":
            return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
          default:
            return res.status(500).json({ error: "unknown", message: "An unknown error occured." });
        }
      }
      for (const item of (req.body.acls as number[])) {
        if (!allACLs.find(acl => acl.id === item)) return res.status(400).json({ error: "acls", message: `ACL "${item}" doesn't exist, please correct this and try again.` });
        acls.delete(item);
      }
      updateParams.acls = [...acls];
      break;
    }
    case "permissions": {
      const permissions = new Set<`users:${string}` | `roles:${string}` | `acls:${string}` | `config:${string}` | `logs:${string}`>(user.permissions);
      if (!req.body.permissions || !Array.isArray(req.body.permissions)) return res.status(400).json({ error: "permissions", message: `Your "permissions" array is missing/malformed!` });
      for (const item of (req.body.permissions as (`users:${string}` | `roles:${string}` | `acls:${string}` | `config:${string}` | `logs:${string}`)[])) {
        if (!getPermissionIDs().includes(item)) return res.status(400).json({ error: "permissions", message: `Permission "${item}" doesn't exist, please correct this and try again.` });
        permissions.delete(item);
      }
      updateParams.permissions = [...permissions];
      break;
    }
    default:
      return res.status(400).json({ error: "type", message: "That item type doesn't exist, or isn't grantable!" });
  }
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