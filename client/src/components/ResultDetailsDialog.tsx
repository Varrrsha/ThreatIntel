import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { StatusBadge, type ThreatStatus } from "./StatusBadge";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import type { ScanResult } from "./ResultsTable";

interface VendorDetection {
  vendor: string;
  detected: boolean;
  category?: string;
  result?: string;
}

interface ResultDetailsDialogProps {
  result: ScanResult | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ResultDetailsDialog({ result, open, onOpenChange }: ResultDetailsDialogProps) {
  if (!result) return null;

  const vendorResults: VendorDetection[] = (result as any).vendorResults || [];
  
  const detectedVendors = vendorResults.filter(v => v.detected);
  const cleanVendors = vendorResults.filter(v => !v.detected);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="dialog-result-details">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="font-mono text-base">{result.indicator}</span>
            <StatusBadge status={result.status} />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">Detections</div>
              <div className="text-2xl font-semibold mt-1">
                {result.detections}/{result.totalVendors}
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">Type</div>
              <div className="text-2xl font-semibold mt-1 capitalize">{result.type}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">Last Scanned</div>
              <div className="text-sm font-medium mt-1">
                {new Date(result.lastScanned).toLocaleString()}
              </div>
            </Card>
          </div>

          <Tabs defaultValue="vendors" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="vendors" data-testid="tab-vendors">Vendors</TabsTrigger>
              <TabsTrigger value="timeline" data-testid="tab-timeline">Timeline</TabsTrigger>
              <TabsTrigger value="context" data-testid="tab-context">Threat Context</TabsTrigger>
            </TabsList>

            <TabsContent value="vendors" className="space-y-4 mt-4">
              {vendorResults.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No vendor results available
                </div>
              )}

              {detectedVendors.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-destructive" />
                    Detected ({detectedVendors.length})
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {detectedVendors.map((vendor, idx) => (
                      <Card key={idx} className="p-3 hover-elevate">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-medium text-sm">{vendor.vendor}</div>
                            {vendor.category && (
                              <Badge variant="outline" className="mt-1 text-xs">
                                {vendor.category}
                              </Badge>
                            )}
                          </div>
                          <XCircle className="h-4 w-4 text-destructive" />
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {cleanVendors.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    Clean ({cleanVendors.length})
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {cleanVendors.map((vendor, idx) => (
                      <Card key={idx} className="p-3 hover-elevate">
                        <div className="flex items-start justify-between">
                          <div className="font-medium text-sm">{vendor.vendor}</div>
                          <CheckCircle2 className="h-4 w-4 text-success" />
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="timeline" className="space-y-3 mt-4">
              {vendorResults.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No timeline data available
                </div>
              ) : (
                <div className="space-y-3">
                  {vendorResults.slice(0, 10).map((vendor, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-2 h-2 rounded-full ${vendor.detected ? 'bg-destructive' : 'bg-success'}`} />
                        {idx < 9 && <div className="w-px h-full bg-border mt-1" />}
                      </div>
                      <Card className="flex-1 p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-sm">{vendor.vendor}</div>
                            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(result.lastScanned).toLocaleString()}
                            </div>
                          </div>
                          <Badge variant={vendor.detected ? "destructive" : "outline"}>
                            {vendor.detected ? "Detected" : "Clean"}
                          </Badge>
                        </div>
                      </Card>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="context" className="mt-4">
              <Card className="p-4">
                <h3 className="font-semibold mb-3">Threat Intelligence</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Risk Level:</span>
                    <span className="ml-2 font-medium capitalize">{result.status}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Detection Rate:</span>
                    <span className="ml-2 font-medium">
                      {result.totalVendors > 0 
                        ? `${((result.detections / result.totalVendors) * 100).toFixed(1)}%`
                        : "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Last Analysis:</span>
                    <span className="ml-2 font-medium">
                      {new Date(result.lastScanned).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Community Score:</span>
                    <span className="ml-2 font-medium">
                      {result.detections > 20 ? "High Risk" : result.detections > 5 ? "Medium Risk" : result.detections > 0 ? "Low Risk" : "No Threats"}
                    </span>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
