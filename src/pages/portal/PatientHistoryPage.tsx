import { useState, useEffect } from "react";
import PatientPortalLayout from "@/components/portal/PatientPortalLayout";
import { patientPortalApi } from "@/services/api";
import type { Appointment } from "@/services/api";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { APPOINTMENT_STATUS, getAppointmentStatusLabel } from "@/features/appointments/domain/appointmentStatus";

const statusColors: Record<string, string> = {
  [APPOINTMENT_STATUS.CONFIRMED]: "bg-success/10 text-success",
  [APPOINTMENT_STATUS.PENDING]: "bg-warning/10 text-warning",
  [APPOINTMENT_STATUS.SCHEDULED]: "bg-warning/10 text-warning",
  [APPOINTMENT_STATUS.CANCELLED]: "bg-destructive/10 text-destructive",
  [APPOINTMENT_STATUS.COMPLETED]: "bg-muted text-muted-foreground",
  // Fallbacks
};

const PatientHistoryPage = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    patientPortalApi.getAppointments().then(res => {
      setAppointments(res.data);
      setLoading(false);
    });
  }, []);

  return (
    <PatientPortalLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Historial de citas</h1>
          <p className="text-sm text-muted-foreground">Todas tus citas pasadas y próximas</p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <div className="space-y-2">
            {appointments.map(apt => (
              <Link
                key={apt.id}
                to={`/portal/citas/${apt.id}`}
                className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border hover:bg-accent/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-lg bg-accent flex flex-col items-center justify-center shrink-0">
                  <span className="text-[10px] text-muted-foreground">{new Date(apt.date).toLocaleDateString("es-MX", { month: "short" }).toUpperCase()}</span>
                  <span className="text-sm font-bold text-foreground">{new Date(apt.date).getDate()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{apt.professionalName}</p>
                  <p className="text-xs text-muted-foreground">{apt.type}</p>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{apt.time}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{apt.locationName}</span>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[apt.status]}`}>
                  {getAppointmentStatusLabel(apt.status as any)}
                </span>
              </Link>
            ))}
          </div>
        )}

        {!loading && appointments.length === 0 && (
          <div className="text-center py-16">
            <CalendarDays className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No tienes citas registradas</p>
          </div>
        )}
      </div>
    </PatientPortalLayout>
  );
};

export default PatientHistoryPage;
