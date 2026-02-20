import { Request, Response } from "express";
import { registerUser, loginUser, getAllUsers, updateUser, deleteUser } from "../services/auth.service";

export async function register(req: Request, res: Response) {
    
    try {

        const {name, email, password, role} = req.body;
        const user = await registerUser(name,email,password, role)
        res.status(201).json(user);

    } catch (error: any) {
        res.status(500).json({message: error.message})
    }
}


export async function listUsers(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Solo admin puede ver todos los usuarios
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const users = await getAllUsers();
    res.json({ users });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}


export async function login (req: Request, res: Response){

    try {
        
        const {email, password} =  req.body;
        const data = await loginUser(email, password);
        res.json(data)

    } catch (error : any) {
        res.status(401).json({message: error.message})
    }
}


// Update user
export async function updateUserController(req: Request, res: Response) {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { id } = req.params;
    const updates = req.body;

    const updatedUser = await updateUser(id, updates);
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
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
    res.status(500).json({ message: error.message });
  }
}
