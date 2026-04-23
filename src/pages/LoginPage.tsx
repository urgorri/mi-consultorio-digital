import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Stethoscope, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // If already logged in, redirect
  if (user) {
    const redirectMap = { profesional: "/dashboard", paciente: "/portal", admin: "/admin" } as const;
    return <Navigate to={redirectMap[user.role]} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      // After login, user state is set — we read from localStorage to get role
      const stored = localStorage.getItem("mc_auth_user");
      if (stored) {
        const u = JSON.parse(stored);
        const redirectMap: Record<string, string> = { profesional: "/dashboard", paciente: "/portal", admin: "/admin" };
        navigate(redirectMap[u.role] || "/dashboard", { replace: true });
      }
    } else {
      toast({
        title: "Error de autenticación",
        description: result.error || "Credenciales inválidas",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative items-center justify-center">
        <div className="max-w-md text-center px-8">
          <div className="w-16 h-16 rounded-2xl bg-primary-foreground/10 flex items-center justify-center mx-auto mb-8">
            <Stethoscope className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">
            Bienvenido a MiConsultorio
          </h2>
          <p className="text-primary-foreground/70 leading-relaxed">
            La plataforma que simplifica la gestión de tu práctica médica.
            Agenda, pacientes, consultas y más en un solo lugar.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">MiConsultorio</span>
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-2">Iniciar sesión</h1>
          <p className="text-muted-foreground mb-8">
            Ingresa tus credenciales para acceder a tu cuenta
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Contraseña</Label>
                <Link
                  to="/recuperar-contrasena"
                  className="text-xs text-primary hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Iniciar sesión
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            ¿No tienes cuenta?{" "}
            <Link to="/registro" className="text-primary font-medium hover:underline">
              Regístrate aquí
            </Link>
          </p>

          <div className="mt-8 p-4 rounded-lg bg-muted/50 border border-border">
            <p className="text-xs font-medium text-muted-foreground mb-2">Cuentas de prueba:</p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p><span className="font-medium text-foreground">Profesional:</span> dra.garcia@email.com</p>
              <p><span className="font-medium text-foreground">Paciente:</span> laura@email.com</p>
              <p><span className="font-medium text-foreground">Admin:</span> admin@miconsultorio.com</p>
              <p className="text-muted-foreground/70 mt-1">Contraseña: cualquiera</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
