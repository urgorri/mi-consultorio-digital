import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Stethoscope, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DocumentCaptureField } from "@/components/kyc/DocumentCaptureField";
import type { DocumentType, DocumentVerificationResult } from "@/services/api";
import { authApi } from "@/services/api";
import { OTPVerification } from "@/components/auth/OTPVerification";
import { toast } from "sonner";

const RegisterProfesionalPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [docType, setDocType] = useState<DocumentType>("dni");
  const [docNumber, setDocNumber] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [step, setStep] = useState<"form" | "otp">("form");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVerified = (result: DocumentVerificationResult) => {
    setIsVerified(true);
    if (result.firstName) setFirstName(result.firstName);
    if (result.lastName) setLastName(result.lastName);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await authApi.registerProfessional({
        email,
        password,
        firstName,
        lastName,
        specialty,
        documentType: docType,
        documentNumber: docNumber,
      });

      if (res.success) {
        setStep("otp");
      }
    } catch (error: any) {
      toast.error(error.message || "Error al iniciar el registro");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel - Green for profesional */}
      <div className="hidden lg:flex lg:w-1/2 bg-emerald-600 relative items-center justify-center">
        <div className="max-w-md text-center px-8">
          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-8">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Únete como Profesional
          </h2>
          <p className="text-white/70 leading-relaxed">
            Crea tu cuenta y accede a herramientas diseñadas para optimizar
            la gestión de tu práctica médica.
          </p>
        </div>
      </div>

      {/* Right panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">MiConsultorio</span>
          </div>

          {step === "form" ? (
            <>
              <h1 className="text-2xl font-bold mb-2">Registro de Profesional</h1>

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
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialty">Especialidad</Label>
                  <Input
                    id="specialty"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Button className="w-full" size="lg" type="submit" disabled={!isVerified || isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    "Crear cuenta"
                  )}
                </Button>
              </form>
            </>
          ) : (
            <OTPVerification
              email={email}
              onVerified={() => {
                navigate("/login/profesional");
              }}
              onBack={() => setStep("form")}
            />
          )}
          <p className="text-center text-sm mt-6">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login/profesional" className="text-primary font-medium hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterProfesionalPage;
