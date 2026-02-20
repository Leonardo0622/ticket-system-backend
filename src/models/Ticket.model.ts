import { Schema, model, Types } from "mongoose"


export interface ITicket {
    title: string,
    description: string,
    status: "open" | "in_progress" | "closed",
    priority: "low" | "medium" | "high",
    createdBy: Types.ObjectId;
    assignedTo?: Types.ObjectId | null;
}

const TicketSchema = new Schema<ITicket>(
    {
        title: {type: String, required: true},
        description : {type: String, required: true},
        status: {type: String, enum: ["open" , "in_progress" , "closed"], default: "open"},
        priority: {type: String, enum: ["low" , "medium" , "high"], default:"low"},
        createdBy:{type: Schema.ObjectId, ref: "User", required: true},
        assignedTo: {type: Schema.ObjectId, ref: "User", default: null}

    },
    {timestamps: true}
);

export const Ticket = model("Ticket", TicketSchema);