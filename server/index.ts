import serverless from "serverless-http";
import dotenv from "dotenv";
import express, { Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// register routes directly (no async wrapper)
registerRoutes(app);

app.get("/", (req, res) => {
  res.json({ message: "Backend is live 🚀" });
});

// error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({ message: "Internal Server Error" });
});

export const handler = serverless(app);
