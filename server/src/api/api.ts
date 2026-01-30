import express, { type RequestHandler } from "express";
import type { Server } from "http";
import { router as authRouter } from "./auth.js";
import { getSession } from "../users/sessions.js";
import cookieParser from "cookie-parser";
export default async function startAPI(port: number): Promise<Server> {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.get("/", (req, res) => res.json({ server: "FolderHarbor" }));
  app.use("/auth", authRouter);
  const server = app.listen(port);
  server.on("listening", () => console.log(`API server running (port ${port})`));
  return server;
}
export const authMiddleware: RequestHandler = async (req, res, next) => {
  let token: string | null = null;
  if (req.headers.authorization && req.headers.authorization.split("Bearer ", 2)[1]) token = req.headers.authorization.split("Bearer ", 2)[1] as string;
  if (!token && req.cookies["token"]) token = req.cookies["token"];
  if (!token) {
    res.status(401);
    res.json({ error: "unauthorized", message: "No authentication token provided, or an invalid one was sent." });
    return;
  }
  const session = await getSession(token);
  if ((session as { error: string }).error) {
    switch ((session as { error: string }).error) {
      case "server":
        res.status(500);
        res.json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
        break;
      case "locked":
        res.status(403);
        res.json({ error: "locked", message: "Your account is locked, please contact your administrator." });
        break;
      case "invalid":
        res.status(403);
        res.json({ error: "invalid", message: "Your token is invalid, please sign in again." });
        break;
      case "expired":
        res.status(403);
        res.json({ error: "expired", message: "Your session expired, please sign in again." });
        break;
      default:
        res.status(500);
        res.json({ error: "unknown", message: "An unknown error occured." });
    }
  }
  next();
};