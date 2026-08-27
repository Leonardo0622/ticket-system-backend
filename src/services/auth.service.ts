import bcrypt from "bcryptjs"
import { User, IUser, IUserResponse } from "../models/User.model"
import jwt from "jsonwebtoken"
import { Role } from "../types/role";

const revokedTokens = new Set<string>();

export function revokeToken(token: string): void {
    revokedTokens.add(token);
}

export function isTokenRevoked(token: string): boolean {
    return revokedTokens.has(token);
}

export async function registerUser(name:string, email:string, password: string): Promise<IUserResponse> {

    const userExistes = await User.findOne({email});
    if (userExistes){
        throw new Error("User already exists");
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt)

    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: "user"
    });

    const { password: _, ...userWithoutPassword } = user.toObject();

    return userWithoutPassword as IUserResponse;
}


export async function getAllUsers(): Promise<IUserResponse[]> {
  try {
    const users = await User.find().select("-password");
    return users as IUserResponse[];
  } catch (error) {
    throw new Error("Error fetching users");
  }
}


export async function loginUser(email: string, password: string) {

    const user = await User.findOne({email});

    if (!user){
        throw new Error("Invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch){
        throw new Error("Invalid credentials")
    }

    if (!process.env.JWT_SECRET) {
        throw new Error("JWT secret not configured");
    }

    const token = jwt.sign (

        {
            id: user._id,
            role: user.role
        },
        process.env.JWT_SECRET as string,
        {
            expiresIn: "1h"
        }

    )

    const { password: _, ...userWithoutPassword } = user.toObject();

    return {
        token,
        user: userWithoutPassword
    };

}


export async function updateUser(userId: string, updates: { name?: string; email?: string; role?: string }): Promise<IUserResponse | null> {
  try {
    const user = await User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true }).select("-password");
    return user as IUserResponse | null;
  } catch (error) {
    throw new Error("Error updating user");
  }
}


export async function deleteUser(userId: string): Promise<void> {
  try {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      throw new Error("User not found");
    }
  } catch (error) {
    throw new Error("Error deleting user");
  }
}


