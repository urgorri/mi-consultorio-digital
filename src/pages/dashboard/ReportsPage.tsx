import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { BarChart3, CalendarDays, Users, TrendingDown, TrendingUp, UserX, Percent } from "lucide-react";
import { reportsApi } from "@/services/api";
import type { ReportMetrics } from "@/services/api";

const ReportsPage = () => {
  const [metrics, setMetrics] = useState<ReportMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportsApi.getMetrics().then(res => {
      setMetrics(res.data);
      setLoading(false);
    });
  }, []);

  if (loading || !metrics) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-28 bg-muted rounded-xl animate-pulse" />)}
        </div>
      </DashboardLayout>
    );
  }

  const cards = [
    { label: "Citas este mes", value: String(metrics.appointmentsThisMonth), change: "+12%", up: true, icon: CalendarDays },
    { label: "Tasa de ocupación", value: `${metrics.occupancyRate}%`, change: "+5%", up: true, icon: BarChart3 },
    { label: "Cancelaciones", value: `${metrics.cancellationRate}%`, change: "-2%", up: false, icon: TrendingDown },
    { label: "Pacientes nuevos", value: String(metrics.newPatients), change: "+3", up: true, icon: Users },
    { label: "No asistieron", value: `${metrics.noShowRate}%`, change: "-1%", up: false, icon: UserX },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reportes</h1>
          <p className="text-sm text-muted-foreground">Métricas clave de tu práctica</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {cards.map((m) => (
            <div key={m.label} className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{m.label}</span>
                <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
                  <m.icon className="w-5 h-5 text-primary" />
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground">{m.value}</p>
              <p className={`text-xs mt-1 flex items-center gap-1 ${m.up ? "text-success" : "text-destructive"}`}>
                {m.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {m.change} vs mes anterior
              </p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl border border-border p-5">
            <h2 className="font-semibold text-foreground mb-4">Tipos de consulta</h2>
            <div className="space-y-4">
              {metrics.visitTypeBreakdown.map((v) => (
                <div key={v.type}>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-foreground">{v.type}</span>
                    <span className="text-muted-foreground">{v.count} citas ({v.percentage}%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${v.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-5">
            <h2 className="font-semibold text-foreground mb-4">Tendencia mensual</h2>
            <div className="flex items-end gap-3 h-40">
              {metrics.monthlyTrend.map((m) => {
                const maxVal = Math.max(...metrics.monthlyTrend.map(t => t.appointments));
                const height = (m.appointments / maxVal) * 100;
                return (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs text-muted-foreground">{m.appointments}</span>
                    <div className="w-full bg-muted rounded-t-md overflow-hidden flex-1 flex items-end">
                      <div className="w-full bg-primary rounded-t-md transition-all" style={{ height: `${height}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground">{m.month}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ReportsPage;
