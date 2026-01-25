import express from "express";
import type { Server } from "http";
import { router as authRouter } from "./auth.js";
export default async function startAPI(port: number): Promise<Server> {
  const app = express();
  app.use(express.json());
  app.get("/", (req, res) => res.json({ server: "FolderHarbor" }));
  app.use("/auth", authRouter);
  const server = app.listen(port);
  server.on("listening", () => console.log(`API server running (port ${port})`));
  return server;
}