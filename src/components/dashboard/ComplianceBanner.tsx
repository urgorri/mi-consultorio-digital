import { AlertTriangle, Info, ShieldAlert } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const ComplianceBanner = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user || user.role !== "profesional") return null;

  const status = user.licenseStatus;

  if (status === "valid" || !status) return null;

  let variant: "default" | "destructive" | "warning" = "warning";
  let Icon = AlertTriangle;
  let title = "";
  let message = "";
  let showButton = true;

  switch (status) {
    case "pending":
      title = "Validación de matrícula pendiente";
      message = "Tu matrícula está siendo validada con los registros de SISA. Durante el periodo de prueba puedes usar la plataforma normalmente.";
      break;
    case "unverifiable":
      title = "No se pudo verificar la matrícula";
      message = "No logramos encontrar tu matrícula en los registros oficiales. Por favor, verifica que tu número de cédula sea correcto.";
      break;
    case "invalid":
      variant = "destructive";
      Icon = ShieldAlert;
      title = "Matrícula inválida o vencida";
      message = "La matrícula proporcionada figura como inválida o vencida en SISA. El acceso a funciones críticas está restringido.";
      break;
  }

  return (
    <div className="px-4 pt-4 md:px-6">
      <Alert variant={variant === "warning" ? "default" : "destructive"} className={variant === "warning" ? "border-amber-500 bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800" : ""}>
        <Icon className="h-4 w-4" />
        <AlertTitle className="font-bold">{title}</AlertTitle>
        <AlertDescription className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
          <span>{message}</span>
          {showButton && (
            <Button
              variant="outline"
              size="sm"
              className={variant === "warning" ? "border-amber-600 text-amber-900 hover:bg-amber-100 dark:text-amber-200 dark:border-amber-700 dark:hover:bg-amber-900" : ""}
              onClick={() => navigate("/dashboard/configuracion")}
            >
              Verificar datos
            </Button>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ComplianceBanner;
