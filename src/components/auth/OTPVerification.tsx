import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { authApi } from "@/services/api/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface OTPVerificationProps {
  email: string;
  onVerified: (user: any) => void;
  onBack: () => void;
}

export const OTPVerification = ({ email, onVerified, onBack }: OTPVerificationProps) => {
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleVerify = async () => {
    if (otp.length !== 6) return;
    setIsVerifying(true);
    try {
      const res = await authApi.verifyEmail(email, otp);
      if (res.success) {
        toast.success("Correo verificado exitosamente");
        onVerified(res.data.user);
      }
    } catch (error: any) {
      toast.error(error.message || "Código inválido o expirado");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setIsResending(true);
    try {
      await authApi.resendVerificationEmail(email);
      toast.success("Código reenviado");
      setResendTimer(60);
    } catch (error: any) {
      toast.error(error.message || "Error al reenviar código");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-semibold text-foreground">Verifica tu correo</h2>
        <p className="text-sm text-muted-foreground">
          Hemos enviado un código de 6 dígitos a <span className="font-medium text-foreground">{email}</span>
        </p>
      </div>

      <div className="flex flex-col items-center gap-4">
        <InputOTP
          maxLength={6}
          value={otp}
          onChange={(value) => setOtp(value)}
          disabled={isVerifying}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>

        <Button
          className="w-full mt-2"
          onClick={handleVerify}
          disabled={otp.length !== 6 || isVerifying}
        >
          {isVerifying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verificando...
            </>
          ) : (
            "Verificar y completar registro"
          )}
        </Button>

        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-2">
            ¿No recibiste el código?
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResend}
            disabled={resendTimer > 0 || isResending}
            className="text-primary hover:text-primary/80"
          >
            {isResending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : resendTimer > 0 ? (
              `Reenviar en ${resendTimer}s`
            ) : (
              "Reenviar código"
            )}
          </Button>
        </div>

        <Button variant="link" className="text-muted-foreground" onClick={onBack}>
          Volver y editar correo
        </Button>
      </div>
    </div>
  );
};
