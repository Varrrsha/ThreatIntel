import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { VirusTotalService } from "./virustotal";
import { batchScanRequestSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const apiKey = process.env.VIRUSTOTAL_API_KEY;
  
  if (!apiKey) {
    console.error("WARNING: VIRUSTOTAL_API_KEY not set. API will return errors.");
  }

  const vtService = apiKey ? new VirusTotalService(apiKey) : null;

  app.post("/api/scan", async (req, res) => {
    try {
      if (!vtService) {
        return res.status(500).json({ 
          error: "VirusTotal API key not configured" 
        });
      }

      const validation = batchScanRequestSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Invalid request", 
          details: validation.error.issues 
        });
      }

      const { indicators } = validation.data;
      
      const { results, errors } = await vtService.checkBatch(indicators);
      
      if (errors.length > 0 && results.length === 0) {
        return res.status(429).json({ 
          error: "Scan failed",
          details: errors,
          message: errors.find(e => e.indicator === "rate_limit")?.error || "Failed to scan all indicators"
        });
      }

      const savedResults = await Promise.all(
        results.map(async (result) => {
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

      res.json({ 
        results: savedResults,
        errors: errors.length > 0 ? errors : undefined,
        partialSuccess: errors.length > 0 && results.length > 0
      });
    } catch (error) {
      console.error("Scan error:", error);
      res.status(500).json({ 
        error: "Failed to scan indicators",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/scans", async (req, res) => {
    try {
      const results = await storage.getAllScanResults();
      res.json({ 
        results: results.map(r => ({
          ...r,
          lastScanned: r.lastScanned.toISOString()
        }))
      });
    } catch (error) {
      console.error("Get scans error:", error);
      res.status(500).json({ error: "Failed to retrieve scans" });
    }
  });

  app.get('/', (req, res) => {
    res.send({
      activeStatus: true,
      error: false,
    })
  })

  app.get("/api/scan/:id", async (req, res) => {
    try {
      const result = await storage.getScanResult(req.params.id);
      if (!result) {
        return res.status(404).json({ error: "Scan not found" });
      }
      res.json({
        ...result,
        lastScanned: result.lastScanned.toISOString()
      });
    } catch (error) {
      console.error("Get scan error:", error);
      res.status(500).json({ error: "Failed to retrieve scan" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
