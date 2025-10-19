import { type User, type InsertUser, type ScanResult, type InsertScanResult } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createScanResult(result: InsertScanResult): Promise<ScanResult>;
  getScanResult(id: string): Promise<ScanResult | undefined>;
  getScanResultByIndicator(indicator: string): Promise<ScanResult | undefined>;
  getAllScanResults(): Promise<ScanResult[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private scanResults: Map<string, ScanResult>;

  constructor() {
    this.users = new Map();
    this.scanResults = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createScanResult(insertResult: InsertScanResult): Promise<ScanResult> {
    const id = randomUUID();
    const result: ScanResult = {
      id,
      indicator: insertResult.indicator,
      type: insertResult.type,
      status: insertResult.status,
      detections: insertResult.detections ?? 0,
      totalVendors: insertResult.totalVendors ?? 0,
      vendorResults: insertResult.vendorResults ?? null,
      rawResponse: insertResult.rawResponse ?? null,
      lastScanned: new Date(),
    };
    this.scanResults.set(id, result);
    return result;
  }

  async getScanResult(id: string): Promise<ScanResult | undefined> {
    return this.scanResults.get(id);
  }

  async getScanResultByIndicator(indicator: string): Promise<ScanResult | undefined> {
    return Array.from(this.scanResults.values()).find(
      (result) => result.indicator === indicator,
    );
  }

  async getAllScanResults(): Promise<ScanResult[]> {
    return Array.from(this.scanResults.values());
  }
}

export const storage = new MemStorage();
