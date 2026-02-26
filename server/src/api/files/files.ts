import express, { Router } from "express";
import { enforceAuth } from "../api.js";
import { getItemType, listDir, readFile } from "../../core.js";
import path from "path";
const router: Router = express.Router();
router.use(enforceAuth());
router.get("/", async (req, res) => {
  if (!req.session) {
    console.error(`Server Error - Couldn't read session in an auth-enforced route!\nPath: ${req.originalUrl}\nMethod: ${req.method}`);
    return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
  }
  const type = await getItemType((req.query.path ? path.resolve(req.query.path as string) : undefined));
  if ("error" in type) {
    switch (type.error) {
      case "server":
        return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
      case "invalid_path":
        return res.status(400).json({ error: "path", message: "The item at the specified path doesn't exist." });
      default:
        return res.status(500).json({ error: "unknown", message: "An unknown error occured." });
    }
  }
  if (type.type === "file") {
    const file = await readFile(req.session.userID, (req.query.path ? path.resolve(req.query.path as string) : "/"));
    if ("error" in file) {
      switch (file.error) {
        case "server":
          return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
        case "invalid_path":
          return res.status(400).json({ error: "path", message: "The item at the specified path doesn't exist." });
        case "not_found":
          return res.status(401).json({ error: "session", message: "There was an error with looking up your user, please sign in again." });
        case "not_allowed":
          return res.status(403).json({ error: "access", message: "You don't have permission to access that path!" });
        default:
          return res.status(500).json({ error: "unknown", message: "An unknown error occured." });
      }
    }
    return res.json(file);
  } else if (type.type === "folder") {
    const files = await listDir(req.session.userID, (req.query.path ? path.resolve(req.query.path as string) : undefined));
    if ("error" in files) {
      switch (files.error) {
        case "server":
          return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
        case "not_found":
          return res.status(401).json({ error: "session", message: "There was an error with looking up your user, please sign in again." });
        default:
          return res.status(500).json({ error: "unknown", message: "An unknown error occured." });
      }
    }
    return res.json(files);
  } else {
    return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
  }
});
export { router };