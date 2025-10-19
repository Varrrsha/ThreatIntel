import { Badge } from "@/components/ui/badge";
import { ShieldAlert, ShieldCheck, ShieldQuestion, AlertTriangle } from "lucide-react";

export type ThreatStatus = "malicious" | "suspicious" | "clean" | "unknown";

interface StatusBadgeProps {
  status: ThreatStatus;
  compact?: boolean;
}

const statusConfig = {
  malicious: {
    label: "Malicious",
    icon: ShieldAlert,
    className: "bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20",
  },
  suspicious: {
    label: "Suspicious",
    icon: AlertTriangle,
    className: "bg-warning/10 text-warning hover:bg-warning/20 border-warning/20",
  },
  clean: {
    label: "Clean",
    icon: ShieldCheck,
    className: "bg-success/10 text-success hover:bg-success/20 border-success/20",
  },
  unknown: {
    label: "Unknown",
    icon: ShieldQuestion,
    className: "bg-info/10 text-info hover:bg-info/20 border-info/20",
  },
};

export function StatusBadge({ status, compact = false }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={config.className} data-testid={`badge-status-${status}`}>
      <Icon className="h-3 w-3 mr-1" />
      {!compact && config.label}
    </Badge>
  );
}
