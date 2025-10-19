import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const scanResults = pgTable("scan_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  indicator: text("indicator").notNull(),
  type: text("type").notNull(),
  status: text("status").notNull(),
  detections: integer("detections").notNull().default(0),
  totalVendors: integer("total_vendors").notNull().default(0),
  lastScanned: timestamp("last_scanned").notNull().defaultNow(),
  vendorResults: jsonb("vendor_results"),
  rawResponse: jsonb("raw_response"),
});

export const insertScanResultSchema = createInsertSchema(scanResults).omit({
  id: true,
  lastScanned: true,
});

export type InsertScanResult = z.infer<typeof insertScanResultSchema>;
export type ScanResult = typeof scanResults.$inferSelect;

export const batchScanRequestSchema = z.object({
  indicators: z.array(z.string()).min(1).max(100),
});

export type BatchScanRequest = z.infer<typeof batchScanRequestSchema>;
