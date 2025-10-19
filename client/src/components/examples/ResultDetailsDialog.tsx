import { useState } from "react";
import { ResultDetailsDialog } from "../ResultDetailsDialog";
import { Button } from "@/components/ui/button";
import type { ScanResult } from "../ResultsTable";

const mockResult: ScanResult = {
  id: "1",
  indicator: "44d88612fea8a8f36de82e1278abb02f",
  type: "hash",
  status: "malicious",
  detections: 45,
  totalVendors: 67,
  lastScanned: "2025-10-14T10:30:00Z",
};

export default function ResultDetailsDialogExample() {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-8">
      <Button onClick={() => setOpen(true)}>Open Details Dialog</Button>
      <ResultDetailsDialog
        result={mockResult}
        open={open}
        onOpenChange={setOpen}
      />
    </div>
  );
}
