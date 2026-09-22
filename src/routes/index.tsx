import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";

import { STATUSES, type Status } from "@/api/tickets";
import { PriorityBadge, StatusBadge } from "@/components/Badges";
import { ErrorNotice, Loading, Page, formatDate } from "@/components/Layout";
import { ticketsQuery } from "@/hooks/useTickets";

type TicketSearch = { status?: Status };

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "All tickets — Support Ticket Tracker" },
      {
        name: "description",
        content: "Browse support tickets, filter them by status and open any ticket for details.",
      },
      { property: "og:title", content: "All tickets — Support Ticket Tracker" },
      {
        property: "og:description",
        content: "Browse support tickets, filter them by status and open any ticket for details.",
      },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): TicketSearch => {
    const status = search["status"];
    return STATUSES.includes(status as Status) ? { status: status as Status } : {};
  },
  component: TicketsPage,
});

function TicketsPage() {
  const { status } = Route.useSearch();
  const navigate = useNavigate({ from: "/" });
  const { data: tickets, isPending, error } = useQuery(ticketsQuery(status));

  return (
    <Page>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Tickets</h1>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          Filter
          <select
            value={status ?? "All"}
            onChange={(event) => {
              const value = event.target.value;
              navigate({
                search: value === "All" ? {} : { status: value as Status },
              });
            }}
            className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900"
          >
            <option value="All">All</option>
            {STATUSES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      {isPending ? <Loading label="Loading tickets..." /> : null}
      {error ? <ErrorNotice error={error} /> : null}

      {tickets ? (
        tickets.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            No tickets yet. Create your first one.
          </p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Priority</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link
                        to="/tickets/$id"
                        params={{ id: ticket.id }}
                        className="font-medium text-slate-900 underline-offset-2 hover:underline"
                      >
                        {ticket.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <PriorityBadge priority={ticket.priority} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(ticket.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : null}
    </Page>
  );
}
