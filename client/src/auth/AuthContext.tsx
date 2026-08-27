import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState
} from "react";
import { api } from "../api/client";

interface AuthContextValue {
  role: string | null;
  userId: string | null;
  userName: string | null;
  login: (
    role?: string,
    userId?: string,
    userName?: string
  ) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get("/auth/me");
        if (res.data?.user) {
          const u = res.data.user;
          setRole(u.role ?? null);
          setUserId(u._id ?? u.id ?? null);
          setUserName(u.name ?? null);
        }
      } catch {
        // Not authenticated
      }
    };
    checkAuth();
  }, []);

  const login = (
    newRole?: string,
    newUserId?: string,
    newUserName?: string
  ) => {
    if (newRole) setRole(newRole);
    if (newUserId) setUserId(newUserId);
    if (newUserName) setUserName(newUserName);
  };

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Ignore errors
    }
    setRole(null);
    setUserId(null);
    setUserName(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ role, userId, userName, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

