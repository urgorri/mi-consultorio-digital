import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Bell, Check, CalendarDays, User, AlertCircle, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { notificationsApi } from "@/services/api";
import type { Notification } from "@/services/api";

const iconMap: Record<string, typeof Bell> = {
  appointment: CalendarDays,
  cancellation: AlertCircle,
  reminder: Bell,
  patient: User,
  system: Settings,
};

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationsApi.list().then(res => {
      setNotifications(res.data);
      setLoading(false);
    });
  }, []);

  const markAllRead = () => {
    notificationsApi.markAllAsRead();
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

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
          <Button variant="ghost" size="sm" className="gap-1 text-primary" onClick={markAllRead}>
            <Check className="w-4 h-4" /> Marcar todas como leídas
          </Button>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => {
              const Icon = iconMap[n.type] || Bell;
              return (
                <div
                  key={n.id}
                  className={`flex items-start gap-4 p-4 rounded-xl border transition-colors cursor-pointer ${
                    n.read ? "border-border bg-card" : "border-primary/20 bg-primary/5"
                  }`}
                  onClick={() => {
                    notificationsApi.markAsRead(n.id);
                    setNotifications(notifications.map(x => x.id === n.id ? { ...x, read: true } : x));
                  }}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    n.read ? "bg-muted" : "bg-primary/10"
                  }`}>
                    <Icon className={`w-5 h-5 ${n.read ? "text-muted-foreground" : "text-primary"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{n.title}</p>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
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
    </DashboardLayout>
  );
};

export default NotificationsPage;
