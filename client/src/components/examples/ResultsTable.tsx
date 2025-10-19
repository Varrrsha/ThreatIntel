import { ResultsTable, type ScanResult } from "../ResultsTable";

const mockResults: ScanResult[] = [
  {
    id: "1",
    indicator: "44d88612fea8a8f36de82e1278abb02f",
    type: "hash",
    status: "malicious",
    detections: 45,
    totalVendors: 67,
    lastScanned: "2025-10-14T10:30:00Z",
  },
  {
    id: "2",
    indicator: "192.168.1.100",
    type: "ip",
    status: "clean",
    detections: 0,
    totalVendors: 67,
    lastScanned: "2025-10-14T10:29:00Z",
  },
  {
    id: "3",
    indicator: "5d41402abc4b2a76b9719d911017c592",
    type: "hash",
    status: "suspicious",
    detections: 8,
    totalVendors: 67,
    lastScanned: "2025-10-14T10:28:00Z",
  },
  {
    id: "4",
    indicator: "10.0.0.1",
    type: "ip",
    status: "unknown",
    detections: 0,
    totalVendors: 67,
    lastScanned: "2025-10-14T10:27:00Z",
  },
];

export default function ResultsTableExample() {
  return (
    <div className="p-8 max-w-6xl">
      <ResultsTable 
        results={mockResults}
        onViewDetails={(result) => console.log("View details:", result)}
      />
    </div>
  );
}
