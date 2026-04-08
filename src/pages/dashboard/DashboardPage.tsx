import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  CalendarDays,
  Users,
  Clock,
  TrendingUp,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const stats = [
  { label: "Citas hoy", value: "8", icon: CalendarDays, trend: "+2 vs ayer" },
  { label: "Pacientes activos", value: "142", icon: Users, trend: "+5 este mes" },
  { label: "Próxima cita", value: "10:30", icon: Clock, trend: "en 25 min" },
  { label: "Tasa ocupación", value: "78%", icon: TrendingUp, trend: "+12% vs semana pasada" },
];

const upcomingAppointments = [
  { time: "10:30", patient: "Laura Martínez", type: "Consulta General", status: "confirmada" },
  { time: "11:00", patient: "Pedro Sánchez", type: "Seguimiento", status: "confirmada" },
  { time: "11:30", patient: "Ana Rodríguez", type: "Primera vez", status: "pendiente" },
  { time: "14:00", patient: "Miguel Torres", type: "Consulta General", status: "confirmada" },
  { time: "14:30", patient: "Sofía Hernández", type: "Seguimiento", status: "confirmada" },
];

const alerts = [
  { message: "3 citas pendientes de confirmación", type: "warning" as const },
  { message: "Recordatorio: Actualizar horarios para la próxima semana", type: "info" as const },
];

const statusColors: Record<string, string> = {
  confirmada: "bg-success/10 text-success",
  pendiente: "bg-warning/10 text-warning",
  cancelada: "bg-destructive/10 text-destructive",
};

const DashboardPage = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Buenos días, Dra. García</h1>
          <p className="text-muted-foreground">Aquí está el resumen de tu día</p>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="space-y-2">
            {alerts.map((alert, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${
                  alert.type === "warning"
                    ? "bg-warning/5 border-warning/20 text-warning"
                    : "bg-primary/5 border-primary/20 text-primary"
                }`}
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="text-sm">{alert.message}</span>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.trend}</p>
            </div>
          ))}
        </div>

        {/* Upcoming appointments */}
        <div className="bg-card rounded-xl border border-border">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="font-semibold text-foreground">Citas de hoy</h2>
            <Link to="/dashboard/agenda">
              <Button variant="ghost" size="sm" className="gap-1 text-primary">
                Ver agenda <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="divide-y divide-border">
            {upcomingAppointments.map((apt, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4 hover:bg-accent/30 transition-colors">
                <div className="text-center min-w-[50px]">
                  <p className="text-sm font-semibold text-foreground">{apt.time}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{apt.patient}</p>
                  <p className="text-sm text-muted-foreground">{apt.type}</p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[apt.status]}`}>
                  {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
