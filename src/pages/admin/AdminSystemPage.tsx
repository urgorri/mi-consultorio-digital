import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { adminApi } from "@/services/api";
import type { SystemHealth } from "@/services/api";
import { Activity, Users, Zap, Clock, CheckCircle, XCircle } from "lucide-react";

const AdminSystemPage = () => {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getSystemHealth().then(res => {
      setHealth(res.data);
      setLoading(false);
    });
  }, []);

  if (loading || !health) {
    return (
      <AdminLayout>
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />)}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Estado del sistema</h1>
          <p className="text-sm text-muted-foreground">Monitoreo y salud de la plataforma</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Estado</span>
              <div className="w-9 h-9 rounded-lg bg-success/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-success" />
              </div>
            </div>
            <p className="text-xl font-bold text-success capitalize">{health.status === "healthy" ? "Saludable" : health.status}</p>
            <p className="text-xs text-muted-foreground mt-1">Uptime: {health.uptime}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Usuarios activos</span>
              <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground">{health.activeUsers}</p>
            <p className="text-xs text-muted-foreground mt-1">En este momento</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Solicitudes hoy</span>
              <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground">{health.totalRequests.toLocaleString()}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Latencia promedio</span>
              <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground">{health.avgResponseTime}ms</p>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="font-semibold text-foreground mb-4">Servicios</h2>
          <div className="space-y-3">
            {health.services.map(s => (
              <div key={s.name} className="flex items-center gap-4 p-3 rounded-lg border border-border">
                {s.status === "up" ? (
                  <CheckCircle className="w-5 h-5 text-success shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-destructive shrink-0" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{s.name}</p>
                </div>
                <span className="text-sm text-muted-foreground">{s.latency}ms</span>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  s.status === "up" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                }`}>
                  {s.status === "up" ? "Activo" : "Caído"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSystemPage;
