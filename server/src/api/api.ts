import express from "express";
import type { Server } from "http";
import baseRouter from "./base.js";
export default async function startAPI(port: number): Promise<Server> {
  const app = express();
  app.get("/", (req, res) => res.json({ server: "FolderHarbor" }));
  app.use("/base", baseRouter);
  return app.listen(port, () => console.log(`API server running (port ${port})`));
}