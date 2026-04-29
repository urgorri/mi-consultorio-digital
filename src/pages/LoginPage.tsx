import { Link, Navigate } from "react-router-dom";
import { Stethoscope } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const LoginPage = () => {
  const { user } = useAuth();

  if (user) {
    const redirectMap = { profesional: "/dashboard", paciente: "/portal", admin: "/admin" } as const;
    return <Navigate to={redirectMap[user.role]} replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Stethoscope className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-bold">Elegí tu acceso</h1>
        </div>
        <p className="text-muted-foreground mb-6">Selecciona el tipo de cuenta para iniciar sesión.</p>
        <div className="grid gap-3">
          <Link to="/login/paciente" className="rounded-lg border p-3 hover:bg-muted">Ingreso Paciente</Link>
          <Link to="/login/profesional" className="rounded-lg border p-3 hover:bg-muted">Ingreso Profesional</Link>
          <Link to="/login/admin" className="rounded-lg border p-3 hover:bg-muted">Ingreso Administrador</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
