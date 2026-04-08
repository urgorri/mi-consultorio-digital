import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus, Clock } from "lucide-react";

type ViewType = "dia" | "semana" | "mes";

const todayAppointments = [
  { time: "09:00", end: "09:30", patient: "Carlos Ruiz", type: "General", status: "confirmada" },
  { time: "09:30", end: "10:00", patient: "María Santos", type: "Seguimiento", status: "confirmada" },
  { time: "10:30", end: "11:00", patient: "Laura Martínez", type: "General", status: "confirmada" },
  { time: "11:00", end: "11:30", patient: "Pedro Sánchez", type: "Seguimiento", status: "pendiente" },
  { time: "14:00", end: "14:45", patient: "Ana Rodríguez", type: "Primera vez", status: "confirmada" },
  { time: "15:00", end: "15:30", patient: "Miguel Torres", type: "General", status: "confirmada" },
];

const hours = Array.from({ length: 10 }, (_, i) => `${(i + 8).toString().padStart(2, "0")}:00`);

const statusColors: Record<string, string> = {
  confirmada: "bg-primary/10 border-primary/30 text-primary",
  pendiente: "bg-warning/10 border-warning/30 text-warning",
};

const AgendaPage = () => {
  const [view, setView] = useState<ViewType>("dia");
  const today = new Date();
  const formattedDate = today.toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

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
            <Button size="sm" className="gap-1">
              <Plus className="w-4 h-4" /> Nueva cita
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm">Hoy</Button>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Day view */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="divide-y divide-border">
            {hours.map((hour) => {
              const apt = todayAppointments.find((a) => a.time.startsWith(hour.slice(0, 2)));
              return (
                <div key={hour} className="flex min-h-[72px]">
                  <div className="w-20 shrink-0 px-3 py-3 text-sm text-muted-foreground border-r border-border">
                    {hour}
                  </div>
                  <div className="flex-1 p-2">
                    {apt && (
                      <div className={`p-3 rounded-lg border ${statusColors[apt.status]} cursor-pointer hover:opacity-90 transition-opacity`}>
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{apt.patient}</p>
                          <span className="text-xs">{apt.type}</span>
                        </div>
                        <p className="text-xs mt-1 flex items-center gap-1 opacity-70">
                          <Clock className="w-3 h-3" /> {apt.time} - {apt.end}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AgendaPage;
