import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function Page({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link to="/" className="text-lg font-semibold tracking-tight">
            Support Ticket Tracker
          </Link>
          <Link
            to="/tickets/new"
            className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-slate-700"
          >
            + Create Ticket
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
    </div>
  );
}

export function ErrorNotice({ error }: { error: unknown }) {
  const message = error instanceof Error ? error.message : "Something went wrong.";

  return (
    <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
      {message}
    </div>
  );
}

export function Loading({ label = "Loading..." }: { label?: string }) {
  return <p className="text-sm text-slate-500">{label}</p>;
}

export function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
