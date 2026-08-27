import { z } from "zod";

export const createTicketSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  description: z.string().min(10, "Description must be at least 10 characters").max(2000),
  priority: z.enum(["low", "medium", "high"]).optional(),
  assignedTo: z.string().optional().nullable()
}).strict();

export const updateTicketSchemaUser = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().min(10).max(2000).optional()
}).strict();

export const updateTicketSchemaAgent = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().min(10).max(2000).optional(),
  status: z.enum(["open", "in_progress", "closed"]).optional()
}).strict();

export const updateTicketSchemaAdmin = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().min(10).max(2000).optional(),
  status: z.enum(["open", "in_progress", "closed"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  assignedTo: z.string().nullable().optional()
}).strict();

export const ticketIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId")
});
