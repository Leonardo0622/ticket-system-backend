import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      const token = res.data?.token ?? res.data?.accessToken ?? "";
      const role = res.data?.user?.role ?? res.data?.role;
      const userId =
        res.data?.user?._id ?? res.data?.user?.id ?? res.data?.userId ?? null;
      const userName = res.data?.user?.name ?? null;
      if (!token) {
        throw new Error("No se recibió token desde el backend");
      }
      login(token, role, userId ?? undefined, userName ?? undefined);
      navigate("/tickets");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Error al iniciar sesión";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card card-auth">
      <h1>Iniciar sesión</h1>
      <p className="muted">
        Usa las mismas credenciales que en los endpoints de `/api/auth/login`.
      </p>
      <form onSubmit={handleSubmit} className="form">
        <label className="form-field">
          <span>Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="form-field">
          <span>Contraseña</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && <div className="alert error">{error}</div>}
        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
      <p className="muted small">
        ¿No tienes cuenta? <Link to="/register">Crear cuenta</Link>
      </p>
    </div>
  );
}

