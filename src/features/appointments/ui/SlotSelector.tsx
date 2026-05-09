interface SlotSelectorProps {
  selectedDate: string;
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
  const currentMonth = today.toLocaleDateString("es-MX", { month: "long", year: "numeric" });

  const generateCalendarDays = () => {
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const offset = firstDay === 0 ? 6 : firstDay - 1;
    const days: (number | null)[] = [];
    for (let i = 0; i < offset; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  };

  const calendarDays = generateCalendarDays();

  return (
    <div>
      <h2 className="text-xl font-semibold text-foreground mb-1">Fecha y hora</h2>
      <p className="text-sm text-muted-foreground mb-6">Elige un horario disponible</p>
      <div className="bg-card rounded-xl border border-border p-4 mb-6">
        <p className="text-center font-medium text-foreground capitalize mb-4">{currentMonth}</p>
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground mb-2">
          {daysOfWeek.map((d) => <div key={d} className="py-1">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, i) => (
            <button
              key={i}
              disabled={!day || day < today.getDate()}
              onClick={() => day && onDateSelect(String(day))}
              className={`aspect-square rounded-lg text-sm flex items-center justify-center transition-all ${
                !day
                  ? ""
                  : day < today.getDate()
                  ? "text-muted-foreground/30"
                  : selectedDate === String(day)
                  ? "bg-primary text-primary-foreground font-medium"
                  : "hover:bg-accent text-foreground"
              }`}
            >
              {day}
            </button>
          ))}
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
