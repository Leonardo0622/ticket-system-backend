import { Request, Response } from "express";
import { createTicket, listTickets, getTicketById, updateTicket, deleteTicket, assignTicketToAgent } from "../services/ticket.service";
import { Role } from "../types/role";


export async function create(req: Request, res: Response) {

    try {
        
        if(!req.user){
             return res.status(401).json({message: "Unauthorized"})
        }

        const {title, description, priority = "low", assignedTo} = req.body;

        if (!title || !description) {
        return res.status(400).json({ message: "Missing required fields" });
        }

        const createdBy = (req.user as any).id;

        const ticket = await createTicket(
            title, 
            description, 
            priority,
            assignedTo || null,
            createdBy
        );

        res.status(201).json({ticket});

    } catch (error: any) {
        res.status(400).json({message: error.message})
        
    }
    
}


export async function list(req: Request, res: Response) {

    try {
        
        if(!req.user){
            return res.status(401).json({message: "Unauthorized"})
        }

        const {id, role} = req.user 

        const ticket = await listTickets(id, role);

        res.json({ticket});

    } catch (error: any) {
        res.status(500).json({ message: error.message });
        
    }
    
}


export async function getById(req: Request, res: Response) {

    try {
        
        if(!req.user){
            return res.status(401).json({message: "Unauthorized"})
        }

        const {id: userId, role} = req.user
        const ticketId = req.params.id;
        

        const ticket = await getTicketById(ticketId, userId, role);

        return ticket;

    } catch (error: any) {
        
        if (error.message === "Forbidden") {
        return res.status(403).json({ message: "Access denied" });
        }

        if (error.message === "Ticket not found") {
        return res.status(404).json({ message: error.message });
        }

        res.status(500).json({ message: "Server error" });
        }
    
}

export async function update(req: Request, res: Response) {
    

    try {
        
        if(!req.user){
            return res.status(401).json({message: "Unauthorized"})
        }

        const {id} = req.params;
        const {role} = req.user;
        const userId = req.user.id

        const data = req.body;

        const ticket = await updateTicket(id, userId, role, data);
        res.json(ticket)

    } catch (error: any) {
        throw error;
    }
}


export async function remove(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id: userId, role } = req.user;
    const ticketId = req.params.id; 

    await deleteTicket(ticketId, userId, role);
    res.json({ message: "Ticket deleted successfully" });

  } catch (error: any) {
    res.status(403).json({ message: error.message });
  }
}


export async function assignTicket(req: Request, res: Response) {

    try {
        const {id} = req.params;
        const {agentId} = req.body;

        if(!agentId){
            return res.status(400).json({message: "agentId is required"})
        }

        const ticekt = await assignTicketToAgent(id, agentId);
        
        res.json(ticekt);
                

    } catch (error: any) {
        return res.status(400).json({message: error.message})
        
    }
    
}