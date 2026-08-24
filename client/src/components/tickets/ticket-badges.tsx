import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { TicketPriority, TicketStatus } from "./types";

const statusConfig: Record<
  TicketStatus,
  { label: string; className: string }
> = {
  open: {
    label: "Pendiente",
    className:
      "border-slate-400/30 bg-slate-500/10 text-slate-600 dark:text-slate-300"
  },
  in_progress: {
    label: "En progreso",
    className:
      "border-blue-500/25 bg-blue-500/10 text-blue-700 dark:text-blue-400"
  },
  closed: {
    label: "Resuelto",
    className:
      "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
  }
};

const priorityConfig: Record<
  TicketPriority,
  { label: string; className: string }
> = {
  high: {
    label: "Alta",
    className: "border-red-500/25 bg-red-500/10 text-red-700 dark:text-red-400"
  },
  medium: {
    label: "Media",
    className:
      "border-orange-500/25 bg-orange-500/10 text-orange-700 dark:text-orange-400"
  },
  low: {
    label: "Baja",
    className:
      "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
  }
};

export function statusLabel(status: TicketStatus): string {
  return statusConfig[status]?.label ?? status;
}

export function priorityLabel(priority: TicketPriority): string {
  return priorityConfig[priority]?.label ?? priority;
}

export function StatusBadge({ status }: { status: TicketStatus }) {
  const config = statusConfig[status];
  if (!config) return null;
  return (
    <Badge variant="outline" className={cn(config.className)}>
      {config.label}
    </Badge>
  );
}

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  const config = priorityConfig[priority];
  if (!config) return null;
  return (
    <Badge variant="outline" className={cn(config.className)}>
      {config.label}
    </Badge>
  );
}
