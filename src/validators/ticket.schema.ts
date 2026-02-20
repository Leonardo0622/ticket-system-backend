import { z } from "zod";

export const createTicketSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  priority: z.enum(["low", "medium", "high"]).optional(),
  assignedTo: z.string().optional().nullable() // 👈 corregido
});

export const updateTicketSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  status: z.enum(["open", "in-progress", "closed"]).optional(), // 👈 corregido
  priority: z.enum(["low", "medium", "high"]).optional(),
  assignedTo: z.string().nullable().optional() // 👈 corregido
});

export const ticketIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId") // 👈 más robusto
});
