import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { OTPVerification } from "./auth/OTPVerification";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<"profesional" | "paciente" | "admin">;
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, isLoading, sessionStatus } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user || sessionStatus === "expired") {
    return <Navigate to="/login" replace />;
  }

  if (sessionStatus === "blocked") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full bg-card border border-destructive/50 rounded-xl p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m10-10V7a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-foreground">Cuenta bloqueada</h2>
          <p className="text-muted-foreground">Tu acceso ha sido restringido por seguridad o incumplimiento de términos.</p>
          <a href="mailto:soporte@miconsultorio.com" className="text-primary font-medium hover:underline block pt-2">Contactar a soporte</a>
        </div>
      </div>
    );
  }

  // Check email verification for all roles
  if (!user.emailVerifiedAt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full bg-card border border-amber-500/50 rounded-xl p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          <OTPVerification
            email={user.email}
            onVerified={() => {
              window.location.reload();
            }}
            onBack={() => {
              const loginPath = user.role === "paciente" ? "/login/paciente" : "/login/profesional";
              window.location.href = loginPath;
            }}
          />
        </div>
      </div>
    );
  }

  // Check account restrictions
  if (user.role === "profesional") {
    const restriction = user.trialExpired ? "TRIAL_EXPIRED" :
                        user.invalidLicense ? "INVALID_LICENSE" :
                        user.subscriptionInactive ? "SUBSCRIPTION_INACTIVE" : null;

    if (restriction) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full bg-card border border-amber-500/50 rounded-xl p-8 text-center space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Acceso restringido</h2>
            <p className="text-muted-foreground">
              {restriction === "TRIAL_EXPIRED" && "Tu periodo de prueba ha vencido. Por favor, adquiere un plan para continuar."}
              {restriction === "INVALID_LICENSE" && "Tu matrícula profesional no ha podido ser validada. Contacta a soporte."}
              {restriction === "SUBSCRIPTION_INACTIVE" && "Tu suscripción no está activa. Revisa tu método de pago."}
            </p>
            <div className="pt-4 flex flex-col gap-2">
              <button
                onClick={() => window.location.href = "/dashboard/configuracion"}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium"
              >
                Ir a configuración
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their correct area
    const redirectMap = {
      profesional: "/dashboard",
      paciente: "/portal",
      admin: "/admin",
    };
    return <Navigate to={redirectMap[user.role]} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
