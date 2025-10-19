import { useState } from "react";
import { SubmissionForm } from "@/components/SubmissionForm";
import { ResultsTable, type ScanResult } from "@/components/ResultsTable";
import { ResultDetailsDialog } from "@/components/ResultDetailsDialog";
import { FilterBar } from "@/components/FilterBar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Shield } from "lucide-react";
import type { ThreatStatus } from "@/components/StatusBadge";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [results, setResults] = useState<ScanResult[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedResult, setSelectedResult] = useState<ScanResult | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<ThreatStatus | "all">("all");
  const { toast } = useToast();

  const handleSubmit = async (items: string[]) => {
    setIsScanning(true);
    
    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ indicators: items }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to scan indicators");
      }

      const data = await response.json();
      setResults(data.results);

      if (data.partialSuccess && data.errors) {
        const hasRateLimit = data.errors.some((e: any) => e.indicator === "rate_limit");
        const otherErrors = data.errors.filter((e: any) => e.indicator !== "rate_limit");
        
        if (hasRateLimit) {
          toast({
            title: "Rate Limit Reached",
            description: `Scanned ${data.results.length} of ${items.length} indicators. VirusTotal API rate limit exceeded (4 req/min max).`,
            variant: "destructive",
          });
        } else if (otherErrors.length > 0) {
          const errorDetails = otherErrors.slice(0, 2).map((e: any) => `${e.indicator}: ${e.error}`).join("; ");
          toast({
            title: "Partial Scan Complete",
            description: `Scanned ${data.results.length} of ${items.length} indicators. Errors: ${errorDetails}${otherErrors.length > 2 ? "..." : ""}`,
            variant: "destructive",
          });
        }
      } else if (data.errors && data.errors.length > 0) {
        const errorDetails = data.errors.slice(0, 2).map((e: any) => `${e.indicator}: ${e.error}`).join("; ");
        toast({
          title: "Scan Warning",
          description: `${errorDetails}${data.errors.length > 2 ? ` (+${data.errors.length - 2} more)` : ""}`,
        });
      } else {
        toast({
          title: "Scan Complete",
          description: `Successfully scanned ${data.results.length} indicator(s) using VirusTotal API`,
        });
      }
    } catch (error) {
      console.error("Scan error:", error);
      toast({
        title: "Scan Failed",
        description: error instanceof Error ? error.message : "Failed to scan indicators",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleViewDetails = (result: ScanResult) => {
    setSelectedResult(result);
    setDetailsOpen(true);
  };

  const handleExport = (format: "csv" | "json") => {
    console.log(`Exporting ${results.length} results as ${format.toUpperCase()}`);
    
    if (format === "csv") {
      const csv = [
        "Indicator,Type,Status,Detections,Total Vendors,Last Scanned",
        ...filteredResults.map(r => 
          `${r.indicator},${r.type},${r.status},${r.detections},${r.totalVendors},${r.lastScanned}`
        )
      ].join("\n");
      
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `threatscan-results-${Date.now()}.csv`;
      a.click();
    } else {
      const json = JSON.stringify(filteredResults, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `threatscan-results-${Date.now()}.json`;
      a.click();
    }
  };

  const filteredResults = activeFilter === "all" 
    ? results 
    : results.filter(r => r.status === activeFilter);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">ThreatScanWithVARSHA</h1>
                <p className="text-sm text-muted-foreground">Batch IOC Analysis Platform</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <SubmissionForm onSubmit={handleSubmit} isLoading={isScanning} />

          {results.length > 0 && (
            <div className="space-y-4">
              <FilterBar
                totalResults={filteredResults.length}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                onExport={handleExport}
              />
              <ResultsTable results={filteredResults} onViewDetails={handleViewDetails} />
            </div>
          )}

          {results.length === 0 && !isScanning && (
            <div className="text-center py-12">
              <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No scans yet</h3>
              <p className="text-muted-foreground">
                Submit hashes or IP addresses above to begin threat analysis
              </p>
            </div>
          )}
        </div>
      </main>

      <ResultDetailsDialog
        result={selectedResult}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
    </div>
  );
}
