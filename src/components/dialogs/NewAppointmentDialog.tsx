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
import { patientsApi } from "@/services/api";
import type { Patient, Appointment } from "@/services/api/types";

interface NewAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (appointment: Appointment) => void;
  defaultDate?: string;
}

const timeSlots = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00",
];

const appointmentTypes = [
  { id: "Consulta General", duration: 30 },
  { id: "Seguimiento", duration: 20 },
  { id: "Primera vez", duration: 45 },
  { id: "Urgencia", duration: 15 },
];

const NewAppointmentDialog = ({ open, onOpenChange, onCreated, defaultDate }: NewAppointmentDialogProps) => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [form, setForm] = useState({
    patientId: "",
    date: defaultDate || new Date().toISOString().split("T")[0],
    time: "",
    type: "",
    reason: "",
  });

  useEffect(() => {
    if (open) {
      patientsApi.list({}).then(res => setPatients(res.data));
      if (defaultDate) setForm(prev => ({ ...prev, date: defaultDate }));
    }
  }, [open, defaultDate]);

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const getEndTime = () => {
    if (!form.time || !form.type) return "";
    const type = appointmentTypes.find(t => t.id === form.type);
    if (!type) return "";
    const [h, m] = form.time.split(":").map(Number);
    const total = h * 60 + m + type.duration;
    return `${Math.floor(total / 60).toString().padStart(2, "0")}:${(total % 60).toString().padStart(2, "0")}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const patient = patients.find(p => p.id === form.patientId);
    const newAppt: Appointment = {
      id: `apt-${Date.now()}`,
      patientId: form.patientId,
      patientName: patient ? `${patient.firstName} ${patient.lastName}` : "Paciente",
      professionalId: "1",
      professionalName: "Dra. María García",
      locationId: "1",
      locationName: "Consultorio Centro",
      date: form.date,
      time: form.time,
      endTime: getEndTime(),
      type: form.type,
      status: "confirmada",
      reason: form.reason,
    };

    setTimeout(() => {
      setSaving(false);
      toast({ title: "Cita agendada", description: `Cita de ${newAppt.patientName} el ${form.date} a las ${form.time}.` });
      onCreated?.(newAppt);
      onOpenChange(false);
      setForm({ patientId: "", date: defaultDate || new Date().toISOString().split("T")[0], time: "", type: "", reason: "" });
    }, 500);
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
            <Label>Tipo de cita *</Label>
            <Select value={form.type} onValueChange={v => update("type", v)}>
              <SelectTrigger><SelectValue placeholder="Seleccionar tipo" /></SelectTrigger>
              <SelectContent>
                {appointmentTypes.map(t => (
                  <SelectItem key={t.id} value={t.id}>{t.id} ({t.duration} min)</SelectItem>
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
                  {timeSlots.map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {form.time && form.type && (
            <p className="text-xs text-muted-foreground">
              Duración: {appointmentTypes.find(t => t.id === form.type)?.duration} min · Termina a las {getEndTime()}
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
