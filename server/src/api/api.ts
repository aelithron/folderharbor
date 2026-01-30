import express, { type RequestHandler } from "express";
import type { Server } from "http";
import { router as authRouter } from "./auth.js";
import { getSession } from "../users/sessions.js";
import cookieParser from "cookie-parser";
import type { Session } from "../types/folderharbor.js";
export default async function startAPI(port: number): Promise<Server> {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use(auth);
  app.get("/", (req, res) => res.json({ server: "FolderHarbor" }));
  app.use("/auth", authRouter);
  const server = app.listen(port);
  server.on("listening", () => console.log(`API server running (port ${port})`));
  return server;
}

async function auth(): Promise<RequestHandler> {
  return async (req, res, next) => {
    let token: string | null = null;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) token = req.headers.authorization.split("Bearer ", 2)[1] as string;
    if (!token && req.cookies["token"]) token = req.cookies["token"];
    if (!token) return next();
    const session = await getSession(token);
    if ((session as { error: string }).error) {
      switch ((session as { error: string }).error) {
        case "server":
          return res.status(500).json({ error: "server", message: "Something went wrong on the server's end, please contact your administrator." });
        case "locked":
        case "invalid":
        case "expired":
          req.sessionErr = (session as { error: string }).error;
          req.session = undefined;
          return next();
        default:
          return res.status(500).json({ error: "unknown", message: "An unknown error occured." });
      }
    }
    req.session = session as Session;
    req.sessionErr = undefined;
    next();
  };
}
export function enforceAuth(): RequestHandler {
  return (req, res, next) => {
    if (req.sessionErr) {
      switch (req.sessionErr) {
        case "locked":
          return res.status(403).json({ error: "locked", message: "Your account is locked, please contact your administrator." });
        case "invalid":
          return res.status(403).json({ error: "invalid", message: "Your token is invalid, please sign in again." });
        case "expired":
          return res.status(403).json({ error: "expired", message: "Your session expired, please sign in again." });
        default:
          return res.status(500).json({ error: "unknown", message: "An unknown error occured." });
      }
    }
    if (!req.session) return res.status(401).json({ error: "unauthorized", message: "No authentication token provided, or an invalid one was sent." });
    return next();
  };
}