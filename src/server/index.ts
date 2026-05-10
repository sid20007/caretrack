import express, { Request, Response } from "express";
import { config } from "../config";

export function createServer() {
  const app = express();
  app.use(express.json());

  app.get("/health", (_req: Request, res: Response) => {
    res.json({
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      env: config.nodeEnv,
    });
  });

  app.get("/", (_req: Request, res: Response) => {
    res.json({ status: "running" });
  });

  return app;
}
