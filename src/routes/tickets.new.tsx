import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { PRIORITIES, type Priority } from "@/api/tickets";
import { Page } from "@/components/Layout";
import { useCreateTicket } from "@/hooks/useTickets";

export const Route = createFileRoute("/tickets/new")({
  head: () => ({
    meta: [
      { title: "Create ticket — Support Ticket Tracker" },
      {
        name: "description",
        content: "Raise a new support ticket with a title, description and priority.",
      },
      { property: "og:title", content: "Create ticket — Support Ticket Tracker" },
      {
        property: "og:description",
        content: "Raise a new support ticket with a title, description and priority.",
      },
    ],
  }),
  component: CreateTicketPage,
});

type Errors = { title?: string; description?: string };

function CreateTicketPage() {
  const navigate = useNavigate();
  const createTicket = useCreateTicket();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("Medium");
  const [errors, setErrors] = useState<Errors>({});

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const nextErrors: Errors = {};
    if (!title.trim()) nextErrors.title = "Title is required.";
    if (!description.trim()) nextErrors.description = "Description is required.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    createTicket.mutate(
      { title: title.trim(), description: description.trim(), priority },
      {
        onSuccess: (ticket) => {
          toast.success("Ticket created", { description: ticket.title });
          navigate({ to: "/tickets/$id", params: { id: ticket.id } });
        },
        onError: (error) => {
          toast.error("Couldn't create the ticket", {
            description: error instanceof Error ? error.message : "Please try again.",
          });
        },
      },
    );
  }

  return (
    <Page>
      <Link to="/" className="text-sm text-slate-500 hover:text-slate-900">
        ← Back to tickets
      </Link>

      <h1 className="mt-4 mb-6 text-xl font-semibold">Create ticket</h1>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label htmlFor="title" className="mb-1.5 block text-sm font-medium">
            Title
          </label>
          <input
            id="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Short summary of the issue"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
          />
          {errors.title ? <p className="mt-1.5 text-xs text-rose-600">{errors.title}</p> : null}
        </div>

        <div>
          <label htmlFor="description" className="mb-1.5 block text-sm font-medium">
            Description
          </label>
          <textarea
            id="description"
            rows={5}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="What happened, and what did you expect?"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
          />
          {errors.description ? (
            <p className="mt-1.5 text-xs text-rose-600">{errors.description}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="priority" className="mb-1.5 block text-sm font-medium">
            Priority
          </label>
          <div className="flex gap-2">
            {PRIORITIES.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setPriority(option)}
                className={`rounded-lg border px-3.5 py-2 text-sm font-medium transition-all ${
                  priority === option
                    ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                    : "border-slate-300 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-900"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-xs text-slate-500">New tickets start with the status Open.</p>
        </div>

        <button
          type="submit"
          disabled={createTicket.isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-slate-700 active:scale-95 disabled:opacity-60 disabled:active:scale-100"
        >
          {createTicket.isPending ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          ) : null}
          {createTicket.isPending ? "Creating..." : "Create Ticket"}
        </button>
      </form>
    </Page>
  );
}
