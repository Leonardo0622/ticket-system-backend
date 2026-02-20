import { Types } from "mongoose";
import { Ticket, ITicket } from "../models/Ticket.model";
import { Role } from "../types/role";
import { User } from "../models/User.model";



// Function for creating ticket

export async function createTicket(title: string, description: string, priority: "low" | "medium" | "high",assignedTo: string | null, createdBy: string): Promise<ITicket> {

    try {
        
        const ticket = await Ticket.create({
            title,
            description,
            priority,
            assignedTo: assignedTo || null,
            createdBy,
        });

        return ticket;

    } catch (error) {
        throw new Error("Error Creating Ticket")
        
    }
    
}


// Function list Ticket

export async function listTickets(userId: string, rol: Role): Promise<ITicket[]> {

    try {
        
        if(rol === "user"){
            return await Ticket.find({createdBy: new Types.ObjectId(userId)})
        }

        if(rol === "agent"){
            return await Ticket.find({assignedTo: new Types.ObjectId(userId)})
        }

        if(rol === "admin"){
            return await Ticket.find()
        }

        throw new Error("Invalid role");

    } catch (error) {
        throw new Error("Error fetching tickets")
        
    }
    
}

export async function getTicketById(ticketId:string, userId: string, role: Role): Promise <ITicket | null> {

    try {
        
        const ticket = await Ticket.findById(ticketId)
        .populate("createdBy", "name email")
        .populate("assignedTo", "name email")

        if(!ticket){
            throw new Error("Ticekt not found");
        }

        if(role === "admin"){
            return ticket;
        }

        if(role === "user" && ticket.createdBy.toString() === userId){
            return ticket;
        }

        if(role === "agent" && ticket.assignedTo?.toString() === userId){
            return ticket
        }

        throw new Error("Forbidden")

    } catch (error) {
        throw new Error("Error fetching by id")
    }
    
}


export async function updateTicket(ticketId: string, userId: string, role: Role, data: Partial<ITicket>): Promise<ITicket> {

    try {
        
     const ticket = await Ticket.findById(ticketId);

     if(!ticket){
        throw new Error("Ticekt not found");
     }

        // 🔐 PERMISOS
     if (role === "user") {
        if (ticket.createdBy.toString() !== userId) {
        throw new Error("You do not have permission to update this ticket");
        }
    }

     if (role === "agent") {
        if (
        !ticket.assignedTo ||
        ticket.assignedTo.toString() !== userId
        ) {
        throw new Error("You do not have permission to update this ticket");
        }
    }
      Object.assign(ticket, data);
        await ticket.save();

        return ticket;

    } catch (error) {
        throw error;
        
    }
    
}


export async function deleteTicket(ticketId: string,userId: string, role: Role): Promise<void> {

    try {
        
        const ticket = await Ticket.findById(ticketId);
        console.log(ticket)

        if (!ticket) {
            throw new Error("Ticket not found");
        }

        
        if (role === "user") {
            if (ticket.createdBy.toString() !== userId) {
            throw new Error("You do not have permission to delete this ticket");
            }
        }

        if (role === "agent") {
            throw new Error("Agents cannot delete tickets");
        }


        await ticket.deleteOne();

    } catch (error) {
        throw error;
    }
    
}


export async function assignTicketToAgent(ticketId: string, agentId: string) {

    if(!Types.ObjectId.isValid(ticketId) || !Types.ObjectId.isValid(agentId)){
        throw new Error("Invalid Id ")
    }

    const ticket = await Ticket.findById(ticketId);
    if(!ticket){
        throw new Error("Ticekt not found")
    }

    const agent = await User.findById(agentId);
    if(!agent || agent.role !== "agent"){
        throw new Error("User is not Agent")
    }

    // Asignamos el ticket al agent
    ticket.assignedTo = agent._id;
    ticket.status = "in_progress"

    await ticket.save()
    return ticket;
    
}