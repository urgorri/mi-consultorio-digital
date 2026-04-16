import { useState, useEffect } from "react";
import { Bell, CalendarDays, AlertCircle, User, Settings, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { notificationsApi } from "@/services/api";
import type { Notification } from "@/services/api";
import { useNavigate } from "react-router-dom";

const iconMap: Record<string, typeof Bell> = {
  appointment: CalendarDays,
  cancellation: AlertCircle,
  reminder: Bell,
  patient: User,
  system: Settings,
};

const NotificationsDropdown = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      notificationsApi.list().then(res => setNotifications(res.data));
    }
  }, [open]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    notificationsApi.markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    notificationsApi.markAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0 max-h-[480px] flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div>
            <p className="font-semibold text-sm text-foreground">Notificaciones</p>
            <p className="text-xs text-muted-foreground">{unreadCount} sin leer</p>
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="gap-1 text-xs text-primary h-7" onClick={markAllRead}>
              <Check className="w-3 h-3" /> Marcar todas
            </Button>
          )}
        </div>
        <div className="overflow-auto flex-1">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No hay notificaciones
            </div>
          ) : (
            notifications.slice(0, 8).map(n => {
              const Icon = iconMap[n.type] || Bell;
              return (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-accent/30 ${
                    !n.read ? "bg-primary/5" : ""
                  }`}
                  onClick={() => markRead(n.id)}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    n.read ? "bg-muted" : "bg-primary/10"
                  }`}>
                    <Icon className={`w-4 h-4 ${n.read ? "text-muted-foreground" : "text-primary"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-medium text-foreground truncate">{n.title}</p>
                      {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{n.time}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
        <div className="border-t border-border px-4 py-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs text-primary"
            onClick={() => { setOpen(false); navigate("/dashboard/notificaciones"); }}
          >
            Ver todas las notificaciones
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsDropdown;
