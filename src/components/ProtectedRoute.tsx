import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { OTPVerification } from "./auth/OTPVerification";
import { DocumentCaptureField } from "./kyc/DocumentCaptureField";
import type { Capability, ModuleKey } from "@/access/moduleAccess";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<"profesional" | "paciente" | "admin">;
  requiredModule?: ModuleKey;
  requiredCapability?: Capability;
}

const ProtectedRoute = ({ children, allowedRoles, requiredModule, requiredCapability }: ProtectedRouteProps) => {
  const { user, isLoading, sessionStatus, canAccessModule, canUseCapability } = useAuth();

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
          <a href="mailto:soporte@miconsultorio.ar" className="text-primary font-medium hover:underline block pt-2">Contactar a soporte</a>
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
  if (user.role === "profesional" || user.role === "paciente") {
    const restriction = (user.trialExpired && user.licenseStatus !== "valid") ? "TRIAL_EXPIRED_LICENSE_REQUIRED" :
                        user.trialExpired ? "TRIAL_EXPIRED" :
                        user.licenseStatus === "invalid" ? "INVALID_LICENSE" :
                        user.subscriptionInactive ? "SUBSCRIPTION_INACTIVE" :
                        (user.kycStatus !== "approved") ? "KYC_REQUIRED" : null;

    if (restriction) {
      if (restriction === "KYC_REQUIRED") {
        return (
          <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="max-w-md w-full bg-card border border-primary/20 rounded-xl p-8 space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-foreground">Verificación de Identidad</h2>
                <p className="text-muted-foreground text-sm">
                  Para habilitar funcionalidades sensibles, necesitamos verificar tu identidad.
                </p>
              </div>

              <DocumentCaptureField
                formData={{
                  firstName: user.firstName,
                  lastName: user.lastName,
                  documentType: "dni",
                  documentNumber: "PENDING",
                }}
                onVerified={() => {
                  setTimeout(() => window.location.reload(), 1500);
                }}
              />
            </div>
          </div>
        );
      }
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full bg-card border border-amber-500/50 rounded-xl p-8 text-center space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Acceso restringido</h2>
            <p className="text-muted-foreground">
              {restriction === "TRIAL_EXPIRED" && "Tu periodo de prueba ha vencido. Por favor, adquiere un plan para continuar."}
              {restriction === "TRIAL_EXPIRED_LICENSE_REQUIRED" && "Tu periodo de prueba ha vencido y tu matrícula no es válida. Se requiere una matrícula válida para continuar."}
              {restriction === "INVALID_LICENSE" && "Tu matrícula profesional no es válida según los registros oficiales. Por favor, verifica tus datos o contacta a soporte."}
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

  if (requiredModule && !canAccessModule(requiredModule, user)) {
    return <Navigate to="/" replace />;
  }

  if (requiredCapability && !canUseCapability(requiredCapability, user)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
