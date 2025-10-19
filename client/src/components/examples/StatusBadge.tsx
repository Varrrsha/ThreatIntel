import { StatusBadge } from "../StatusBadge";

export default function StatusBadgeExample() {
  return (
    <div className="p-8 flex gap-4 flex-wrap">
      <StatusBadge status="malicious" />
      <StatusBadge status="suspicious" />
      <StatusBadge status="clean" />
      <StatusBadge status="unknown" />
    </div>
  );
}
