import { FormEvent, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { patientSearchApi } from "@/services/api";
import type { DocumentType, RegistrationInvite, DocumentVerificationResult } from "@/services/api";
import { DocumentCaptureField } from "@/components/kyc/DocumentCaptureField";

const RegisterPacientePage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const [invite, setInvite] = useState<RegistrationInvite | null>(null);
  const [inviteError, setInviteError] = useState("");
  const [docType, setDocType] = useState<DocumentType>("dni");
  const [docNumber, setDocNumber] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const token = searchParams.get("inviteToken");
    if (!token) return;
    patientSearchApi.getRegistrationInviteByToken(token).then(({ data }) => {
      if (!data || data.status !== "pending") {
        setInviteError("La invitación no es válida o ya fue utilizada.");
        return;
      }
      setInvite(data);
      setDocType(data.documentType);
      setDocNumber(data.documentNumber);
    });
  }, [searchParams]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (invite && (docType !== invite.documentType || docNumber.trim() !== invite.documentNumber)) {
      setInviteError("El documento no coincide con el token de invitación.");
      return;
    }
    if (invite) {
      await patientSearchApi.markRegistrationInviteAsUsed(invite.token);
      setInvite({ ...invite, status: "used" });
    }
    setInviteError("Registro mock exitoso.");
  };

  const handleVerified = (result: DocumentVerificationResult) => {
    setIsVerified(true);
    if (result.firstName) setFirstName(result.firstName);
    if (result.lastName) setLastName(result.lastName);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-2">Registro de Paciente</h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="firstName">Nombre</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  setIsVerified(false);
                }}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Apellido</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  setIsVerified(false);
                }}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Tipo doc.</Label>
              <Select
                value={docType}
                onValueChange={(v) => {
                  setDocType(v as DocumentType);
                  setIsVerified(false);
                }}
                disabled={!!invite}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dni">DNI</SelectItem>
                  <SelectItem value="pasaporte">Pasaporte</SelectItem>
                  <SelectItem value="cedula">Cédula</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="documentNumber">Documento</Label>
              <Input
                id="documentNumber"
                value={docNumber}
                onChange={(e) => {
                  setDocNumber(e.target.value);
                  setIsVerified(false);
                }}
                required
                disabled={!!invite}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Verificación de Identidad</Label>
            <DocumentCaptureField
              formData={{ firstName, lastName, documentType: docType, documentNumber: docNumber }}
              onVerified={handleVerified}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Correo</Label>
            <Input id="email" type="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Input id="password" type={showPassword ? "text" : "password"} required />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          {invite && (
            <p className="text-xs text-muted-foreground">
              Invitación válida hasta: {new Date(invite.expiresAt).toLocaleString()}
            </p>
          )}
          {inviteError && <p className="text-xs text-primary">{inviteError}</p>}
          <Button className="w-full" type="submit" disabled={!isVerified}>
            Crear cuenta
          </Button>
        </form>
        <p className="text-center text-sm mt-6">
          ¿Ya tienes cuenta? <Link to="/login/paciente" className="text-primary font-medium hover:underline">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPacientePage;
