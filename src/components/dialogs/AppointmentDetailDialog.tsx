import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, MapPin, FileText, MessageSquare, History } from "lucide-react";
import type { Appointment, AppointmentStatusHistory } from "@/services/api/types";
import { useToast } from "@/hooks/use-toast";
import { appointmentsApi } from "@/services/api";
import { canCancelAppointment } from "@/features/appointments/domain/rules";
import { AlertCircle } from "lucide-react";
import { mockClinics, mockProfessional } from "@/services/api/mockData";
import { APPOINTMENT_STATUS, assertAppointmentStatus, getAppointmentStatusLabel } from "@/features/appointments/domain/appointmentStatus";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AppointmentDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
  onStatusChange?: (appointment: Appointment) => void;
}

const statusColors: Record<string, string> = {
  [APPOINTMENT_STATUS.CONFIRMED]: "bg-primary/10 text-primary border-primary/30",
  [APPOINTMENT_STATUS.SCHEDULED]: "bg-warning/10 text-warning border-warning/30",
  [APPOINTMENT_STATUS.COMPLETED]: "bg-success/10 text-success border-success/30",
  [APPOINTMENT_STATUS.CANCELLED]: "bg-destructive/10 text-destructive border-destructive/30",
  [APPOINTMENT_STATUS.NO_SHOW]: "bg-muted text-muted-foreground border-border",
};

const AppointmentDetailDialog = ({ open, onOpenChange, appointment, onStatusChange }: AppointmentDetailDialogProps) => {
  const { toast } = useToast();
  const [history, setHistory] = useState<AppointmentStatusHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (open && appointment) {
      setLoadingHistory(true);
      appointmentsApi.getStatusHistory(appointment.id)
        .then(res => setHistory(res.data))
        .finally(() => setLoadingHistory(false));
    }
  }, [open, appointment]);

  if (!appointment) return null;

  const changeStatus = async (status: Appointment["status"]) => {
    try {
      const res = status === APPOINTMENT_STATUS.CANCELLED
        ? await appointmentsApi.cancel(appointment.id, "Cancelación desde detalle", "profesional")
        : await appointmentsApi.transitionStatus(appointment.id, status, "Actualización desde agenda profesional", "profesional");

      onStatusChange?.(res.data);
      toast({ title: "Estado actualizado", description: `La cita se marcó como ${getAppointmentStatusLabel(assertAppointmentStatus(status), "es-MX").toLowerCase()}.` });
      onOpenChange(false);
    } catch {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la cita.",
        variant: "destructive"
      });
    }
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

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info">Información</TabsTrigger>
            <TabsTrigger value="history">Historial</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-6 pt-4">
            <section className="flex items-center justify-between border-b pb-4">
              <span className={`text-xs font-medium px-3 py-1.5 rounded-full border ${statusColors[assertAppointmentStatus(appointment.status)]}`}>
                {getAppointmentStatusLabel(assertAppointmentStatus(appointment.status), "es-MX")}
              </span>
              <Badge variant="outline" className="max-w-[140px] truncate block" title={appointment.type}>
                {appointment.type}
              </Badge>
            </section>

            <section className="space-y-3">
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
            </section>
          </TabsContent>

          <TabsContent value="history" className="pt-4">
            <ScrollArea className="h-[250px] pr-4">
              {loadingHistory ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-muted-foreground">Cargando historial...</p>
                </div>
              ) : history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                  <History className="w-8 h-8 text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">No hay eventos registrados.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((h, i) => (
                    <div key={h.id} className="relative pl-4 pb-4 border-l border-border last:pb-0">
                      <div className="absolute left-[-5px] top-1.5 w-2 h-2 rounded-full bg-primary" />
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-bold text-foreground">
                          {getAppointmentStatusLabel(assertAppointmentStatus(h.newStatus), "es-MX")}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(h.timestamp).toLocaleString("es-MX", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-xs text-foreground mb-1">{h.reason}</p>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span className="font-medium text-foreground/70">{h.actor.name}</span>
                        <span>•</span>
                        <span>{h.actor.role}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
        <DialogFooter className="flex flex-col gap-4 w-full border-t pt-4 mt-2 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 w-full min-w-0 sm:flex-wrap">
            <div className="flex flex-col sm:flex-row gap-2 min-w-0 sm:flex-wrap">
              <Button size="sm" variant="ghost" onClick={() => onOpenChange(false)} className="w-full sm:w-auto shrink-0">
                Cerrar
              </Button>
              {(appointment.status === APPOINTMENT_STATUS.CONFIRMED || appointment.status === APPOINTMENT_STATUS.SCHEDULED) && (
                <div className="flex flex-col gap-1 w-full sm:w-auto min-w-0">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive w-full focus-visible:ring-destructive"
                    onClick={() => changeStatus(APPOINTMENT_STATUS.CANCELLED)}
                    disabled={!canCancelAppointment(appointment)}
                  >
                    Cancelar cita
                  </Button>
                  {!canCancelAppointment(appointment) && (
                    <p className="text-[10px] text-destructive flex items-center gap-1 justify-center sm:justify-start">
                      <AlertCircle className="w-3 h-3" /> Solo hasta {appointment.cancellationDeadlineHours ?? 24} h antes
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:flex-wrap">
              {(appointment.status === APPOINTMENT_STATUS.SCHEDULED || appointment.status === APPOINTMENT_STATUS.CONFIRMED) && (
                <Button size="sm" variant="outline" className="gap-2 w-full sm:w-auto" onClick={handleSendWhatsApp}>
                  <MessageSquare className="w-4 h-4" />
                  WhatsApp
                </Button>
              )}
              {(appointment.status === APPOINTMENT_STATUS.CONFIRMED || appointment.status === APPOINTMENT_STATUS.SCHEDULED) && (
                <Button size="sm" variant="outline" onClick={() => changeStatus(APPOINTMENT_STATUS.COMPLETED)} className="w-full sm:w-auto">
                  Completar
                </Button>
              )}
              {appointment.status === APPOINTMENT_STATUS.SCHEDULED && (
                <Button size="sm" onClick={() => changeStatus(APPOINTMENT_STATUS.CONFIRMED)} className="w-full sm:w-auto">
                  Confirmar
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentDetailDialog;
