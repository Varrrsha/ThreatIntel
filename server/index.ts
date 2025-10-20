import express from "express";
import serverless from "serverless-http";
import dotenv from "dotenv";
import { registerRoutes } from "./routes.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// register routes directly (no async wrapper)
// registerRoutes(app);

app.get("/", (req, res) => {
  res.json({ message: "Backend is live 🚀" });
});

// error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal Server Error" });
});

export default serverless(app);