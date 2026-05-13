import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { adminApi } from "@/services/api";
import type { AuditLog } from "@/services/api";
import { Input } from "@/components/ui/input";
import { Search, FileText } from "lucide-react";

const actionColors: Record<string, string> = {
  login: "bg-success/10 text-success",
  logout: "bg-muted text-muted-foreground",
  register: "bg-primary/10 text-primary",
  "hc.read": "bg-info/10 text-info",
  "hc.list": "bg-info/10 text-info",
  "hc.update": "bg-warning/10 text-warning",
  "hc.consultation.create": "bg-secondary/10 text-secondary-foreground",
  "hc.consultation.read": "bg-info/10 text-info",
  "consent.accept": "bg-success/10 text-success",
  "consent.revoke": "bg-destructive/10 text-destructive",
};

const AdminAuditPage = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [resultFilter, setResultFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getAuditLogs({ search: search || undefined }).then(res => {
      let filtered = res.data;
      if (actionFilter !== "all") {
        filtered = filtered.filter(l => l.action === actionFilter);
      }
      if (resultFilter !== "all") {
        filtered = filtered.filter(l => l.result === resultFilter);
      }
      setLogs(filtered);
      setLoading(false);
    });
  }, [search, actionFilter, resultFilter]);

  const handleExport = () => {
    const headers = ["Timestamp", "Actor", "Role", "Action", "Resource", "Result", "IP", "Device", "Details", "Reason"];
    const csvContent = [
      headers.join(","),
      ...logs.map(l => [
        l.timestamp,
        l.actor.name,
        l.actor.role,
        l.action,
        l.resource,
        l.result,
        l.ipAddress,
        l.device,
        `"${l.details || ""}"`,
        `"${l.reason || ""}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `audit-logs-${new Date().toISOString()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Logs de auditoría</h1>
            <p className="text-sm text-muted-foreground">Registro de actividad del sistema con integridad asegurada</p>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            <FileText className="w-4 h-4" />
            Exportar CSV
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
          >
            <option value="all">Todas las acciones</option>
            <option value="login">Login</option>
            <option value="hc.read">Lectura HC</option>
            <option value="hc.update">Edición HC</option>
            <option value="consent.accept">Consentimiento</option>
            <option value="consent.revoke">Revocación</option>
          </select>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={resultFilter}
            onChange={(e) => setResultFilter(e.target.value)}
          >
            <option value="all">Todos los resultados</option>
            <option value="success">Éxito</option>
            <option value="failure">Fallo</option>
          </select>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="divide-y divide-border">
            {logs.map(log => (
              <div key={log.id} className="px-5 py-4 hover:bg-accent/30 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-medium text-foreground">{log.actor.name}</span>
                  <span className="text-xs text-muted-foreground">({log.actor.role})</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${actionColors[log.action] || "bg-muted text-muted-foreground"}`}>
                    {log.action}
                  </span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${log.result === "success" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                    {log.result}
                  </span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {new Date(log.timestamp).toLocaleString("es-MX", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p className="text-sm text-foreground">{log.details}</p>
                {log.reason && (
                  <p className="text-xs text-muted-foreground mt-1 italic">Motivo: {log.reason}</p>
                )}
                <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground font-mono">
                  <span>IP: {log.ipAddress}</span>
                  <span>Device: {log.device}</span>
                  <span>Correlation: {log.correlationId}</span>
                  <span title={`Prev: ${log.previousHash}`}>Hash: {log.hash.substring(0, 8)}...</span>
                </div>
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
