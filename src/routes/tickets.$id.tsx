import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

import { PRIORITIES, STATUSES, type Priority, type Status } from "@/api/tickets";
import { PriorityBadge } from "@/components/Badges";
import { ErrorNotice, Loading, Page, formatDate } from "@/components/Layout";
import { ticketQuery, useUpdatePriority, useUpdateStatus } from "@/hooks/useTickets";


export const Route = createFileRoute("/tickets/$id")({
  head: () => ({
    meta: [
      { title: "Ticket details — Support Ticket Tracker" },
      {
        name: "description",
        content: "View a support ticket's description and priority, and update its status.",
      },
      { property: "og:title", content: "Ticket details — Support Ticket Tracker" },
      {
        property: "og:description",
        content: "View a support ticket's description and priority, and update its status.",
      },
    ],
  }),
  component: TicketDetailsPage,
});

function TicketDetailsPage() {
  const { id } = Route.useParams();
  const { data: ticket, isPending, error } = useQuery(ticketQuery(id));
  const updateStatus = useUpdateStatus(id);

  return (
    <Page>
      <Link to="/" className="text-sm text-slate-500 hover:text-slate-900">
        ← Back to tickets
      </Link>

      {isPending ? <Loading label="Loading ticket..." /> : null}
      {error ? (
        <div className="mt-4">
          <ErrorNotice error={error} />
        </div>
      ) : null}

      {ticket ? (
        <article className="mt-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{ticket.title}</h1>
            <PriorityBadge priority={ticket.priority} />
          </div>

          <dl className="mt-6 space-y-6 text-sm">
            <div>
              <dt className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">Description</dt>
              <dd className="whitespace-pre-wrap leading-relaxed text-slate-900">{ticket.description}</dd>
            </div>

            <div>
              <dt className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">Status</dt>
              <dd className="flex items-center gap-3">
                <select
                  value={ticket.status}
                  disabled={updateStatus.isPending}
                  onChange={(event) =>
                    updateStatus.mutate(event.target.value as Status, {
                      onSuccess: (updated) =>
                        toast.success("Status updated", {
                          description: `"${updated.title}" is now ${updated.status}.`,
                        }),
                      onError: (error) =>
                        toast.error("Couldn't update the status", {
                          description: error instanceof Error ? error.message : "Please try again.",
                        }),
                    })
                  }
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm transition focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 disabled:opacity-60"
                >
                  {STATUSES.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {updateStatus.isPending ? (
                  <span className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
                    Saving...
                  </span>
                ) : null}
              </dd>
            </div>

            <div className="grid gap-6 border-t border-slate-100 pt-5 sm:grid-cols-2">
              <div>
                <dt className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">Created</dt>
                <dd>{formatDate(ticket.created_at)}</dd>
              </div>
              <div>
                <dt className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">Updated</dt>
                <dd>{formatDate(ticket.updated_at)}</dd>
              </div>
            </div>
          </dl>

          {updateStatus.error ? (
            <div className="mt-6">
              <ErrorNotice error={updateStatus.error} />
            </div>
          ) : null}
        </article>
      ) : null}
    </Page>
  );
}
