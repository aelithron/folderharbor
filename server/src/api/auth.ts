import express, { Router } from "express";
import { createSession } from "../users/users.js";
const router: Router = express.Router();
router.get("/", (req, res) => res.send("idk even anymore, tired :c"));
router.post("/signin", async (req, res) => {
  if (!req.body) {
    res.status(400);
    res.json({ error: "request_body", message: "Your request's body is empty or invalid." });
    return;
  }
  if (!req.body.username || (req.body.username as string).length < 1) {
    res.status(400);
    res.json({ error: "username", message: "Your request doesn't include a username." });
    return;
  }
  if (!req.body.password || (req.body.password as string).length < 1) {
    res.status(400);
    res.json({ error: "password", message: "Your request doesn't include a password." });
    return;
  }
  const authRes = await createSession(req.body.username, req.body.password);
  if ((authRes as { error: string }).error) {
    switch((authRes as { error: string }).error) {
      case "server":
        res.status(500);
        res.json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
        break;
      case "not_found":
        res.status(400);
        res.json({ error: "username", message: "That username doesn't exist." });
        break;
      case "wrong_password":
        res.status(403);
        res.json({ error: "password", message: "Incorrect password." });
        break;
      case "locked":
        res.status(403);
        res.json({ error: "locked", message: "Your account is locked, please contact your administrator." });
        break;
      case "rate_limited":
        res.status(403);
        res.json({ error: "rate_limited", message: "Too many failed login attempts, please wait before trying again or contact your administrator." });
        break;
      default:
        res.status(500);
        res.json({ error: "unknown", message: "An unknown error occured." });
    }
    return;
  }
  if ((authRes as { token: string }).token) {
    res.status(200);
    res.json(authRes);
    return;
  }
});
export { router };