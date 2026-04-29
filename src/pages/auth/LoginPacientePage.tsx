import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const LoginPacientePage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, user, assertRole, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  if (user) return <Navigate to="/portal" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (!result.success || !result.user) {
      toast({ title: "Error de autenticación", description: result.error || "Credenciales inválidas", variant: "destructive" });
      return;
    }

    if (!assertRole("paciente", result.user)) {
      logout();
      toast({ title: "Acceso inválido", description: "Esta cuenta no corresponde al acceso de paciente.", variant: "destructive" });
      return;
    }

    navigate("/portal", { replace: true });
  };

  return <div className="min-h-screen flex items-center justify-center p-6"><div className="w-full max-w-sm"><h1 className="text-2xl font-bold mb-2">Iniciar sesión - Paciente</h1><p className="text-muted-foreground mb-8">Accede a tu portal de salud</p><form onSubmit={handleSubmit} className="space-y-4"><div className="space-y-2"><Label htmlFor="email">Correo electrónico</Label><Input id="email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required/></div><div className="space-y-2"><Label htmlFor="password">Contraseña</Label><div className="relative"><Input id="password" type={showPassword?"text":"password"} value={password} onChange={(e)=>setPassword(e.target.value)} required/><button type="button" className="absolute right-3 top-1/2 -translate-y-1/2" onClick={()=>setShowPassword(!showPassword)}>{showPassword?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}</button></div></div><Button className="w-full" disabled={loading}>{loading?<Loader2 className="w-4 h-4 animate-spin mr-2"/>:null}Iniciar sesión</Button></form><p className="text-center text-sm mt-6">¿No tienes cuenta? <Link to="/registro/paciente" className="text-primary font-medium hover:underline">Regístrate aquí</Link></p><p className="text-center text-sm mt-2">¿Eres profesional o admin? <Link to="/login" className="text-primary font-medium hover:underline">Cambiar perfil</Link></p></div></div>;
};

export default LoginPacientePage;
