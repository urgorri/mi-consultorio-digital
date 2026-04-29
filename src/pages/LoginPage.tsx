import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const LoginPage = () => {
  const { user } = useAuth();
  
  if (user) {
    const redirectMap = { profesional: "/dashboard", paciente: "/portal", admin: "/admin" } as const;
    return <Navigate to={redirectMap[user.role]} replace />;
  }
  
  // Redirect directly to patient login by default
  return <Navigate to="/login/paciente" replace />;
};

export default LoginPage;
