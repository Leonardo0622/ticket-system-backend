import { Router } from "express";
import {create, list, getById, update, remove, assignTicket} from "../controllers/ticket.controller"
import { authMiddleware } from "../middlewares/auth.middleware";
import { Validate } from "../middlewares/validate.middleware";
import { createTicketSchema, updateTicketSchema, ticketIdParamSchema} from "../validators/ticket.schema";
import { authorizeRoles } from "../middlewares/role.middleware";

const router = Router();

// Create ticket
router.post("/create",authMiddleware,Validate(createTicketSchema),create);
// list ticket
router.get("/list",authMiddleware,list)
// Get by id
router.get("/:id",authMiddleware,Validate(ticketIdParamSchema, "params"),getById);
// Update ticket
router.put("/:id",authMiddleware,Validate(ticketIdParamSchema, "params"),Validate(updateTicketSchema),update);
// Remove/delete ticket
router.delete("/:id", authMiddleware,Validate(ticketIdParamSchema, "params"), remove);
// assign ticket to agent
router.patch("/:id/assign",authMiddleware,authorizeRoles("admin"), assignTicket)

export default router;