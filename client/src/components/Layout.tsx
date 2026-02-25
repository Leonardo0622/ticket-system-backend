import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export function Layout({ children }: { children: React.ReactNode }) {
  const { token, userName, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="app-header-left">
          <span className="logo">Ticket System</span>
          {token && (
            <nav className="nav-links">
              <Link to="/tickets">Tickets</Link>
            </nav>
          )}
        </div>
        <div className="app-header-right">
          {!token && (
            <>
              <Link
                to="/login"
                className={isAuthPage && location.pathname === "/login" ? "active-link" : ""}
              >
                Login
              </Link>
              <Link
                to="/register"
                className={isAuthPage && location.pathname === "/register" ? "active-link" : ""}
              >
                Registro
              </Link>
            </>
          )}
          {token && (
            <>
              {userName && (
                <span className="user-pill">
                  {userName}
                </span>
              )}
              <button className="btn-secondary" onClick={handleLogout}>
                Cerrar sesión
              </button>
            </>
          )}
        </div>
      </header>
      <main className="app-main">{children}</main>
    </div>
  );
}

