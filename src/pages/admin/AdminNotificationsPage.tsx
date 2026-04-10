import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { adminApi } from "@/services/api";
import type { Notification } from "@/services/api";
import { Bell, CalendarDays, AlertCircle, User, Settings } from "lucide-react";

const iconMap: Record<string, typeof Bell> = {
  appointment: CalendarDays,
  cancellation: AlertCircle,
  reminder: Bell,
  patient: User,
  system: Settings,
};

const AdminNotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getNotificationLogs().then(res => {
      setNotifications(res.data);
      setLoading(false);
    });
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Logs de notificaciones</h1>
          <p className="text-sm text-muted-foreground">Registro de notificaciones enviadas</p>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="divide-y divide-border">
            {notifications.map(n => {
              const Icon = iconMap[n.type] || Bell;
              return (
                <div key={n.id} className="flex items-start gap-4 px-5 py-4 hover:bg-accent/30 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{n.title}</p>
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{n.type}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(n.createdAt).toLocaleString("es-MX", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      {" · "}
                      {n.read ? "Leída" : "No leída"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminNotificationsPage;
