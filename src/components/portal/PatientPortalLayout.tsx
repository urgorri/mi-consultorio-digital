import { Link, useLocation, useNavigate } from "react-router-dom";
import { Stethoscope, CalendarDays, Bell, User, LogOut, Menu, X, Clock, Users } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { icon: CalendarDays, label: "Mis citas", path: "/portal" },
  { icon: Clock, label: "Historial", path: "/portal/historial" },
  { icon: Users, label: "Solicitudes", path: "/portal/solicitudes" },
  { icon: Bell, label: "Notificaciones", path: "/portal/notificaciones" },
  { icon: User, label: "Mi perfil", path: "/portal/perfil" },
];

interface PatientPortalLayoutProps {
  children: React.ReactNode;
}

const PatientPortalLayout = ({ children }: PatientPortalLayoutProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const initials = user ? `${user.firstName[0]}${user.lastName[0]}` : "PA";
  const displayName = user ? `${user.firstName} ${user.lastName}` : "Paciente";

  const handleLogout = () => {
    logout();
    navigate("/login/paciente");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-30">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/portal" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">MiConsultorio</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? "bg-accent text-primary" : "text-muted-foreground hover:bg-accent/50"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-xs font-bold text-primary-foreground">{initials}</span>
              </div>
              <span className="text-sm font-medium text-foreground">{displayName}</span>
            </div>
            <button onClick={handleLogout} className="hidden md:flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <LogOut className="w-4 h-4" />
            </button>
            <button className="md:hidden text-foreground" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="md:hidden border-t border-border p-3 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                    isActive ? "bg-accent text-primary" : "text-muted-foreground"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground w-full"
            >
              <LogOut className="w-5 h-5" />
              Cerrar sesión
            </button>
          </nav>
        )}
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {children}
      </main>
    </div>
  );
};

export default PatientPortalLayout;
