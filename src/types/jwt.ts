import { Role } from "./role";

export interface JwtUserPayload {
  id: string;
  role: Role;
}
