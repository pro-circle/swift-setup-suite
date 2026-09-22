import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createTicket,
  getTicket,
  listTickets,
  updateTicketStatus,
  type NewTicket,
  type Status,
} from "@/api/tickets";

export const ticketsQuery = (status?: Status) =>
  queryOptions({
    queryKey: ["tickets", status ?? "All"],
    queryFn: () => listTickets(status),
  });

export const ticketQuery = (id: string) =>
  queryOptions({
    queryKey: ["ticket", id],
    queryFn: () => getTicket(id),
  });

export function useCreateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ticket: NewTicket) => createTicket(ticket),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
}

export function useUpdateStatus(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (status: Status) => updateTicketStatus(id, status),
    onSuccess: (ticket) => {
      queryClient.setQueryData(["ticket", id], ticket);
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
}
