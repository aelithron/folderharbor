import express, { Router } from "express";
import { checkPermission, permissions } from "../../permissions/permissions.js";
import { createUser, deleteUser, editUser, getAllUsers, getUser } from "../../users/users.js";
import { getUserSessions } from "../../users/sessions.js";
import { getAllACLs } from "../../permissions/acls.js";
import { getAllRoles } from "../../permissions/roles.js";
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
  const newUser = await createUser(req.body.username, req.body.password, {  });
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
  if (accessLevel === "full") return res.json({ username: otherUser.username, roles: otherUser.roles, permissions: otherUser.permissions, acls: otherUser.acls, failedLogins: otherUser.failedLogins, locked: otherUser.locked, sessions: (sessions.length > 0 ? sessions : undefined) });
  if (accessLevel === "limited") return res.json({ username: otherUser.username, failedLogins: otherUser.failedLogins, locked: otherUser.locked });
});
router.patch("/:userID", async (req, res) => {
  if (!req.session) {
    console.error(`Server Error - Couldn't read session in an auth-enforced route!\nPath: ${req.originalUrl}\nMethod: ${req.method}`);
    return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
  }
  let accessLevel: "full" | "limited" | null = null;
  if (await checkPermission(req.session.userID, "users:edit.full")) {
    accessLevel = "full";
  } else if (await checkPermission(req.session.userID, "users:edit")) {
    accessLevel = "limited";
  } else return res.status(403).json({ error: "forbidden", message: "You don't have permission to do this!" });
  if (!req.body) return res.status(400).json({ error: "request_body", message: "Your request's body is empty or invalid." });
  if (Object.keys(req.body).length === 0) return res.json({ success: true, message: "No data provided to change." });
  let result;
  if (accessLevel === "full") {
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
    if (Array.isArray(req.body.roles)) {
      const roles = await getAllRoles();
      if ("error" in roles) {
        switch (roles.error) {
          case "server":
            return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
          default:
            return res.status(500).json({ error: "unknown", message: "An unknown error occured." });
        }
      }
      for (const id of req.body.roles) if (!roles.find(role => role.id === id)) return res.status(400).json({ error: "roles", message: `Role "${id}" doesn't exist, please correct this and try again.` });
    }
    const updateParams = { username: req.body.username, password: req.body.password, clearLoginAttempts: req.body.clearLoginAttempts, roles: (Array.isArray(req.body.roles) ? req.body.roles : undefined), acls: (Array.isArray(req.body.acls) ? req.body.acls : undefined), permissions: (Array.isArray(req.body.permissions) ? req.body.permissions : undefined) };
    if (Object.keys(updateParams).length === 0) return res.json({ success: true, message: "Nothing to update." });
    result = await editUser(parseInt(req.params.userID), updateParams);
  }
  if (accessLevel === "limited") {
    const updateParams = { username: req.body.username, password: req.body.password, clearLoginAttempts: req.body.clearLoginAttempts };
    if (Object.keys(updateParams).length === 0) return res.json({ success: true, message: "Nothing to update." });
    result = await editUser(parseInt(req.params.userID), updateParams);
  }
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
  return res.json({ success: true });
});
export { router };