import { Request, Response } from "express";
import { registerUser, loginUser, getAllUsers, updateUser, deleteUser } from "../services/auth.service";

function sanitizeError(error: any): string {
    if (error.message === "User already exists" ||
        error.message === "Invalid credentials" ||
        error.message === "User not found") {
        return error.message;
    }
    return "Internal server error";
}

export async function register(req: Request, res: Response) {

    try {

        const {name, email, password} = req.body;
        const user = await registerUser(name, email, password)
        res.status(201).json(user);

    } catch (error: any) {
        if (error.message === "User already exists") {
            return res.status(409).json({ message: error.message });
        }
        res.status(500).json({message: "Internal server error"})
    }
}


export async function listUsers(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const users = await getAllUsers();
    res.json({ users });
  } catch (error: any) {
    res.status(500).json({ message: "Internal server error" });
  }
}


export async function login (req: Request, res: Response){

    try {

        const {email, password} =  req.body;
        const data = await loginUser(email, password);

        res.cookie("token", data.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000,
            path: "/"
        });

        res.json({ user: data.user });

    } catch (error : any) {
        res.status(401).json({message: "Invalid credentials"})
    }
}


export async function me(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { User } = await import("../models/User.model");
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user });
  } catch (error: any) {
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function logout(_req: Request, res: Response) {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/"
    });
    res.json({ message: "Logged out successfully" });
}


// Update user
export async function updateUserController(req: Request, res: Response) {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { id } = req.params;
    const { name, email, role } = req.body;

    const updates: { name?: string; email?: string; role?: string } = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    if (role !== undefined) updates.role = role;

    const updatedUser = await updateUser(id, updates);
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);
  } catch (error: any) {
    res.status(500).json({ message: "Internal server error" });
  }
}


// Delete user
export async function deleteUserController(req: Request, res: Response) {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { id } = req.params;
    await deleteUser(id);

    res.json({ message: "User deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: "Internal server error" });
  }
}
