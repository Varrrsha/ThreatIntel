import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ThreatStatus } from "./StatusBadge";

interface FilterBarProps {
  totalResults: number;
  activeFilter: ThreatStatus | "all";
  onFilterChange: (filter: ThreatStatus | "all") => void;
  onExport: (format: "csv" | "json") => void;
}

export function FilterBar({
  totalResults,
  activeFilter,
  onFilterChange,
  onExport,
}: FilterBarProps) {
  const filters: Array<{ value: ThreatStatus | "all"; label: string }> = [
    { value: "all", label: "All Results" },
    { value: "malicious", label: "Malicious" },
    { value: "suspicious", label: "Suspicious" },
    { value: "clean", label: "Clean" },
    { value: "unknown", label: "Unknown" },
  ];

  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          {totalResults} {totalResults === 1 ? "result" : "results"}
        </span>
        {activeFilter !== "all" && (
          <Badge variant="outline" data-testid="badge-active-filter">
            {filters.find(f => f.value === activeFilter)?.label}
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" data-testid="button-filter">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {filters.map((filter) => (
              <DropdownMenuItem
                key={filter.value}
                onClick={() => onFilterChange(filter.value)}
                data-testid={`filter-${filter.value}`}
              >
                {filter.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" data-testid="button-export">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onExport("csv")} data-testid="export-csv">
              Export as CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExport("json")} data-testid="export-json">
              Export as JSON
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
