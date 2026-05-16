import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SlotSelectorProps {
  selectedDate: string; // ISO YYYY-MM-DD
  selectedTime: string;
  onDateSelect: (date: string) => void;
  onTimeSelect: (time: string) => void;
  availableSlots: string[];
}

const daysOfWeek = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export const SlotSelector = ({
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect,
  availableSlots
}: SlotSelectorProps) => {
  const today = new Date();
  const [currentView, setCurrentView] = useState(() => {
    // Si hay una fecha seleccionada, iniciar vista en ese mes, sino en el actual
    const initial = selectedDate ? new Date(selectedDate + "T12:00:00") : today;
    return new Date(initial.getFullYear(), initial.getMonth(), 1);
  });

  const viewYear = currentView.getFullYear();
  const viewMonth = currentView.getMonth();

  const currentMonthLabel = currentView.toLocaleDateString("es-MX", { month: "long", year: "numeric" });

  const generateCalendarDays = () => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const offset = firstDay === 0 ? 6 : firstDay - 1;
    const days: (Date | null)[] = [];
    for (let i = 0; i < offset; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(viewYear, viewMonth, i));
    }
    return days;
  };

  const calendarDays = generateCalendarDays();

  const handlePrevMonth = () => {
    setCurrentView(new Date(viewYear, viewMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentView(new Date(viewYear, viewMonth + 1, 1));
  };

  const toISODate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const isPast = (date: Date) => {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d < today;
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-foreground mb-1">Fecha y hora</h2>
      <p className="text-sm text-muted-foreground mb-6">Elige un horario disponible</p>
      <div className="bg-card rounded-xl border border-border p-4 mb-6">
        <div className="flex items-center justify-between mb-4 px-2">
          <button
            onClick={handlePrevMonth}
            disabled={viewYear <= today.getFullYear() && viewMonth <= today.getMonth()}
            className="p-1 hover:bg-accent rounded-full disabled:opacity-30 transition-colors"
            title="Mes anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <p className="font-medium text-foreground capitalize">{currentMonthLabel}</p>
          <button
            onClick={handleNextMonth}
            className="p-1 hover:bg-accent rounded-full transition-colors"
            title="Mes siguiente"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground mb-2">
          {daysOfWeek.map((d) => <div key={d} className="py-1">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, i) => {
            const dateISO = day ? toISODate(day) : null;
            const past = day ? isPast(day) : true;

            return (
              <button
                key={i}
                disabled={!day || past}
                onClick={() => dateISO && onDateSelect(dateISO)}
                className={`aspect-square rounded-lg text-sm flex items-center justify-center transition-all ${
                  !day
                    ? ""
                    : past
                    ? "text-muted-foreground/30"
                    : selectedDate === dateISO
                    ? "bg-primary text-primary-foreground font-medium"
                    : "hover:bg-accent text-foreground"
                }`}
              >
                {day?.getDate()}
              </button>
            );
          })}
        </div>
      </div>
      {selectedDate && (
        <div>
          <p className="text-sm font-medium text-foreground mb-3">Horarios disponibles</p>
          <div className="grid grid-cols-3 gap-2">
            {availableSlots.map((time) => (
              <button
                key={time}
                onClick={() => onTimeSelect(time)}
                className={`py-2.5 px-3 rounded-lg text-sm font-medium border transition-all ${
                  selectedTime === time
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:border-primary/30"
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
