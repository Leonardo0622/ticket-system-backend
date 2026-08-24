export type TicketStatus = "open" | "in_progress" | "closed";
export type TicketPriority = "low" | "medium" | "high";

export interface Ticket {
  _id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdBy: string;
  assignedTo?: string | null;
  createdAt?: string;
}

export interface UserOption {
  _id: string;
  name: string;
  email: string;
  role: string;
}
