import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { adminApi } from "@/services/api";
import type { AuditLog } from "@/services/api";
import { Input } from "@/components/ui/input";
import { Search, FileText } from "lucide-react";

const actionColors: Record<string, string> = {
  login: "bg-success/10 text-success",
  register: "bg-primary/10 text-primary",
  "booking.create": "bg-primary/10 text-primary",
  "booking.cancel": "bg-warning/10 text-warning",
  "consultation.create": "bg-secondary/10 text-secondary-foreground",
  "patient.update": "bg-accent text-foreground",
  "settings.update": "bg-accent text-foreground",
  "user.block": "bg-destructive/10 text-destructive",
  "password.reset": "bg-warning/10 text-warning",
};

const AdminAuditPage = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getAuditLogs({ search: search || undefined }).then(res => {
      setLogs(res.data);
      setLoading(false);
    });
  }, [search]);

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Logs de auditoría</h1>
          <p className="text-sm text-muted-foreground">Registro de actividad del sistema</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por usuario, acción o detalle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="divide-y divide-border">
            {logs.map(log => (
              <div key={log.id} className="px-5 py-4 hover:bg-accent/30 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-medium text-foreground">{log.userName}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${actionColors[log.action] || "bg-muted text-muted-foreground"}`}>
                    {log.action}
                  </span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {new Date(log.timestamp).toLocaleString("es-MX", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{log.details}</p>
                <p className="text-xs text-muted-foreground mt-1">IP: {log.ipAddress} · Recurso: {log.resource}</p>
              </div>
            ))}
          </div>
        </div>

        {logs.length === 0 && (
          <div className="text-center py-16">
            <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No se encontraron registros</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminAuditPage;
