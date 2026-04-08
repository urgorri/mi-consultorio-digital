import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Bell, Check, CalendarDays, User, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const notifications = [
  { id: 1, type: "appointment", title: "Nueva cita agendada", message: "Pedro Sánchez agendó una cita para el 10 abr a las 11:00", time: "Hace 5 min", read: false },
  { id: 2, type: "cancellation", title: "Cita cancelada", message: "Ana Rodríguez canceló su cita del 9 abr a las 14:00", time: "Hace 30 min", read: false },
  { id: 3, type: "reminder", title: "Recordatorio", message: "Tienes 3 citas pendientes de confirmación para mañana", time: "Hace 1 hora", read: false },
  { id: 4, type: "patient", title: "Nuevo paciente registrado", message: "Sofía Hernández se registró en la plataforma", time: "Hace 2 horas", read: true },
  { id: 5, type: "appointment", title: "Cita confirmada", message: "Miguel Torres confirmó su cita del 8 abr a las 15:00", time: "Ayer", read: true },
];

const iconMap: Record<string, typeof Bell> = {
  appointment: CalendarDays,
  cancellation: AlertCircle,
  reminder: Bell,
  patient: User,
};

const NotificationsPage = () => {
  return (
    <DashboardLayout>
      <div className="max-w-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Notificaciones</h1>
            <p className="text-sm text-muted-foreground">
              {notifications.filter(n => !n.read).length} sin leer
            </p>
          </div>
          <Button variant="ghost" size="sm" className="gap-1 text-primary">
            <Check className="w-4 h-4" /> Marcar todas como leídas
          </Button>
        </div>

        <div className="space-y-2">
          {notifications.map((n) => {
            const Icon = iconMap[n.type] || Bell;
            return (
              <div
                key={n.id}
                className={`flex items-start gap-4 p-4 rounded-xl border transition-colors cursor-pointer ${
                  n.read
                    ? "border-border bg-card"
                    : "border-primary/20 bg-primary/5"
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  n.read ? "bg-muted" : "bg-primary/10"
                }`}>
                  <Icon className={`w-5 h-5 ${n.read ? "text-muted-foreground" : "text-primary"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-medium ${n.read ? "text-foreground" : "text-foreground"}`}>
                      {n.title}
                    </p>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{n.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NotificationsPage;
