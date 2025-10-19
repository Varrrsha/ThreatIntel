interface VirusTotalFileReport {
  data: {
    attributes: {
      last_analysis_stats: {
        malicious: number;
        suspicious: number;
        undetected: number;
        harmless: number;
      };
      last_analysis_results: Record<string, {
        category: string;
        engine_name: string;
        result: string | null;
      }>;
      last_analysis_date: number;
    };
  };
}

interface VirusTotalIPReport {
  data: {
    attributes: {
      last_analysis_stats: {
        malicious: number;
        suspicious: number;
        undetected: number;
        harmless: number;
      };
      last_analysis_results: Record<string, {
        category: string;
        engine_name: string;
        result: string;
      }>;
      last_analysis_date: number;
    };
  };
}

export interface VTResult {
  indicator: string;
  type: "hash" | "ip";
  status: "malicious" | "suspicious" | "clean" | "unknown";
  detections: number;
  totalVendors: number;
  vendorResults: Array<{
    vendor: string;
    detected: boolean;
    category?: string;
    result?: string;
  }>;
  lastScanned: string;
}

export class VirusTotalService {
  private apiKey: string;
  private baseUrl = "https://www.virustotal.com/api/v3";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async makeRequest(url: string): Promise<any> {
    const response = await fetch(url, {
      headers: {
        "x-apikey": this.apiKey,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`VirusTotal API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async checkHash(hash: string): Promise<VTResult> {
    const url = `${this.baseUrl}/files/${hash}`;
    const data: VirusTotalFileReport | null = await this.makeRequest(url);

    if (!data) {
      return {
        indicator: hash,
        type: "hash",
        status: "unknown",
        detections: 0,
        totalVendors: 0,
        vendorResults: [],
        lastScanned: new Date().toISOString(),
      };
    }

    const stats = data.data.attributes.last_analysis_stats;
    const results = data.data.attributes.last_analysis_results;
    const detections = stats.malicious + stats.suspicious;
    const totalVendors = Object.keys(results).length;

    const vendorResults = Object.entries(results).map(([vendor, result]) => ({
      vendor: result.engine_name,
      detected: result.category === "malicious" || result.category === "suspicious",
      category: result.result || undefined,
      result: result.category,
    }));

    let status: "malicious" | "suspicious" | "clean" | "unknown";
    if (stats.malicious > 0) {
      status = "malicious";
    } else if (stats.suspicious > 0) {
      status = "suspicious";
    } else if (totalVendors > 0) {
      status = "clean";
    } else {
      status = "unknown";
    }

    return {
      indicator: hash,
      type: "hash",
      status,
      detections,
      totalVendors,
      vendorResults,
      lastScanned: new Date(data.data.attributes.last_analysis_date * 1000).toISOString(),
    };
  }

  async checkIP(ip: string): Promise<VTResult> {
    const url = `${this.baseUrl}/ip_addresses/${ip}`;
    const data: VirusTotalIPReport | null = await this.makeRequest(url);

    if (!data) {
      return {
        indicator: ip,
        type: "ip",
        status: "unknown",
        detections: 0,
        totalVendors: 0,
        vendorResults: [],
        lastScanned: new Date().toISOString(),
      };
    }

    const stats = data.data.attributes.last_analysis_stats;
    const results = data.data.attributes.last_analysis_results;
    const detections = stats.malicious + stats.suspicious;
    const totalVendors = Object.keys(results).length;

    const vendorResults = Object.entries(results).map(([vendor, result]) => ({
      vendor: result.engine_name,
      detected: result.category === "malicious" || result.category === "suspicious",
      category: result.result || undefined,
      result: result.category,
    }));

    let status: "malicious" | "suspicious" | "clean" | "unknown";
    if (stats.malicious > 0) {
      status = "malicious";
    } else if (stats.suspicious > 0) {
      status = "suspicious";
    } else if (totalVendors > 0) {
      status = "clean";
    } else {
      status = "unknown";
    }

    return {
      indicator: ip,
      type: "ip",
      status,
      detections,
      totalVendors,
      vendorResults,
      lastScanned: new Date(data.data.attributes.last_analysis_date * 1000).toISOString(),
    };
  }

  async checkIndicator(indicator: string): Promise<VTResult> {
    const hashRegex = /^[a-fA-F0-9]{32}$|^[a-fA-F0-9]{40}$|^[a-fA-F0-9]{64}$/;
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

    if (hashRegex.test(indicator)) {
      return this.checkHash(indicator);
    } else if (ipRegex.test(indicator)) {
      return this.checkIP(indicator);
    } else {
      throw new Error(`Invalid indicator format: ${indicator}`);
    }
  }

  async checkBatch(indicators: string[]): Promise<{ results: VTResult[]; errors: Array<{ indicator: string; error: string }> }> {
    const results: VTResult[] = [];
    const errors: Array<{ indicator: string; error: string }> = [];
    
    for (const indicator of indicators) {
      try {
        const result = await this.checkIndicator(indicator);
        results.push(result);
        if (indicators.indexOf(indicator) < indicators.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 15000));
        }
      } catch (error) {
        console.error(`Error checking ${indicator}:`, error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        errors.push({ indicator, error: errorMessage });
        
        if (errorMessage.includes("429") || errorMessage.includes("rate limit")) {
          errors.push({
            indicator: "rate_limit",
            error: "VirusTotal API rate limit exceeded. Free tier allows 4 requests per minute. Please wait before scanning more indicators."
          });
          break;
        }
      }
    }

    return { results, errors };
  }
}
