import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JwtUserPayload } from "../types/jwt";
import { isTokenRevoked } from "../services/auth.service";


export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  let token: string | undefined;

  if (req.cookies?.token) {
    token = req.cookies.token;
  } else {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      token = authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1].trim()
        : authHeader.trim();
    }
  }

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  if (isTokenRevoked(token)) {
    return res.status(401).json({ message: "Token has been revoked" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtUserPayload;
    req.user = decoded;
    next();
  } catch (error) {
   return res.status(401).json({ message: "Invalid or expired token" });
  }
}

