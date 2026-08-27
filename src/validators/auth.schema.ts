import {z} from "zod";

export const registerSchema = z.object({

    name: z.string().min(3, "Name too short").max(100),
    email: z.string().email("Invalid Email").max(255),
    password: z.string().min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")

}).strict();


export const loginSchema = z.object({

    email: z.string().email("Invalid Email"),
    password: z.string().min(1, "Password is required")

}).strict();


export const updateUserSchema = z.object({
    name: z.string().min(3).max(100).optional(),
    email: z.string().email().max(255).optional(),
    role: z.enum(["admin", "agent", "user"]).optional()
}).strict();