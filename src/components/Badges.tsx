import type { Priority, Status } from "@/api/tickets";

const priorityStyles: Record<Priority, string> = {
  Low: "bg-slate-100 text-slate-700 ring-slate-200",
  Medium: "bg-amber-100 text-amber-800 ring-amber-200",
  High: "bg-rose-100 text-rose-800 ring-rose-200",
};

const statusStyles: Record<Status, string> = {
  Open: "bg-blue-100 text-blue-800 ring-blue-200",
  "In Progress": "bg-violet-100 text-violet-800 ring-violet-200",
  Resolved: "bg-emerald-100 text-emerald-800 ring-emerald-200",
};

const base =
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset";

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <span className={`${base} ${priorityStyles[priority]}`}>{priority}</span>;
}

export function StatusBadge({ status }: { status: Status }) {
  return <span className={`${base} ${statusStyles[status]}`}>{status}</span>;
}
