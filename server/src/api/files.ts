import express, { Router } from "express";
import { enforceAuth } from "./api.js";
import { listDir } from "../core.js";
import path from "path";
const router: Router = express.Router();
router.use(enforceAuth());
router.get("/", async (req, res) => {
  if (!req.session) {
    console.error(`Server Error - Couldn't read session in an auth-enforced route!\nPath: ${req.originalUrl}\nMethod: ${req.method}`);
    return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
  }
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
});
export { router };