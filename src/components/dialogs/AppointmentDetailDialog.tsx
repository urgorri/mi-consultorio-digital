import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, MapPin, FileText, MessageSquare } from "lucide-react";
import type { Appointment } from "@/services/api/types";
import { useToast } from "@/hooks/use-toast";
import { appointmentsApi } from "@/services/api";
import { canCancelAppointment } from "@/features/appointments/domain/rules";
import { AlertCircle } from "lucide-react";
import { mockClinics, mockProfessional } from "@/services/api/mockData";

interface AppointmentDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
  onStatusChange?: (id: string, status: Appointment["status"]) => void;
}

const statusLabels: Record<string, string> = {
  confirmada: "Confirmada",
  pendiente: "Pendiente",
  completada: "Completada",
  cancelada: "Cancelada",
  no_asistio: "No asistió",
};

const statusColors: Record<string, string> = {
  confirmada: "bg-primary/10 text-primary border-primary/30",
  pendiente: "bg-warning/10 text-warning border-warning/30",
  completada: "bg-success/10 text-success border-success/30",
  cancelada: "bg-destructive/10 text-destructive border-destructive/30",
  no_asistio: "bg-muted text-muted-foreground border-border",
};

const AppointmentDetailDialog = ({ open, onOpenChange, appointment, onStatusChange }: AppointmentDetailDialogProps) => {
  const { toast } = useToast();
  if (!appointment) return null;

  const changeStatus = (status: Appointment["status"]) => {
    onStatusChange?.(appointment.id, status);
    toast({ title: "Estado actualizado", description: `La cita se marcó como ${statusLabels[status].toLowerCase()}.` });
    onOpenChange(false);
  };

  const handleSendWhatsApp = async () => {
    try {
      const res = await appointmentsApi.generateSignedUrl(appointment.id);
      if (res.success) {
        const publicUrl = res.data.url;
        const dateStr = new Date(appointment.date).toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" });

        let locationAddress = "";
        if (appointment.clinicId) {
          const clinic = mockClinics.find(c => c.id === appointment.clinicId);
          locationAddress = clinic?.address || "";
        } else {
          const location = mockProfessional.locations.find(l => l.id === appointment.locationId);
          locationAddress = location?.address || "";
        }

        const message = `Hola ${appointment.patientName}, te recordamos tu cita con ${appointment.professionalName}.\n\n📅 *Fecha:* ${dateStr}\n🕒 *Hora:* ${appointment.time}\n📍 *Lugar:* ${appointment.locationName}${locationAddress ? ` (${locationAddress})` : ""}\n\nPor favor, confirma o gestiona tu cita en el siguiente link:\n${publicUrl}`;

        const encodedMessage = encodeURIComponent(message);
        const phone = appointment.patientPhone?.replace(/\D/g, "") || "";
        window.open(`https://wa.me/${phone}?text=${encodedMessage}`, "_blank");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo generar el link de WhatsApp.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Detalle de cita</DialogTitle>
          <DialogDescription>Información de la cita agendada.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className={`text-xs font-medium px-3 py-1.5 rounded-full border ${statusColors[appointment.status]}`}>
              {statusLabels[appointment.status]}
            </span>
            <Badge variant="outline">{appointment.type}</Badge>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">{appointment.patientName}</p>
                <p className="text-xs text-muted-foreground">Paciente</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
              <p className="text-sm text-foreground">
                {new Date(appointment.date).toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
              <p className="text-sm text-foreground">{appointment.time} - {appointment.endTime}</p>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
              <p className="text-sm text-foreground">{appointment.locationName}</p>
            </div>
            {appointment.reason && (
              <div className="flex items-start gap-3">
                <FileText className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">{appointment.reason}</p>
              </div>
            )}
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          {(appointment.status === "pendiente" || appointment.status === "confirmada") && (
            <Button size="sm" variant="outline" className="gap-2" onClick={handleSendWhatsApp}>
              <MessageSquare className="w-4 h-4" />
              WhatsApp
            </Button>
          )}
          {appointment.status === "pendiente" && (
            <Button size="sm" onClick={() => changeStatus("confirmada")}>Confirmar</Button>
          )}
          {(appointment.status === "confirmada" || appointment.status === "pendiente") && (
            <>
              <Button size="sm" variant="outline" onClick={() => changeStatus("completada")}>Completar</Button>
              <div className="flex flex-col gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive"
                  onClick={() => changeStatus("cancelada")}
                  disabled={!canCancelAppointment(appointment)}
                >
                  Cancelar cita
                </Button>
                {!canCancelAppointment(appointment) && (
                  <p className="text-[10px] text-destructive flex items-center gap-1 justify-center">
                    <AlertCircle className="w-3 h-3" /> Solo hasta {appointment.cancellationDeadlineHours ?? 24} h antes
                  </p>
                )}
              </div>
            </>
          )}
          <Button size="sm" variant="ghost" onClick={() => onOpenChange(false)}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentDetailDialog;
