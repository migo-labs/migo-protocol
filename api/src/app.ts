import express from "express";
import cors from "cors";
import splitsRouter from "./routes/splits.routes";
import { healthRouter } from "./routes/health.routes";
import qrRouter from "./routes/qr.routes";




export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use("/health", healthRouter);
  app.use("/splits", splitsRouter);
  app.use("/qr", qrRouter);

  

  return app;
}