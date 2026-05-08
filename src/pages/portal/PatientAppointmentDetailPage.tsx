import { useState, useEffect } from "react";
import PatientPortalLayout from "@/components/portal/PatientPortalLayout";
import { useParams, Link } from "react-router-dom";
import { appointmentsApi } from "@/services/api";
import type { Appointment } from "@/services/api";
import { Button } from "@/components/ui/button";
import { canCancelAppointment, canRescheduleAppointment } from "@/lib/utils";
import { ArrowLeft, CalendarDays, Clock, MapPin, User, AlertCircle } from "lucide-react";

const statusColors: Record<string, string> = {
  confirmada: "bg-success/10 text-success",
  pendiente: "bg-warning/10 text-warning",
  cancelada: "bg-destructive/10 text-destructive",
  completada: "bg-muted text-muted-foreground",
};

interface PatientAppointmentDetailPageProps {
  isPublic?: boolean;
}

const PatientAppointmentDetailPage = ({ isPublic = false }: PatientAppointmentDetailPageProps) => {
  const { id, token } = useParams();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        setLoading(true);
        setError(null);
        if (isPublic && token) {
          const res = await appointmentsApi.getByToken(token);
          setAppointment(res.data);
        } else if (id) {
          const res = await appointmentsApi.getById(id);
          setAppointment(res.data);
        }
      } catch (err: any) {
        setError(err.message || "Error al cargar la cita");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [id, token, isPublic]);

  const handleConfirm = async () => {
    if (!appointment) return;
    try {
      const res = await appointmentsApi.update(appointment.id, {
        status: "confirmada",
        confirmationSource: "paciente"
      });
      setAppointment(res.data);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleCancel = async () => {
    if (!appointment) return;
    try {
      await appointmentsApi.cancel(appointment.id);
      setAppointment({ ...appointment, status: "cancelada" });
    } catch (err: any) {
      console.error(err);
    }
  };

  if (loading) {
    const Skeleton = () => (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="h-48 bg-muted rounded-xl animate-pulse" />
      </div>
    );

    if (isPublic) {
      return (
        <div className="min-h-screen bg-background p-4 md:p-8 max-w-2xl mx-auto">
          <Skeleton />
        </div>
      );
    }

    return (
      <PatientPortalLayout>
        <div className="space-y-4">
          <div className="h-8 w-48 bg-muted rounded animate-pulse" />
          <div className="h-48 bg-muted rounded-xl animate-pulse" />
        </div>
      </PatientPortalLayout>
    );
  }

  if (!appointment || error) {
    const ErrorView = () => (
      <div className="text-center py-16">
        <AlertCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-muted-foreground">{error || "Cita no encontrada"}</p>
        {!isPublic && (
          <Link to="/portal">
            <Button variant="outline" className="mt-4">Volver</Button>
          </Link>
        )}
      </div>
    );

    if (isPublic) {
      return (
        <div className="min-h-screen bg-background p-4 md:p-8 max-w-2xl mx-auto">
          <div className="flex justify-center mb-8">
            <h1 className="text-2xl font-bold text-primary">MiConsultorio</h1>
          </div>
          <ErrorView />
        </div>
      );
    }

    return (
      <PatientPortalLayout>
        <ErrorView />
      </PatientPortalLayout>
    );
  }

  const isPast = appointment.status === "completada" || appointment.status === "cancelada";

  const content = (
      <div className={`space-y-6 ${isPublic ? "max-w-2xl mx-auto" : ""}`}>
        {isPublic && (
          <div className="flex justify-center mb-4">
            <h1 className="text-2xl font-bold text-primary">MiConsultorio</h1>
          </div>
        )}
        <div className="flex items-center gap-3">
          {!isPublic && (
            <Link to="/portal">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">Detalle de cita</h1>
          </div>
          <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${statusColors[appointment.status]}`}>
            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
          </span>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center">
              <User className="w-7 h-7 text-primary" />
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">{appointment.professionalName}</p>
              <p className="text-sm text-muted-foreground">{appointment.type}</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 pt-2">
            <div className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg">
              <CalendarDays className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Fecha</p>
                <p className="text-sm font-medium text-foreground">
                  {new Date(appointment.date).toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg">
              <Clock className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Hora</p>
                <p className="text-sm font-medium text-foreground">{appointment.time} - {appointment.endTime}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg">
              <MapPin className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Ubicación</p>
                <p className="text-sm font-medium text-foreground">{appointment.locationName}</p>
              </div>
            </div>
          </div>

          {appointment.reason && (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Motivo</p>
              <p className="text-sm text-foreground">{appointment.reason}</p>
            </div>
          )}
        </div>

        {!isPast && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-3">
              {appointment.status === "pendiente" && (
                <Button className="flex-1" onClick={handleConfirm}>Confirmar cita</Button>
              )}
              <Button
                variant="outline"
                className="flex-1"
                disabled={!canRescheduleAppointment(appointment)}
              >
                Reprogramar
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleCancel}
                disabled={!canCancelAppointment(appointment)}
              >
                Cancelar cita
              </Button>
            </div>
            {(!canCancelAppointment(appointment) || !canRescheduleAppointment(appointment)) && (
              <div className="flex items-center gap-2 text-destructive bg-destructive/5 border border-destructive/20 p-3 rounded-lg text-sm">
                <AlertCircle className="w-4 h-4" />
                <p>Las modificaciones solo están permitidas hasta {appointment.cancellationDeadlineHours ?? 24} h antes de la cita.</p>
              </div>
            )}
          </div>
        )}
      </div>
  );

  if (isPublic) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        {content}
      </div>
    );
  }

  return (
    <PatientPortalLayout>
      {content}
    </PatientPortalLayout>
  );
};

export default PatientAppointmentDetailPage;
