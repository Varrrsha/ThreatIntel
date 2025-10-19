import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusBadge, type ThreatStatus } from "./StatusBadge";
import { ArrowUpDown, Eye } from "lucide-react";
import { Card } from "@/components/ui/card";

export interface ScanResult {
  id: string;
  indicator: string;
  type: "hash" | "ip";
  status: ThreatStatus;
  detections: number;
  totalVendors: number;
  lastScanned: string;
}

interface ResultsTableProps {
  results: ScanResult[];
  onViewDetails: (result: ScanResult) => void;
}

type SortField = "indicator" | "status" | "detections";
type SortDirection = "asc" | "desc";

export function ResultsTable({ results, onViewDetails }: ResultsTableProps) {
  const [sortField, setSortField] = useState<SortField>("detections");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sortedResults = [...results].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case "indicator":
        comparison = a.indicator.localeCompare(b.indicator);
        break;
      case "status":
        const statusOrder = { malicious: 0, suspicious: 1, unknown: 2, clean: 3 };
        comparison = statusOrder[a.status] - statusOrder[b.status];
        break;
      case "detections":
        comparison = a.detections - b.detections;
        break;
    }

    return sortDirection === "asc" ? comparison : -comparison;
  });

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleSort(field)}
      className="h-8 -ml-3 font-semibold"
      data-testid={`button-sort-${field}`}
    >
      {children}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );

  return (
    <Card>
      <div className="relative overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[45%]">
                <SortButton field="indicator">Indicator</SortButton>
              </TableHead>
              <TableHead className="w-[15%]">
                <SortButton field="status">Status</SortButton>
              </TableHead>
              <TableHead className="w-[20%]">
                <SortButton field="detections">Detections</SortButton>
              </TableHead>
              <TableHead className="w-[20%]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedResults.map((result) => (
              <TableRow key={result.id} data-testid={`row-result-${result.id}`}>
                <TableCell className="font-mono text-sm" data-testid={`text-indicator-${result.id}`}>
                  {result.indicator}
                </TableCell>
                <TableCell>
                  <StatusBadge status={result.status} />
                </TableCell>
                <TableCell>
                  <span className="font-semibold" data-testid={`text-detections-${result.id}`}>
                    {result.detections}
                  </span>
                  <span className="text-muted-foreground">/{result.totalVendors}</span>
                  <span className="text-xs text-muted-foreground ml-2">vendors</span>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewDetails(result)}
                    data-testid={`button-details-${result.id}`}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
