import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut, Ticket } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { ThemeToggle } from "./theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const roleLabels: Record<string, string> = {
  admin: "Administrador",
  agent: "Agente",
  user: "Usuario"
};

function getInitials(name?: string | null): string {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { token, userName, role, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 px-4">
          <div className="flex min-w-0 items-center gap-2 sm:gap-4">
            <Link to={token ? "/tickets" : "/"} className="flex items-center gap-2 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 rounded-lg">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Ticket className="size-4" />
              </span>
              <span className="truncate text-sm font-semibold tracking-tight">
                Ticket System
              </span>
            </Link>
            {token && (
              <nav className="flex items-center gap-1">
                <Button
                  asChild
                  variant={
                    location.pathname.startsWith("/tickets")
                      ? "secondary"
                      : "ghost"
                  }
                  size="sm"
                >
                  <Link to="/tickets">Tickets</Link>
                </Button>
              </nav>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            {!token && (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/login">Iniciar sesión</Link>
                </Button>
                <Button asChild size="sm">
                  <Link to="/register">Registrarse</Link>
                </Button>
              </>
            )}
            {token && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label="Menú de usuario"
                    className="ml-1 rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <Avatar className="size-8 border">
                      <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                        {getInitials(userName)}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="flex flex-col gap-1.5">
                    <span className="truncate text-sm font-medium">
                      {userName ?? "Mi cuenta"}
                    </span>
                    {role && (
                      <Badge variant="secondary" className="w-fit">
                        {roleLabels[role] ?? role}
                      </Badge>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-destructive focus:text-destructive"
                  >
                    <LogOut />
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>
      <main
        className={
          isAuthPage
            ? "flex flex-1 items-center justify-center px-4 py-10"
            : "mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:py-8"
        }
      >
        {children}
      </main>
    </div>
  );
}
