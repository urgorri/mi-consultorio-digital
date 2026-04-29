import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const RegisterPacientePage = () => {
  const [showPassword, setShowPassword] = useState(false);
  return <div className="min-h-screen flex items-center justify-center p-6"><div className="w-full max-w-sm"><h1 className="text-2xl font-bold mb-2">Registro de Paciente</h1><form className="space-y-4"><div className="grid grid-cols-2 gap-3"><div className="space-y-2"><Label htmlFor="firstName">Nombre</Label><Input id="firstName" required/></div><div className="space-y-2"><Label htmlFor="lastName">Apellido</Label><Input id="lastName" required/></div></div><div className="space-y-2"><Label htmlFor="email">Correo</Label><Input id="email" type="email" required/></div><div className="space-y-2"><Label htmlFor="password">Contraseña</Label><div className="relative"><Input id="password" type={showPassword?"text":"password"} required/><button type="button" className="absolute right-3 top-1/2 -translate-y-1/2" onClick={()=>setShowPassword(!showPassword)}>{showPassword?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}</button></div></div><Button className="w-full">Crear cuenta</Button></form><p className="text-center text-sm mt-6">¿Ya tienes cuenta? <Link to="/login/paciente" className="text-primary font-medium hover:underline">Inicia sesión</Link></p></div></div>;
};

export default RegisterPacientePage;
