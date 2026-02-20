import { Request, Response, NextFunction } from "express";
import { Role } from "../types/role";


export function authorizeRoles(...allowedRoles: Role[]) {
    return (req: Request, res: Response, next: NextFunction) =>{

            if(!req.user){
                return res.status(403).json({message: "Not authenticated"})
            }

            const userRole = req.user.role;

            if(!allowedRoles.includes(userRole)){
                return res.status(403).json({message: "User not permissions"})
            }

            next();
    }
}