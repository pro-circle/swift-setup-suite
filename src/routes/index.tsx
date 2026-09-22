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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tickets</h1>
          <p className="mt-1 text-sm text-slate-500">
            {tickets ? `${tickets.length} ${tickets.length === 1 ? "ticket" : "tickets"}` : "Your support tickets"}
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          {(["All", ...STATUSES] as const).map((option) => {
            const active = option === "All" ? !status : status === option;
            return (
              <button
                key={option}
                onClick={() =>
                  navigate({ search: option === "All" ? {} : { status: option as Status } })
                }
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>

      {isPending ? <Loading label="Loading tickets..." /> : null}
      {error ? <ErrorNotice error={error} /> : null}

      {tickets ? (
        tickets.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl">
              📭
            </div>
            <p className="mt-4 text-sm font-medium text-slate-900">No tickets here yet</p>
            <p className="mt-1 text-sm text-slate-500">
              {status ? `Nothing with status "${status}". Try another filter or create one.` : "Create your first ticket to get started."}
            </p>
            <Link
              to="/tickets/new"
              className="mt-5 inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
            >
              + Create Ticket
            </Link>
          </div>
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
