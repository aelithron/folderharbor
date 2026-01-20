import express from "express";
import type { Server } from "http";
import { router as utilsRouter } from "./utils.js";
export default async function startAPI(port: number): Promise<Server> {
  const app = express();
  app.get("/", (req, res) => res.json({ server: "FolderHarbor" }));
  app.use("/utils", utilsRouter);
  const server = app.listen(port);
  server.on("listening", () => console.log(`API server running (port ${port})`));
  return server;
}