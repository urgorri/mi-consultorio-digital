import React, { useState, useRef, useEffect, useMemo } from "react";
import { Camera, Upload, CheckCircle2, AlertCircle, Loader2, X, ArrowRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { kycApi } from "@/services/api";
import type { DocumentType, DocumentVerificationResult } from "@/services/api/types";

interface DocumentCaptureFieldProps {
  formData: {
    firstName: string;
    lastName: string;
    documentType: DocumentType;
    documentNumber: string;
  };
  onVerified: (result: DocumentVerificationResult) => void;
  className?: string;
}

type Step = "front" | "back" | "selfie" | "review";

export const DocumentCaptureField: React.FC<DocumentCaptureFieldProps> = ({
  formData,
  onVerified,
  className,
}) => {
  const isMobile = useIsMobile();
  const [currentStep, setCurrentStep] = useState<Step>("front");
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);

  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);

  useEffect(() => {
    if (!frontFile) {
      setFrontPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(frontFile);
    setFrontPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [frontFile]);

  useEffect(() => {
    if (!backFile) {
      setBackPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(backFile);
    setBackPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [backFile]);

  useEffect(() => {
    if (!selfieFile) {
      setSelfiePreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(selfieFile);
    setSelfiePreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selfieFile]);

  const [isVerifying, setIsVerifying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<DocumentVerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (currentStep === "front") setFrontFile(file);
      else if (currentStep === "back") setBackFile(file);
      else if (currentStep === "selfie") setSelfieFile(file);

      setError(null);
      setResult(null);
    }
  };

  const nextStep = () => {
    if (currentStep === "front" && frontFile) setCurrentStep("back");
    else if (currentStep === "back" && backFile) setCurrentStep("selfie");
    else if (currentStep === "selfie" && selfieFile) setCurrentStep("review");
  };

  const prevStep = () => {
    if (currentStep === "back") setCurrentStep("front");
    else if (currentStep === "selfie") setCurrentStep("back");
    else if (currentStep === "review") setCurrentStep("selfie");
  };

  const startVerification = async () => {
    if (!frontFile || !backFile || !selfieFile) {
      setError("Por favor, completa todos los pasos de captura.");
      return;
    }

    setIsVerifying(true);
    setProgress(10);
    setError(null);

    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 90 ? 90 : prev + 10));
    }, 300);

    try {
      // Simulate individual uploads as per backend logic
      await kycApi.uploadDocument(frontFile, "front");
      setProgress(40);
      await kycApi.uploadDocument(backFile, "back");
      setProgress(60);
      await kycApi.uploadDocument(selfieFile, "selfie");
      setProgress(80);

      const response = await kycApi.verifyIdentityDocument(
        [frontFile, backFile],
        formData,
        selfieFile
      );

      clearInterval(interval);
      setProgress(100);

      if (response.success) {
        setResult(response.data);
        if (response.data.status === "approved" || response.data.status === "manual_review") {
          onVerified(response.data);
        } else if (response.data.error) {
          setError(response.data.error);
        }
      } else {
        setError(response.message || "Error al verificar la identidad.");
      }
    } catch (err) {
      clearInterval(interval);
      setError("Ocurrió un error inesperado durante la verificación.");
    } finally {
      setIsVerifying(false);
    }
  };

  const renderStepIcon = (step: Step) => {
    switch (step) {
      case "front": return <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">1</div>;
      case "back": return <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">2</div>;
      case "selfie": return <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">3</div>;
      case "review": return <CheckCircle2 className="w-10 h-10 text-green-500" />;
    }
  };

  const getStepTitle = (step: Step) => {
    switch (step) {
      case "front": return "Frente del Documento";
      case "back": return "Dorso del Documento";
      case "selfie": return "Selfie de Verificación";
      case "review": return "Revisar y Enviar";
    }
  };

  const getStepDescription = (step: Step) => {
    switch (step) {
      case "front": return "Captura la parte frontal de tu identificación oficial.";
      case "back": return "Captura la parte posterior de tu identificación.";
      case "selfie": return "Tómate una foto centrando tu rostro en el marco.";
      case "review": return "Asegúrate de que todas las fotos sean claras y legibles.";
    }
  };

  const renderCaptureArea = () => {
    const file = currentStep === "front" ? frontFile : currentStep === "back" ? backFile : selfieFile;
    const preview = currentStep === "front" ? frontPreview : currentStep === "back" ? backPreview : selfiePreview;

    return (
      <div className="space-y-4">
        <div
          className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all min-h-[240px] ${
            file ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
          } ${isVerifying ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          onClick={() => !isVerifying && inputRef.current?.click()}
        >
          <input
            type="file"
            accept="image/*"
            capture={isMobile ? (currentStep === "selfie" ? "user" : "environment") : undefined}
            className="hidden"
            ref={inputRef}
            onChange={handleFileChange}
            disabled={isVerifying}
          />

          {file && preview ? (
            <div className="flex flex-col items-center space-y-4 w-full">
              <div className="relative w-full max-w-[200px] aspect-[3/2] bg-muted rounded-lg overflow-hidden border border-primary/20">
                <div
                  className="w-full h-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${preview})` }}
                  role="img"
                  aria-label="Vista previa"
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium truncate max-w-[150px]">{file.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (currentStep === "front") setFrontFile(null);
                    else if (currentStep === "back") setBackFile(null);
                    else if (currentStep === "selfie") setSelfieFile(null);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-3 text-center">
              {currentStep === "selfie" ? (
                <User className="w-12 h-12 text-muted-foreground" />
              ) : isMobile ? (
                <Camera className="w-12 h-12 text-muted-foreground" />
              ) : (
                <Upload className="w-12 h-12 text-muted-foreground" />
              )}
              <div>
                <p className="text-sm font-semibold">
                  {isMobile ? "Tocar para capturar" : "Haz clic para subir imagen"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Formatos soportados: JPG, PNG
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-2">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === "front" || isVerifying}
          >
            Anterior
          </Button>
          <Button
            onClick={nextStep}
            disabled={!file || isVerifying}
          >
            Siguiente
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  };

  const renderReviewStep = () => {
    const items = [
      { file: frontFile, preview: frontPreview, label: "Frente" },
      { file: backFile, preview: backPreview, label: "Dorso" },
      { file: selfieFile, preview: selfiePreview, label: "Selfie" }
    ];

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-3">
          {items.map((item, idx) => (
            <div key={idx} className="space-y-2">
              <div className="aspect-square bg-muted rounded-lg overflow-hidden border">
                {item.file && item.preview && (
                  <div
                    className="w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${item.preview})` }}
                    role="img"
                    aria-label={item.label}
                  />
                )}
              </div>
              <p className="text-[10px] font-medium text-center uppercase tracking-wider text-muted-foreground">
                {item.label}
              </p>
            </div>
          ))}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error de verificación</AlertTitle>
            <AlertDescription className="text-xs">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col space-y-3">
          {!isVerifying && !result && (
            <Button className="w-full py-6 text-base font-bold" onClick={startVerification}>
              Finalizar Verificación
            </Button>
          )}

          {isVerifying && (
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-medium">
                <span>Procesando identidad y liveness...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <Button disabled className="w-full py-6">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Validando...
              </Button>
            </div>
          )}

          {result?.status === "approved" && (
            <Alert className="border-green-500 bg-green-50 text-green-900 dark:bg-green-900/10 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle>¡KYC Aprobado!</AlertTitle>
              <AlertDescription className="text-xs">
                Tu identidad ha sido verificada con éxito.
              </AlertDescription>
            </Alert>
          )}

          {!isVerifying && !result && (
            <Button variant="ghost" className="text-muted-foreground" onClick={() => setCurrentStep("front")}>
              Volver a empezar
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className={`border-none shadow-none bg-transparent ${className}`}>
      <CardContent className="p-0 space-y-6">
        <div className="flex items-center space-x-4">
          {renderStepIcon(currentStep)}
          <div>
            <h3 className="font-bold text-lg leading-tight">{getStepTitle(currentStep)}</h3>
            <p className="text-sm text-muted-foreground">{getStepDescription(currentStep)}</p>
          </div>
        </div>

        <div className="pt-2">
          {currentStep === "review" ? renderReviewStep() : renderCaptureArea()}
        </div>

        {/* Status Indicators */}
        <div className="flex justify-center space-x-2 pt-4">
          {(["front", "back", "selfie", "review"] as Step[]).map((step) => (
            <div
              key={step}
              className={`h-1.5 rounded-full transition-all ${
                currentStep === step ? "w-8 bg-primary" : "w-2 bg-muted-foreground/20"
              }`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
