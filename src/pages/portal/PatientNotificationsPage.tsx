import { useState, useEffect } from "react";
import PatientPortalLayout from "@/components/portal/PatientPortalLayout";
import { patientPortalApi } from "@/services/api";
import type { Notification } from "@/services/api";
import { Bell, CalendarDays, AlertCircle, User, Check, Settings, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const iconMap: Record<string, typeof Bell> = {
  appointment: CalendarDays,
  cancellation: AlertCircle,
  reminder: Bell,
  patient: User,
  system: Settings,
};

const PatientNotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    patientPortalApi.getNotifications().then(res => {
      setNotifications(res.data);
      setLoading(false);
    });
  }, []);

  const handleMarkAsRead = async (id: string) => {
    const previousNotifications = [...notifications];

    // Optimistic update
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));

    try {
      const res = await patientPortalApi.markNotificationRead(id);
      if (!res.success) throw new Error();
    } catch (error) {
      setNotifications(previousNotifications);
      toast.error("Error al marcar como leída");
    }
  };

  const handleMarkAllAsRead = async () => {
    const previousNotifications = [...notifications];

    // Optimistic update
    setNotifications(notifications.map(n => ({ ...n, read: true })));

    try {
      const res = await patientPortalApi.markAllNotificationsRead();
      if (!res.success) throw new Error();
      toast.success("Todas las notificaciones marcadas como leídas");
    } catch (error) {
      setNotifications(previousNotifications);
      toast.error("Error al marcar todas como leídas");
    }
  };

  return (
    <PatientPortalLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Notificaciones</h1>
            <p className="text-sm text-muted-foreground">
              {notifications.filter(n => !n.read).length} sin leer
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-primary"
            onClick={handleMarkAllAsRead}
            disabled={notifications.every(n => n.read)}
          >
            <Check className="w-4 h-4" /> Marcar todas
          </Button>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map(n => {
              const Icon = iconMap[n.type] || Bell;
              return (
                <div
                  key={n.id}
                  className={`flex items-start gap-4 p-4 rounded-xl border transition-colors ${
                    n.read ? "border-border bg-card" : "border-primary/20 bg-primary/5"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${n.read ? "bg-muted" : "bg-primary/10"}`}>
                    <Icon className={`w-5 h-5 ${n.read ? "text-muted-foreground" : "text-primary"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{n.title}</p>
                        {!n.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                      </div>
                      {!n.read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary shrink-0"
                          onClick={() => handleMarkAsRead(n.id)}
                          title="Marcar como leída"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{n.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PatientPortalLayout>
  );
};

export default PatientNotificationsPage;
