import express from "express";
import type { Server } from "http";
export default async function startAPI(port: number): Promise<Server> {
  const app = express();
  app.get("/", (req, res) => res.send("FolderHarbor API!"));
  return app.listen(port, () => console.log(`API server running (port ${port})`));
}