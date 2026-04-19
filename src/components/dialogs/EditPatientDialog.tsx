import { useState, useEffect } from "react";
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
import type { Patient } from "@/services/api/types";

interface EditPatientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient | null;
  onUpdated?: (patient: Patient) => void;
}

const EditPatientDialog = ({ open, onOpenChange, patient, onUpdated }: EditPatientDialogProps) => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "", birthDate: "",
    gender: "", address: "", bloodType: "", allergies: "", conditions: "",
  });

  useEffect(() => {
    if (patient) {
      setForm({
        firstName: patient.firstName, lastName: patient.lastName, email: patient.email,
        phone: patient.phone, birthDate: patient.birthDate, gender: patient.gender,
        address: patient.address, bloodType: patient.bloodType, allergies: patient.allergies,
        conditions: patient.conditions,
      });
    }
  }, [patient]);

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;
    setSaving(true);

    const updated: Patient = { ...patient, ...form };

    setTimeout(() => {
      setSaving(false);
      toast({ title: "Paciente actualizado", description: `Los datos de ${form.firstName} ${form.lastName} se han guardado.` });
      onUpdated?.(updated);
      onOpenChange(false);
    }, 500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar paciente</DialogTitle>
          <DialogDescription>Modifica los datos del paciente.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Nombre *</Label>
              <Input required value={form.firstName} onChange={e => update("firstName", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Apellido *</Label>
              <Input required value={form.lastName} onChange={e => update("lastName", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Correo *</Label>
              <Input required type="email" value={form.email} onChange={e => update("email", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Teléfono *</Label>
              <Input required value={form.phone} onChange={e => update("phone", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Fecha de nacimiento</Label>
              <Input type="date" value={form.birthDate} onChange={e => update("birthDate", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Género</Label>
              <Select value={form.gender} onValueChange={v => update("gender", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Masculino">Masculino</SelectItem>
                  <SelectItem value="Femenino">Femenino</SelectItem>
                  <SelectItem value="Otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Dirección</Label>
            <Input value={form.address} onChange={e => update("address", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Tipo de sangre</Label>
            <Select value={form.bloodType} onValueChange={v => update("bloodType", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(t => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Alergias</Label>
            <Textarea value={form.allergies} onChange={e => update("allergies", e.target.value)} rows={2} />
          </div>
          <div className="space-y-2">
            <Label>Condiciones preexistentes</Label>
            <Textarea value={form.conditions} onChange={e => update("conditions", e.target.value)} rows={2} />
          </div>

          <div className="space-y-2 pt-2 border-t border-border">
            <Label className="text-sm">Asociación</Label>
            <p className="text-xs text-muted-foreground">Modificá los ámbitos en los que está registrado este paciente.</p>
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving}>{saving ? "Guardando..." : "Guardar cambios"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditPatientDialog;
