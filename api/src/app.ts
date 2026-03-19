import express, { Request, Response, NextFunction } from "express";
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

  //
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(`[Error] ${err.message}`);

    if (err.message.includes("not found") || err.message.includes("Not found")) {
      return res.status(404).json({ error: err.message });
    }
    

    if (err.message.includes("Invalid") || err.message.includes("required") || err.message.includes("exceeds")) {
      return res.status(400).json({ error: err.message });
    }

    return res.status(500).json({ error: "Internal server error" })
  });


  

  return app;
}