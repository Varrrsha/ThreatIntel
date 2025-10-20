import express from "express";
import dotenv from "dotenv";
import { registerRoutes } from "./routes.js";

dotenv.config();

const app = express();

// log + finish
app.use((req, res, next) => {
  const t0 = Date.now();
  console.log(`➡️ ${req.method} ${req.url}`);
  res.on("finish", () => console.log(`✅ ${req.method} ${req.url} → ${res.statusCode} (${Date.now()-t0}ms)`));
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

await registerRoutes(app); // mounts /api/*

app.get("/api/health", (_req, res) => res.status(200).json({ ok: true, ts: new Date().toISOString() }));
app.get("/", (_req, res) => res.status(200).json({ message: "Backend is live 🚀" }));
app.use((req, res) => res.status(404).json({ error: "Not Found" }));

// Export the app (NO serverless-http)
export default app;
