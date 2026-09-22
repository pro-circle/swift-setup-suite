import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import { STATUSES, type Status } from "@/api/tickets";
import { PriorityBadge } from "@/components/Badges";
import { ErrorNotice, Loading, Page, formatDate } from "@/components/Layout";
import { ticketQuery, useUpdateStatus } from "@/hooks/useTickets";

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
        <article className="mt-4 rounded-lg border border-slate-200 bg-white p-6">
          <h1 className="text-xl font-semibold">{ticket.title}</h1>

          <dl className="mt-6 space-y-6 text-sm">
            <div>
              <dt className="mb-1 font-medium text-slate-500">Description</dt>
              <dd className="whitespace-pre-wrap text-slate-900">{ticket.description}</dd>
            </div>

            <div>
              <dt className="mb-1 font-medium text-slate-500">Priority</dt>
              <dd>
                <PriorityBadge priority={ticket.priority} />
              </dd>
            </div>

            <div>
              <dt className="mb-1 font-medium text-slate-500">Status</dt>
              <dd className="flex items-center gap-3">
                <select
                  value={ticket.status}
                  disabled={updateStatus.isPending}
                  onChange={(event) => updateStatus.mutate(event.target.value as Status)}
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm disabled:opacity-60"
                >
                  {STATUSES.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {updateStatus.isPending ? (
                  <span className="text-xs text-slate-500">Saving...</span>
                ) : null}
              </dd>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <dt className="mb-1 font-medium text-slate-500">Created</dt>
                <dd>{formatDate(ticket.created_at)}</dd>
              </div>
              <div>
                <dt className="mb-1 font-medium text-slate-500">Updated</dt>
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
