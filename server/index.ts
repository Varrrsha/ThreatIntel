import express from "express";
import serverless from "serverless-http";
import dotenv from "dotenv";
import { registerRoutes } from "./routes.js";

// Load environment variables
console.log("🟡 Loading environment variables...");
dotenv.config();
console.log("✅ dotenv loaded, NODE_ENV =", process.env.NODE_ENV);

const app = express();
app.use((req, res, next) => {
  console.log(`➡️ [${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Register routes
console.log("🟡 Registering routes...");
(async () => {
  try {
    await registerRoutes(app);
    console.log("✅ Routes registered successfully");
  } catch (err) {
    console.error("❌ Error registering routes:", err);
  }
})();

// Health route
app.get("/", (req, res) => {
  console.log("✅ Root route hit");
  res.json({ message: "Backend is live 🚀" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("🔥 Unhandled error in middleware:", err);
  res.status(500).json({ message: "Internal Server Error", error: err?.message });
});

export default serverless(app);