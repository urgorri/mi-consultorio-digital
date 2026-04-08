import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { BarChart3, CalendarDays, Users, TrendingDown, TrendingUp } from "lucide-react";

const metrics = [
  { label: "Citas este mes", value: "87", change: "+12%", up: true, icon: CalendarDays },
  { label: "Tasa de ocupación", value: "78%", change: "+5%", up: true, icon: BarChart3 },
  { label: "Cancelaciones", value: "6%", change: "-2%", up: false, icon: TrendingDown },
  { label: "Pacientes nuevos", value: "14", change: "+3", up: true, icon: Users },
];

const visitTypeStats = [
  { type: "Consulta General", count: 42, pct: 48 },
  { type: "Seguimiento", count: 28, pct: 32 },
  { type: "Primera vez", count: 17, pct: 20 },
];

const ReportsPage = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reportes</h1>
          <p className="text-sm text-muted-foreground">Métricas clave de tu práctica</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((m) => (
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

        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="font-semibold text-foreground mb-4">Tipos de consulta</h2>
          <div className="space-y-4">
            {visitTypeStats.map((v) => (
              <div key={v.type}>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-foreground">{v.type}</span>
                  <span className="text-muted-foreground">{v.count} citas ({v.pct}%)</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${v.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ReportsPage;
