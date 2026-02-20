import {z} from "zod";

export const registerSchema = z.object({

    name: z.string().min(3, "Name too short"),
    email: z.string().email("Invalid Email"),
    password: z.string().min(6,"Password too short"),
    rol: z.enum(["admin", "agent", "user"]).optional()

});


export const loginSchema = z.object({

    email: z.string().email("Invalid Email"),
    password: z.string().min(6, "Password too short")

});