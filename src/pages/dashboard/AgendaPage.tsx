import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus, Clock } from "lucide-react";
import { appointmentsApi } from "@/services/api";
import type { Appointment } from "@/services/api";
import NewAppointmentDialog from "@/components/dialogs/NewAppointmentDialog";
import AppointmentDetailDialog from "@/components/dialogs/AppointmentDetailDialog";
import ClinicBadge from "@/components/dashboard/ClinicBadge";
import { useClinicFilter } from "@/contexts/ClinicFilterContext";

type ViewType = "dia" | "semana" | "mes";

const hours = Array.from({ length: 10 }, (_, i) => `${(i + 8).toString().padStart(2, "0")}:00`);
const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const statusColors: Record<string, string> = {
  confirmada: "bg-primary/10 border-primary/30 text-primary",
  pendiente: "bg-warning/10 border-warning/30 text-warning",
  completada: "bg-success/10 border-success/30 text-success",
  cancelada: "bg-destructive/10 border-destructive/30 text-destructive",
};

const AgendaPage = () => {
  const [view, setView] = useState<ViewType>("dia");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [newOpen, setNewOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const { matchesFilter } = useClinicFilter();

  useEffect(() => {
    appointmentsApi.list().then(res => setAllAppointments(res.data));
  }, []);

  const appointments = useMemo(
    () => allAppointments.filter(a => matchesFilter({ clinicId: a.clinicId })),
    [allAppointments, matchesFilter]
  );

  const formatDate = (d: Date) => d.toISOString().split("T")[0];

  const navigate = (dir: number) => {
    const d = new Date(currentDate);
    if (view === "dia") d.setDate(d.getDate() + dir);
    else if (view === "semana") d.setDate(d.getDate() + dir * 7);
    else d.setMonth(d.getMonth() + dir);
    setCurrentDate(d);
  };

  const formattedDate = currentDate.toLocaleDateString("es-MX", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const todayAppts = appointments.filter(a => a.date === formatDate(currentDate));

  const getWeekDates = () => {
    const d = new Date(currentDate);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(d);
    monday.setDate(d.getDate() + diff);
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      return date;
    });
  };

  const getMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const offset = firstDay === 0 ? 6 : firstDay - 1;
    const days: (Date | null)[] = [];
    for (let i = 0; i < offset; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  };

  const openApptDetail = (apt: Appointment) => {
    setSelectedAppt(apt);
    setDetailOpen(true);
  };

  const handleStatusChange = (id: string, status: Appointment["status"]) => {
    setAllAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Agenda</h1>
            <p className="text-sm text-muted-foreground capitalize">{formattedDate}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1 p-1 bg-muted rounded-lg">
              {(["dia", "semana", "mes"] as ViewType[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                    view === v ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
            <Button size="sm" className="gap-1" onClick={() => setNewOpen(true)}>
              <Plus className="w-4 h-4" /> Nueva cita
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigate(-1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>Hoy</Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigate(1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Day view */}
        {view === "dia" && (
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="divide-y divide-border">
              {hours.map((hour) => {
                const hourAppts = todayAppts.filter(a => a.time.startsWith(hour.slice(0, 2)));
                return (
                  <div key={hour} className="flex min-h-[72px]">
                    <div className="w-20 shrink-0 px-3 py-3 text-sm text-muted-foreground border-r border-border">
                      {hour}
                    </div>
                    <div className="flex-1 p-2 space-y-1">
                      {hourAppts.map(apt => (
                        <div
                          key={apt.id}
                          onClick={() => openApptDetail(apt)}
                          className={`p-3 rounded-lg border ${statusColors[apt.status]} cursor-pointer hover:opacity-90 transition-opacity`}
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{apt.patientName}</p>
                            <span className="text-xs">{apt.type}</span>
                          </div>
                          <p className="text-xs mt-1 flex items-center gap-1 opacity-70">
                            <Clock className="w-3 h-3" /> {apt.time} - {apt.endTime}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Week view */}
        {view === "semana" && (
          <div className="bg-card rounded-xl border border-border overflow-hidden overflow-x-auto">
            <div className="grid grid-cols-[80px_repeat(7,1fr)] min-w-[800px]">
              <div className="border-b border-r border-border p-2" />
              {getWeekDates().map((date, i) => {
                const isToday = formatDate(date) === formatDate(new Date());
                return (
                  <div key={i} className={`border-b border-r border-border p-2 text-center ${isToday ? "bg-primary/5" : ""}`}>
                    <p className="text-xs text-muted-foreground">{weekDays[i]}</p>
                    <p className={`text-sm font-semibold ${isToday ? "text-primary" : "text-foreground"}`}>{date.getDate()}</p>
                  </div>
                );
              })}
              {hours.slice(0, 8).map(hour => (
                <div key={hour} className="contents">
                  <div className="border-r border-b border-border px-2 py-3 text-xs text-muted-foreground">
                    {hour}
                  </div>
                  {getWeekDates().map((date, di) => {
                    const dayAppts = appointments.filter(a => a.date === formatDate(date) && a.time.startsWith(hour.slice(0, 2)));
                    return (
                      <div key={`${hour}-${di}`} className="border-r border-b border-border p-1 min-h-[60px]">
                        {dayAppts.map(apt => (
                          <div
                            key={apt.id}
                            onClick={() => openApptDetail(apt)}
                            className={`p-1.5 rounded text-xs border mb-1 cursor-pointer hover:opacity-80 ${statusColors[apt.status]}`}
                          >
                            <p className="font-medium truncate">{apt.patientName}</p>
                            <p className="opacity-70">{apt.time}</p>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Month view */}
        {view === "mes" && (
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="p-4 text-center border-b border-border">
              <p className="font-semibold text-foreground capitalize">
                {currentDate.toLocaleDateString("es-MX", { month: "long", year: "numeric" })}
              </p>
            </div>
            <div className="grid grid-cols-7">
              {weekDays.map(d => (
                <div key={d} className="border-b border-r border-border p-2 text-center text-xs font-medium text-muted-foreground">
                  {d}
                </div>
              ))}
              {getMonthDays().map((date, i) => {
                const dayAppts = date ? appointments.filter(a => a.date === formatDate(date)) : [];
                const isToday = date && formatDate(date) === formatDate(new Date());
                return (
                  <div
                    key={i}
                    className={`border-b border-r border-border p-2 min-h-[80px] ${!date ? "bg-muted/30" : ""} ${isToday ? "bg-primary/5" : ""}`}
                  >
                    {date && (
                      <>
                        <p className={`text-sm mb-1 ${isToday ? "font-bold text-primary" : "text-foreground"}`}>
                          {date.getDate()}
                        </p>
                        {dayAppts.slice(0, 2).map(apt => (
                          <div
                            key={apt.id}
                            onClick={() => openApptDetail(apt)}
                            className={`text-xs p-1 rounded mb-0.5 truncate cursor-pointer hover:opacity-80 ${statusColors[apt.status]}`}
                          >
                            {apt.time} {apt.patientName.split(" ")[0]}
                          </div>
                        ))}
                        {dayAppts.length > 2 && (
                          <p className="text-xs text-muted-foreground">+{dayAppts.length - 2} más</p>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <NewAppointmentDialog
        open={newOpen}
        onOpenChange={setNewOpen}
        defaultDate={formatDate(currentDate)}
        onCreated={(apt) => setAppointments(prev => [...prev, apt])}
      />

      <AppointmentDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        appointment={selectedAppt}
        onStatusChange={handleStatusChange}
      />
    </DashboardLayout>
  );
};

export default AgendaPage;
