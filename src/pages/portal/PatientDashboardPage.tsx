import { useState, useEffect } from "react";
import PatientPortalLayout from "@/components/portal/PatientPortalLayout";
import { CalendarDays, Clock, MapPin, ArrowRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { patientPortalApi } from "@/services/api";
import type { Appointment } from "@/services/api";
import { APPOINTMENT_STATUS, getAppointmentStatusLabel } from "@/features/appointments/domain/appointmentStatus";

const statusColors: Record<string, string> = {
  [APPOINTMENT_STATUS.CONFIRMED]: "bg-success/10 text-success",
  [APPOINTMENT_STATUS.PENDING]: "bg-warning/10 text-warning",
  [APPOINTMENT_STATUS.SCHEDULED]: "bg-warning/10 text-warning",
  [APPOINTMENT_STATUS.CANCELLED]: "bg-destructive/10 text-destructive",
  [APPOINTMENT_STATUS.COMPLETED]: "bg-muted text-muted-foreground",
  // Fallbacks
};

const PatientDashboardPage = () => {
  const [upcoming, setUpcoming] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    patientPortalApi.getDashboard().then(res => {
      setUpcoming(res.data.upcoming);
      setLoading(false);
    });
  }, []);

  return (
    <PatientPortalLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Hola, Laura</h1>
            <p className="text-muted-foreground">Aquí tienes el resumen de tus citas</p>
          </div>
          <Link to="/agendar">
            <Button className="gap-1">
              <Plus className="w-4 h-4" /> Agendar cita
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        ) : upcoming.length === 0 ? (
          <div className="text-center py-16">
            <CalendarDays className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">No tienes citas próximas</p>
            <p className="text-sm text-muted-foreground mb-4">Agenda una cita con tu profesional de salud</p>
            <Link to="/agendar">
              <Button>Agendar cita</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <h2 className="font-semibold text-foreground">Próximas citas</h2>
            {upcoming.map(apt => (
              <Link
                key={apt.id}
                to={`/portal/citas/${apt.id}`}
                className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border hover:border-primary/30 transition-colors"
              >
                <div className="w-14 h-14 rounded-xl bg-accent flex flex-col items-center justify-center shrink-0">
                  <span className="text-xs text-muted-foreground">{new Date(apt.date).toLocaleDateString("es-MX", { month: "short" }).toUpperCase()}</span>
                  <span className="text-lg font-bold text-foreground">{new Date(apt.date).getDate()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{apt.professionalName}</p>
                  <p className="text-sm text-muted-foreground">{apt.type}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{apt.time}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{apt.locationName}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[apt.status]}`}>
                    {getAppointmentStatusLabel(apt.status as any)}
                  </span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PatientPortalLayout>
  );
};

export default PatientDashboardPage;
