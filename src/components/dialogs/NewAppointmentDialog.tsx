import { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { patientsApi, appointmentsApi, settingsApi } from "@/services/api";
import { useClinicFilter } from "@/contexts/ClinicFilterContext";
import type { Patient, Appointment, AppointmentType } from "@/services/api/types";
import { APPOINTMENT_STATUS } from "@/features/appointments/domain/appointmentStatus";

interface NewAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (appointment: Appointment) => void;
  defaultDate?: string;
}

const NewAppointmentDialog = ({ open, onOpenChange, onCreated, defaultDate }: NewAppointmentDialogProps) => {
  const { toast } = useToast();
  const { availableClinics } = useClinicFilter();
  const [saving, setSaving] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [form, setForm] = useState({
    patientId: "",
    date: defaultDate || new Date().toISOString().split("T")[0],
    time: "",
    type: "",
    reason: "",
    clinicId: "private",
  });

  useEffect(() => {
    if (open) {
      patientsApi.list({}).then(res => setPatients(res.data));
      settingsApi.getAppointmentTypes().then(res => {
        // Map to ensure name is used for both id and display if needed,
        // but the form expects 'type' to match 't.id' (actually t.name in mock)
        // Let's adjust to match how it's used: SelectItem value={t.name}
        setAppointmentTypes(res.data);
      });
      if (defaultDate) setForm(prev => ({ ...prev, date: defaultDate }));
    }
  }, [open, defaultDate]);

  useEffect(() => {
    if (open && form.date) {
      appointmentsApi.getAvailableSlots("prof-1", form.date).then(res => {
        setAvailableSlots(res.data);
        // Reset time if it's no longer available
        if (form.time && !res.data.includes(form.time)) {
          setForm(prev => ({ ...prev, time: "" }));
        }
      });
    }
  }, [open, form.date, form.time]);

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const getEndTime = () => {
    if (!form.time || !form.type) return "";
    const type = appointmentTypes.find(t => t.name === form.type);
    if (!type) return "";
    const [h, m] = form.time.split(":").map(Number);
    const total = h * 60 + m + type.duration;
    return `${Math.floor(total / 60).toString().padStart(2, "0")}:${(total % 60).toString().padStart(2, "0")}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const patient = patients.find(p => p.id === form.patientId);
    const clinic = availableClinics.find(c => c.id === form.clinicId);
    const clinicId = form.clinicId === "private" ? null : form.clinicId;

    try {
      const res = await appointmentsApi.create({
        patientId: form.patientId,
        patientName: patient ? `${patient.firstName} ${patient.lastName}` : "Paciente",
        professionalId: "prof-1",
        professionalName: "Dra. María Pérez",
        locationId: "loc-1",
        locationName: clinic?.name ?? "Consultorio privado",
        clinicId,
        date: form.date,
        time: form.time,
        endTime: getEndTime(),
        type: form.type,
        status: APPOINTMENT_STATUS.CONFIRMED,
        reason: form.reason,
      });

      toast({ title: "Cita agendada", description: `Cita de ${res.data.patientName} el ${form.date} a las ${form.time}.` });
      onCreated?.(res.data);
      onOpenChange(false);
      setForm({ patientId: "", date: defaultDate || new Date().toISOString().split("T")[0], time: "", type: "", reason: "", clinicId: "private" });
    } catch (error: any) {
      toast({
        title: "Error al agendar",
        description: error.message || "Ocurrió un error inesperado",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nueva cita</DialogTitle>
          <DialogDescription>Agenda una nueva cita para un paciente.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Paciente *</Label>
            <Select value={form.patientId} onValueChange={v => update("patientId", v)}>
              <SelectTrigger><SelectValue placeholder="Seleccionar paciente" /></SelectTrigger>
              <SelectContent>
                {patients.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.firstName} {p.lastName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Ámbito *</Label>
            <Select value={form.clinicId} onValueChange={v => update("clinicId", v)}>
              <SelectTrigger><SelectValue placeholder="Seleccionar ámbito" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Privado</SelectItem>
                {availableClinics.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Tipo de cita *</Label>
            <Select value={form.type} onValueChange={v => update("type", v)}>
              <SelectTrigger><SelectValue placeholder="Seleccionar tipo" /></SelectTrigger>
              <SelectContent>
                {appointmentTypes.map(t => (
                  <SelectItem key={t.id} value={t.name}>{t.name} ({t.duration} min)</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Fecha *</Label>
              <Input required type="date" value={form.date} onChange={e => update("date", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Hora *</Label>
              <Select value={form.time} onValueChange={v => update("time", v)}>
                <SelectTrigger><SelectValue placeholder="Hora" /></SelectTrigger>
                <SelectContent>
                  {availableSlots.length > 0 ? (
                    availableSlots.map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>No hay turnos</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          {form.time && form.type && (
            <p className="text-xs text-muted-foreground">
              Duración: {appointmentTypes.find(t => t.name === form.type)?.duration} min · Termina a las {getEndTime()}
            </p>
          )}
          <div className="space-y-2">
            <Label>Motivo de consulta</Label>
            <Textarea value={form.reason} onChange={e => update("reason", e.target.value)} placeholder="Descripción breve..." rows={2} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving || !form.patientId || !form.time || !form.type}>
              {saving ? "Agendando..." : "Agendar cita"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewAppointmentDialog;
