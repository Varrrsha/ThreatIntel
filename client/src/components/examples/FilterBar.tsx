import { useState } from "react";
import { FilterBar } from "../FilterBar";
import type { ThreatStatus } from "../StatusBadge";

export default function FilterBarExample() {
  const [filter, setFilter] = useState<ThreatStatus | "all">("all");

  return (
    <div className="p-8">
      <FilterBar
        totalResults={42}
        activeFilter={filter}
        onFilterChange={setFilter}
        onExport={(format) => console.log("Export as:", format)}
      />
    </div>
  );
}
