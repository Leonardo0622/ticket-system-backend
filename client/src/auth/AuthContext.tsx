import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState
} from "react";

interface AuthContextValue {
  token: string | null;
  role: string | null;
  userId: string | null;
  userName: string | null;
  login: (
    token: string,
    role?: string,
    userId?: string,
    userName?: string
  ) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    const storedRole = localStorage.getItem("auth_role");
    const storedUserId = localStorage.getItem("auth_user_id");
    const storedUserName = localStorage.getItem("auth_user_name");
    if (storedToken) {
      setToken(storedToken);
    }
    if (storedRole) {
      setRole(storedRole);
    }
    if (storedUserId) {
      setUserId(storedUserId);
    }
    if (storedUserName) {
      setUserName(storedUserName);
    }
  }, []);

  const login = (
    newToken: string,
    newRole?: string,
    newUserId?: string,
    newUserName?: string
  ) => {
    setToken(newToken);
    localStorage.setItem("auth_token", newToken);

    if (newRole) {
      setRole(newRole);
      localStorage.setItem("auth_role", newRole);
    }

    if (newUserId) {
      setUserId(newUserId);
      localStorage.setItem("auth_user_id", newUserId);
    }

    if (newUserName) {
      setUserName(newUserName);
      localStorage.setItem("auth_user_name", newUserName);
    }
  };

  const logout = () => {
    setToken(null);
    setRole(null);
    setUserId(null);
    setUserName(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_role");
    localStorage.removeItem("auth_user_id");
    localStorage.removeItem("auth_user_name");
  };

  return (
    <AuthContext.Provider
      value={{ token, role, userId, userName, login, logout }}
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

