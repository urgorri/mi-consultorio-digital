import React, { useState, useRef } from "react";
import { Camera, Upload, CheckCircle2, AlertCircle, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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

export const DocumentCaptureField: React.FC<DocumentCaptureFieldProps> = ({
  formData,
  onVerified,
  className,
}) => {
  const isMobile = useIsMobile();
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<DocumentVerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (side: "front" | "back", e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (side === "front") setFrontFile(file);
      else setBackFile(file);
      setError(null);
      setResult(null);
    }
  };

  const removeFile = (side: "front" | "back") => {
    if (side === "front") setFrontFile(null);
    else setBackFile(null);
    setResult(null);
  };

  const startVerification = async () => {
    if (!frontFile || !backFile) {
      setError("Por favor, sube ambas imágenes del documento.");
      return;
    }

    setIsVerifying(true);
    setProgress(10);
    setError(null);

    // Simulate progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const response = await kycApi.verifyIdentityDocument(
        [frontFile, backFile],
        formData
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
        setError(response.message || "Error al verificar el documento.");
      }
    } catch (err) {
      clearInterval(interval);
      setError("Ocurrió un error inesperado durante la verificación.");
    } finally {
      setIsVerifying(false);
    }
  };

  const renderCaptureButton = (side: "front" | "back", label: string) => {
    const file = side === "front" ? frontFile : backFile;
    const inputRef = side === "front" ? frontInputRef : backInputRef;

    return (
      <div className="flex flex-col space-y-2">
        <Label htmlFor={`file-${side}`}>{label}</Label>
        <div
          className={`border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center transition-colors cursor-pointer ${
            file ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
          }`}
          onClick={() => !isVerifying && inputRef.current?.click()}
        >
          <input
            id={`file-${side}`}
            type="file"
            accept="image/*"
            capture={isMobile ? "environment" : undefined}
            className="hidden"
            ref={inputRef}
            onChange={(e) => handleFileChange(side, e)}
            disabled={isVerifying}
          />

          {file ? (
            <div className="flex items-center space-x-2 w-full overflow-hidden">
              <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
              <span className="text-sm truncate grow">{file.name}</span>
              {!isVerifying && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(side);
                  }}
                  className="p-1 hover:bg-muted rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-1">
              {isMobile ? (
                <Camera className="w-8 h-8 text-muted-foreground" />
              ) : (
                <Upload className="w-8 h-8 text-muted-foreground" />
              )}
              <span className="text-xs text-muted-foreground font-medium">
                {isMobile ? "Tomar foto" : "Subir imagen"}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-2 gap-4">
        {renderCaptureButton("front", "Frente")}
        {renderCaptureButton("back", "Dorso")}
      </div>

      {isVerifying && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium">
            <span>Verificando identidad...</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error de verificación</AlertTitle>
          <AlertDescription className="text-xs">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {result?.status === "approved" && (
        <Alert className="border-green-500 bg-green-50 text-green-900 dark:bg-green-900/10 dark:text-green-400 dark:border-green-900">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertTitle>Identidad Verificada</AlertTitle>
          <AlertDescription className="text-xs">
            Tu documento ha sido validado correctamente.
          </AlertDescription>
        </Alert>
      )}

      {result?.status === "manual_review" && (
        <Alert className="border-amber-500 bg-amber-50 text-amber-900 dark:bg-amber-900/10 dark:text-amber-400 dark:border-amber-900">
          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertTitle>Revisión Manual</AlertTitle>
          <AlertDescription className="text-xs">
            {result.error || "Algunos datos requieren revisión manual, pero puedes continuar."}
          </AlertDescription>
        </Alert>
      )}

      {!result && !isVerifying && (
        <Button
          type="button"
          className="w-full"
          onClick={startVerification}
          disabled={!frontFile || !backFile || !formData.firstName || !formData.lastName || !formData.documentNumber}
        >
          Verificar Documento
        </Button>
      )}

      {isVerifying && (
        <Button disabled className="w-full">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Procesando...
        </Button>
      )}
    </div>
  );
};
