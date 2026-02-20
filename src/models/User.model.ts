import { Schema, model } from "mongoose";
import { Role } from "../types/role";

export interface IUser {
  name: string;
  email: string;
  password: string;
  role: Role;
}


const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "agent", "user"], default: "user" },
  },
  { timestamps: true }
);

export const User = model<IUser>("User", UserSchema);
export type IUserResponse = Omit<IUser, "password">;
