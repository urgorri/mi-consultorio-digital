import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useClinicFilter } from "@/contexts/ClinicFilterContext";
import type { Patient, DocumentType, ProfessionalPatientRequest } from "@/services/api/types";
import { patientSearchApi, authApi } from "@/services/api";
import { Badge } from "@/components/ui/badge";

interface NewPatientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (patient: Patient) => void;
  onRequestSent?: (request: ProfessionalPatientRequest) => void;
}

type Step = 1 | 2 | 3;

const NewPatientDialog = ({ open, onOpenChange, onCreated, onRequestSent }: NewPatientDialogProps) => {
  const { toast } = useToast();
  const { availableClinics } = useClinicFilter();
  const [step, setStep] = useState<Step>(1);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [documentType, setDocumentType] = useState<DocumentType>("dni");
  const [documentNumber, setDocumentNumber] = useState("");
  const [foundPatient, setFoundPatient] = useState<Patient | null>(null);
  const [clinicIds, setClinicIds] = useState<string[]>([]);
  const [isPrivate, setIsPrivate] = useState(true);

  const toggleClinic = (id: string) =>
    setClinicIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const reset = () => {
    setStep(1);
    setDocumentType("dni");
    setDocumentNumber("");
    setFoundPatient(null);
    setClinicIds([]);
    setIsPrivate(true);
  };

  const handleSearch = async () => {
    if (!documentNumber.trim()) {
      toast({ title: "Documento requerido", description: "Ingresá el número de documento.", variant: "destructive" });
      return;
    }
    setSearching(true);
    try {
      const result = await patientSearchApi.findPatientByDocument(documentType, documentNumber.trim());
      if (result.data.found && result.data.patient) {
        setFoundPatient(result.data.patient);
        setStep(2);
      } else {
        toast({
          title: "Paciente no encontrado",
          description: "No existe un paciente con este documento. Podés enviar una invitación para que se registre.",
        });
        setStep(3);
      }
    } catch (error) {
      toast({ title: "Error", description: "No se pudo buscar el paciente.", variant: "destructive" });
    } finally {
      setSearching(false);
    }
  };

  const handleSendRequest = async () => {
    if (!foundPatient) return;
    if (!isPrivate && clinicIds.length === 0) {
      toast({ title: "Asignación requerida", description: "Asociá al paciente a tu ámbito privado o a al menos una clínica.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const currentUser = await authApi.getCurrentUser();
      const requestResult = await patientSearchApi.createProfessionalPatientRequest(
        foundPatient.id,
        currentUser.data.id,
        isPrivate ? undefined : clinicIds[0]
      );
      toast({
        title: "Solicitud enviada",
        description: `Se ha enviado una solicitud para acceder al paciente ${foundPatient.firstName} ${foundPatient.lastName}.`,
      });
      onRequestSent?.(requestResult.data);
      onOpenChange(false);
      reset();
    } catch (error) {
      toast({ title: "Error", description: "No se pudo enviar la solicitud.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              {step === 1 && "Buscar paciente"}
              {step === 2 && "Paciente encontrado"}
              {step === 3 && "Confirmar solicitud"}
            </DialogTitle>
            <div className="flex gap-1">
              <span className={`w-2 h-2 rounded-full ${step >= 1 ? "bg-primary" : "bg-muted"}`} />
              <span className={`w-2 h-2 rounded-full ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
              <span className={`w-2 h-2 rounded-full ${step >= 3 ? "bg-primary" : "bg-muted"}`} />
            </div>
          </div>
          <DialogDescription>
            {step === 1 && "Buscá un paciente por su documento para evitar duplicados."}
            {step === 2 && "Verificá los datos del paciente antes de continuar."}
            {step === 3 && "Confirmá los datos y enviá la solicitud de acceso."}
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1 space-y-2">
                <Label>Tipo de documento</Label>
                <Select value={documentType} onValueChange={(v) => setDocumentType(v as DocumentType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dni">DNI</SelectItem>
                    <SelectItem value="pasaporte">Pasaporte</SelectItem>
                    <SelectItem value="cedula">Cédula</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Número de documento *</Label>
                <Input
                  value={documentNumber}
                  onChange={e => setDocumentNumber(e.target.value)}
                  placeholder="Ingrese el número"
                  onKeyDown={e => e.key === "Enter" && (e.preventDefault(), handleSearch())}
                />
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>Cancelar</Button>
              <Button type="button" onClick={handleSearch} disabled={searching || !documentNumber.trim()}>
                {searching ? "Buscando..." : "Buscar"}
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === 2 && foundPatient && (
          <div className="space-y-4 py-4">
            <div className="p-4 bg-muted rounded-lg space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Nombre</Label>
                  <p className="font-medium">{foundPatient.firstName}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Apellido</Label>
                  <p className="font-medium">{foundPatient.lastName}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <p className="text-sm">{foundPatient.email}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Teléfono</Label>
                  <p className="text-sm">{foundPatient.phone}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Documento</Label>
                  <p className="text-sm">{foundPatient.documentNumber}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Fecha de nacimiento</Label>
                  <p className="text-sm">{foundPatient.birthDate}</p>
                </div>
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setStep(1)}>Volver</Button>
              <Button type="button" onClick={() => setStep(3)}>Continuar</Button>
            </DialogFooter>
          </div>
        )}

        {step === 3 && foundPatient && (
          <div className="space-y-4 py-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-medium">{foundPatient.firstName} {foundPatient.lastName}</p>
                  <p className="text-sm text-muted-foreground">{foundPatient.documentNumber}</p>
                </div>
                <Badge variant="secondary">Pendiente</Badge>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-border">
              <Label className="text-sm">Asociación</Label>
              <p className="text-xs text-muted-foreground">Elegí en qué ámbitos vas a registrar a este paciente.</p>
              <div className="space-y-2 mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={isPrivate} onCheckedChange={(v) => setIsPrivate(!!v)} />
                  <span className="text-sm">Paciente privado (solo yo lo veo)</span>
                </label>
                {availableClinics.map(c => (
                  <label key={c.id} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox checked={clinicIds.includes(c.id)} onCheckedChange={() => toggleClinic(c.id)} />
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: `hsl(${c.color})` }}
                    />
                    <span className="text-sm">{c.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setStep(2)}>Volver</Button>
              <Button type="button" onClick={handleSendRequest} disabled={saving}>
                {saving ? "Enviando..." : "Confirmar y enviar solicitud"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default NewPatientDialog;
