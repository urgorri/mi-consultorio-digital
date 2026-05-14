import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Stethoscope, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import { authApi } from "@/services/api/client";
import { toast } from "sonner";

const PasswordRecoveryPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await authApi.recoverPassword(email);
      setSuccess(true);
      toast.success("Instrucciones enviadas");
    } catch (err: any) {
      setError(err.message || "Error al solicitar recuperación");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await authApi.resetPassword(token!, password);
      setSuccess(true);
      toast.success("Contraseña restablecida correctamente");
    } catch (err: any) {
      setError(err.message || "Error al restablecer contraseña");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">MiConsultorio</span>
        </div>

        {success ? (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {token ? "Contraseña actualizada" : "Revisa tu correo"}
            </h1>
            <p className="text-muted-foreground mb-8">
              {token
                ? "Tu contraseña ha sido actualizada exitosamente. Ya puedes iniciar sesión con tu nueva credencial."
                : `Hemos enviado instrucciones para restablecer tu contraseña a ${email}`}
            </p>
            <Link to="/login">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Volver al inicio de sesión
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {token ? "Restablecer contraseña" : "Recuperar contraseña"}
            </h1>
            <p className="text-muted-foreground mb-8">
              {token
                ? "Ingresa tu nueva contraseña para acceder a tu cuenta."
                : "Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña."}
            </p>

            {error && (
              <div className="bg-destructive/10 text-destructive p-3 rounded-md flex items-center gap-2 mb-6 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <form onSubmit={token ? handleReset : handleRecover} className="space-y-4">
              {!token ? (
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
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="password">Nueva contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      required
                    />
                  </div>
                </>
              )}
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Procesando..." : (token ? "Restablecer contraseña" : "Enviar instrucciones")}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              <Link to="/login" className="text-primary font-medium hover:underline inline-flex items-center gap-1">
                <ArrowLeft className="w-3 h-3" />
                Volver al inicio de sesión
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default PasswordRecoveryPage;
