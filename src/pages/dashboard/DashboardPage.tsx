import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  CalendarDays, Users, Clock, TrendingUp, ArrowRight, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { dashboardApi } from "@/services/api";
import type { Appointment, DashboardStats } from "@/services/api";
import AppointmentDetailDialog from "@/components/dialogs/AppointmentDetailDialog";
import PremiumUpgradeDialog from "@/components/dialogs/PremiumUpgradeDialog";
import { Zap } from "lucide-react";

const statusColors: Record<string, string> = {
  confirmada: "bg-success/10 text-success",
  pendiente: "bg-warning/10 text-warning",
  cancelada: "bg-destructive/10 text-destructive",
};

const DashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [alerts, setAlerts] = useState<{ message: string; type: "warning" | "info" }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [premiumOpen, setPremiumOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      dashboardApi.getStats(),
      dashboardApi.getTodayAppointments(),
      dashboardApi.getAlerts(),
    ]).then(([statsRes, aptsRes, alertsRes]) => {
      setStats(statsRes.data);
      setAppointments(aptsRes.data);
      setAlerts(alertsRes.data);
      setLoading(false);
    });
  }, []);

  const statCards = stats ? [
    { label: "Citas hoy", value: String(stats.appointmentsToday), icon: CalendarDays, trend: stats.appointmentsTrend },
    { label: "Pacientes activos", value: String(stats.activePatients), icon: Users, trend: stats.patientsTrend },
    { label: "Próxima cita", value: stats.nextAppointmentTime, icon: Clock, trend: "en 25 min" },
    { label: "Tasa ocupación", value: `${stats.occupancyRate}%`, icon: TrendingUp, trend: stats.occupancyTrend },
  ] : [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Buenos días, Dra. Pérez</h1>
            <p className="text-muted-foreground">Aquí está el resumen de tu día</p>
          </div>
          <div
            className="bg-primary/10 border border-primary/20 rounded-xl px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-primary/15 transition-colors group"
            onClick={() => setPremiumOpen(true)}
          >
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5 text-primary fill-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-primary">Prueba WhatsApp Premium</p>
              <p className="text-xs text-primary/80">Reduce ausentismo hoy mismo</p>
            </div>
          </div>
        </div>

        {alerts.length > 0 && (
          <div className="space-y-2">
            {alerts.map((alert, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${
                  alert.type === "warning"
                    ? "bg-warning/5 border-warning/20 text-warning"
                    : "bg-primary/5 border-primary/20 text-primary"
                }`}
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="text-sm">{alert.message}</span>
              </div>
            ))}
          </div>
        )}

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-muted rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat) => (
              <div key={stat.label} className="bg-card rounded-xl border border-border p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                  <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.trend}</p>
              </div>
            ))}
          </div>
        )}

        <div className="bg-card rounded-xl border border-border">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="font-semibold text-foreground">Citas de hoy</h2>
            <Link to="/dashboard/agenda">
              <Button variant="ghost" size="sm" className="gap-1 text-primary">
                Ver agenda <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="divide-y divide-border">
            {appointments.map((apt) => (
              <div
                key={apt.id}
                className="flex items-center gap-4 px-5 py-4 hover:bg-accent/30 transition-colors cursor-pointer"
                onClick={() => {
                  setSelectedAppt(apt);
                  setDetailOpen(true);
                }}
              >
                <div className="text-center min-w-[50px]">
                  <p className="text-sm font-semibold text-foreground">{apt.time}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{apt.patientName}</p>
                  <p className="text-sm text-muted-foreground">{apt.type}</p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[apt.status]}`}>
                  {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AppointmentDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        appointment={selectedAppt}
        onStatusChange={(id, status) => {
          setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
        }}
      />
      <PremiumUpgradeDialog open={premiumOpen} onOpenChange={setPremiumOpen} />
    </DashboardLayout>
  );
};

export default DashboardPage;
