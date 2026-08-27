import { Router } from "express";
import {create, list, getById, update, remove, assignTicket} from "../controllers/ticket.controller"
import { authMiddleware } from "../middlewares/auth.middleware";
import { Validate } from "../middlewares/validate.middleware";
import { createTicketSchema, updateTicketSchemaUser, updateTicketSchemaAgent, updateTicketSchemaAdmin, ticketIdParamSchema} from "../validators/ticket.schema";
import { authorizeRoles } from "../middlewares/role.middleware";

const router = Router();

router.post("/create", authMiddleware, Validate(createTicketSchema), create);
router.get("/list", authMiddleware, list);
router.get("/:id", authMiddleware, Validate(ticketIdParamSchema, "params"), getById);
router.put("/:id", authMiddleware, Validate(ticketIdParamSchema, "params"), update);
router.delete("/:id", authMiddleware, Validate(ticketIdParamSchema, "params"), remove);
router.patch("/:id/assign", authMiddleware, authorizeRoles("admin"), assignTicket);

export default router;