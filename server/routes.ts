import type { Express } from "express";
import { storage } from "./storage.js";
import { VirusTotalService } from "./virustotal.js";
import { batchScanRequestSchema } from "./schema.js";

export async function registerRoutes(app: Express): Promise<void> {
  console.log("🟢 Entering registerRoutes()");

  const apiKey = process.env.VIRUSTOTAL_API_KEY;
  if (!apiKey) {
    console.warn("⚠️ VIRUSTOTAL_API_KEY not set. API will return errors.");
  }

  const vtService = apiKey ? new VirusTotalService(apiKey) : null;

  // =================== POST /api/scan ===================
  app.post("/api/scan", async (req, res) => {
    console.log("📩 [POST /api/scan] Incoming request");
    try {
      console.log("📦 Request body:", JSON.stringify(req.body, null, 2));

      if (!vtService) {
        console.warn("❌ VirusTotalService not initialized — no API key configured");
        return res.status(500).json({
          error: "VirusTotal API key not configured",
        });
      }

      console.log("🔍 Validating request schema...");
      const validation = batchScanRequestSchema.safeParse(req.body);

      if (!validation.success) {
        console.warn("❌ Request validation failed:", validation.error.issues);
        return res.status(400).json({
          error: "Invalid request",
          details: validation.error.issues,
        });
      }

      console.log("✅ Request validation succeeded");

      const { indicators } = validation.data;
      console.log(`🔄 Running VirusTotal batch check for ${indicators.length} indicators...`);

      const { results, errors } = await vtService.checkBatch(indicators);

      console.log("📊 VirusTotal response summary:", {
        resultCount: results.length,
        errorCount: errors.length,
      });

      if (errors.length > 0 && results.length === 0) {
        console.warn("⚠️ VirusTotal scan failed completely:", errors);
        return res.status(429).json({
          error: "Scan failed",
          details: errors,
          message:
            errors.find((e) => e.indicator === "rate_limit")?.error ||
            "Failed to scan all indicators",
        });
      }

      console.log("💾 Saving results to storage...");
      const savedResults = await Promise.all(
        results.map(async (result, idx) => {
          console.log(`💿 [${idx + 1}/${results.length}] Saving ${result.indicator}...`);
          const scanResult = await storage.createScanResult({
            indicator: result.indicator,
            type: result.type,
            status: result.status,
            detections: result.detections,
            totalVendors: result.totalVendors,
            vendorResults: result.vendorResults as any,
            rawResponse: null,
          });
          return {
            id: scanResult.id,
            indicator: scanResult.indicator,
            type: scanResult.type,
            status: scanResult.status,
            detections: scanResult.detections,
            totalVendors: scanResult.totalVendors,
            lastScanned: scanResult.lastScanned.toISOString(),
            vendorResults: result.vendorResults,
          };
        })
      );

      console.log("✅ Results saved successfully. Sending response...");
      res.json({
        results: savedResults,
        errors: errors.length > 0 ? errors : undefined,
        partialSuccess: errors.length > 0 && results.length > 0,
      });

      console.log("🏁 [POST /api/scan] Response sent successfully");
    } catch (error) {
      console.error("🔥 [POST /api/scan] Error:", error);
      res.status(500).json({
        error: "Failed to scan indicators",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // =================== GET /api/scans ===================
  app.get("/api/scans", async (req, res) => {
    console.log("📥 [GET /api/scans] Request received");
    try {
      const results = await storage.getAllScanResults();
      console.log(`✅ Retrieved ${results.length} scan results`);
      res.json({
        results: results.map((r) => ({
          ...r,
          lastScanned: r.lastScanned.toISOString(),
        })),
      });
    } catch (error) {
      console.error("🔥 [GET /api/scans] Error:", error);
      res.status(500).json({ error: "Failed to retrieve scans" });
    }
  });

  // =================== GET /api/scan/:id ===================
  app.get("/api/scan/:id", async (req, res) => {
    console.log("🔎 [GET /api/scan/:id] ID:", req.params.id);
    try {
      const result = await storage.getScanResult(req.params.id);
      if (!result) {
        console.warn("⚠️ Scan not found for ID:", req.params.id);
        return res.status(404).json({ error: "Scan not found" });
      }
      console.log("✅ Found scan result:", result.indicator);
      res.json({
        ...result,
        lastScanned: result.lastScanned.toISOString(),
      });
    } catch (error) {
      console.error("🔥 [GET /api/scan/:id] Error:", error);
      res.status(500).json({ error: "Failed to retrieve scan" });
    }
  });

  // =================== Root / (optional ping endpoint) ===================
  app.get("/", (req, res) => {
    console.log("🏁 [GET /] Health check hit");
    res.send({
      activeStatus: true,
      error: false,
      timestamp: new Date().toISOString(),
    });
  });

  console.log("🟢 registerRoutes() complete — all endpoints mounted.");
}
