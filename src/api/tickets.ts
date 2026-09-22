// Small fetch wrapper around the FastAPI backend.
// The base URL comes from VITE_API_URL (see .env.example).

export const API_URL = import.meta.env["VITE_API_URL"] ?? "http://localhost:8000";

export const PRIORITIES = ["Low", "Medium", "High"] as const;
export const STATUSES = ["Open", "In Progress", "Resolved"] as const;

export type Priority = (typeof PRIORITIES)[number];
export type Status = (typeof STATUSES)[number];

export type Ticket = {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  created_at: string;
  updated_at: string;
};

export type NewTicket = {
  title: string;
  description: string;
  priority: Priority;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...init,
    });
  } catch {
    throw new ApiError(
      `Could not reach the API at ${API_URL}. Make sure the FastAPI server is running.`,
      0,
    );
  }

  if (!response.ok) {
    throw new ApiError(await readErrorMessage(response), response.status);
  }

  return (await response.json()) as T;
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body = await response.json();
    const detail = body?.detail;

    if (typeof detail === "string") return detail;
    // FastAPI validation errors come back as a list of issues.
    if (Array.isArray(detail)) {
      return detail.map((issue) => issue?.msg ?? "Invalid value").join(", ");
    }
  } catch {
    // fall through to the generic message
  }

  return `Request failed with status ${response.status}`;
}

export function listTickets(status?: Status): Promise<Ticket[]> {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  return request<Ticket[]>(`/api/tickets${query}`);
}

export function getTicket(id: string): Promise<Ticket> {
  return request<Ticket>(`/api/tickets/${id}`);
}

export function createTicket(ticket: NewTicket): Promise<Ticket> {
  return request<Ticket>("/api/tickets", {
    method: "POST",
    body: JSON.stringify(ticket),
  });
}

export function updateTicketStatus(id: string, status: Status): Promise<Ticket> {
  return request<Ticket>(`/api/tickets/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function updateTicketPriority(id: string, priority: Priority): Promise<Ticket> {
  return request<Ticket>(`/api/tickets/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ priority }),
  });
}

