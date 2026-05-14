import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { authApi } from "@/services/api/client";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";

interface MFALoginVerificationProps {
  onVerified: (user: any) => void;
  onCancel: () => void;
}

export const MFALoginVerification = ({ onVerified, onCancel }: MFALoginVerificationProps) => {
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    if (otp.length !== 6) return;
    setIsVerifying(true);
    try {
      const res = await authApi.verifyMfa(otp);
      if (res.success) {
        toast.success("MFA verificado correctamente");
        onVerified(res.data.user);
      }
    } catch (error: any) {
      toast.error(error.message || "Código MFA inválido o expirado");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="space-y-2 text-center">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">Autenticación de Dos Factores</h2>
        <p className="text-sm text-muted-foreground">
          Ingresa el código de 6 dígitos generado por tu aplicación de autenticación.
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
            "Verificar y Acceder"
          )}
        </Button>

        <Button variant="ghost" className="text-muted-foreground w-full" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </div>
  );
};
