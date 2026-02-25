import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";

export function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await api.post("/auth/register", { name, email, password });
      setSuccess("Usuario registrado correctamente. Ahora puedes iniciar sesión.");
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Error al registrar usuario";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card card-auth">
      <h1>Registro</h1>
      <form onSubmit={handleSubmit} className="form">
        <label className="form-field">
          <span>Nombre</span>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
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
        {success && <div className="alert success">{success}</div>}
        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? "Creando..." : "Registrarse"}
        </button>
      </form>
      <p className="muted small">
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </p>
    </div>
  );
}

