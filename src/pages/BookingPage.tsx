import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CalendarDays,
  ArrowLeft,
  ArrowRight,
  Clock,
  User,
  CheckCircle,
  Stethoscope,
  MapPin,
  MessageSquare,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const doctors = [
  {
    id: "1",
    name: "Dra. María García",
    specialty: "Medicina General",
    location: "Consultorio Centro",
    address: "Av. Reforma 123, Col. Juárez, CDMX",
    whatsapp: "525512345678"
  },
  {
    id: "2",
    name: "Dr. Carlos Mendoza",
    specialty: "Pediatría",
    location: "Consultorio Norte",
    address: "Calle Insurgentes 456, Col. Roma, CDMX",
    whatsapp: "525587654321"
  },
  {
    id: "3",
    name: "Dra. Ana López",
    specialty: "Dermatología",
    location: "Consultorio Centro",
    address: "Av. Reforma 123, Col. Juárez, CDMX",
    whatsapp: "525512345678"
  },
];

const visitTypes = [
  { id: "seguimiento", name: "Seguimiento", duration: "20 min" },
  { id: "primera", name: "Primera vez", duration: "45 min" },
];

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
];

const daysOfWeek = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const BookingPage = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const doctor = doctors.find(d => d.id === selectedDoctor);
  const visitType = visitTypes.find(t => t.id === selectedType);

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

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-1">Selecciona un profesional</h2>
            <p className="text-sm text-muted-foreground mb-6">Elige al especialista con quien deseas agendar tu cita</p>
            <div className="space-y-3">
              {doctors.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => { setSelectedDoctor(doc.id); setStep(2); }}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                    selectedDoctor === doc.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30 bg-card"
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center shrink-0">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-foreground">{doc.name}</p>
                        <p className="text-sm text-muted-foreground">{doc.specialty}</p>
                      </div>
                      {doc.whatsapp && (
                        <a
                          href={`https://wa.me/${doc.whatsapp}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs text-primary flex items-center gap-1 hover:underline p-1"
                          title="Contactar por WhatsApp"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                    <div className="mt-1">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-primary/70" /> {doc.location}
                      </p>
                      <p className="text-xs text-muted-foreground/80 ml-4 line-clamp-1">
                        {doc.address}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-1">Tipo de consulta</h2>
            <p className="text-sm text-muted-foreground mb-6">Selecciona el motivo de tu visita</p>
            <div className="space-y-3">
              {visitTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => { setSelectedType(type.id); setStep(3); }}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left ${
                    selectedType === type.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30 bg-card"
                  }`}
                >
                  <div>
                    <p className="font-medium text-foreground">{type.name}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {type.duration}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        );
      case 3:
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
                    onClick={() => day && setSelectedDate(String(day))}
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
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => { setSelectedTime(time); setStep(4); }}
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
      case 4:
        return (
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-1">Tus datos</h2>
            <p className="text-sm text-muted-foreground mb-6">Completa tu información para confirmar la cita</p>
            <form
              onSubmit={(e) => { e.preventDefault(); setStep(5); }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Nombre</Label>
                  <Input
                    placeholder="Juan"
                    required
                    defaultValue={user?.firstName || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Apellido</Label>
                  <Input
                    placeholder="Pérez"
                    required
                    defaultValue={user?.lastName || ""}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Correo electrónico</Label>
                <Input
                  type="email"
                  placeholder="tu@correo.com"
                  required
                  defaultValue={user?.email || ""}
                />
              </div>
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input
                  type="tel"
                  placeholder="+52 55 1234 5678"
                  required
                  defaultValue={user?.phone || ""}
                />
              </div>
              <div className="space-y-2">
                <Label>Motivo de consulta (opcional)</Label>
                <Input placeholder="Describe brevemente tu motivo" />
              </div>

              <div className="bg-accent/50 rounded-xl p-4 space-y-3 text-sm">
                <div className="flex justify-between items-start">
                  <p className="font-medium text-foreground">Resumen de tu cita</p>
                  {doctor?.whatsapp && (
                    <a
                      href={`https://wa.me/${doctor.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary flex items-center gap-1 hover:underline"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                    </a>
                  )}
                </div>
                <div className="space-y-1.5 text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <User className="w-4 h-4 mt-0.5 shrink-0 text-primary/70" />
                    <div>
                      <p className="font-medium text-foreground">{doctor?.name}</p>
                      <p className="text-xs">{doctor?.location}</p>
                      <p className="text-xs">{doctor?.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 shrink-0 text-primary/70" />
                    <p>{visitType?.name} - {selectedTime} ({selectedDate} de {currentMonth})</p>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg">
                Confirmar cita
              </Button>
            </form>
          </div>
        );
      case 5:
        return (
          <div className="text-center py-8">
            <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-success" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">¡Cita confirmada!</h2>
            <div className="text-muted-foreground mb-6 space-y-2">
              <p>Tu cita ha sido agendada exitosamente.</p>
              <p className="text-sm">
                Recibirás un correo con un enlace para gestionar tu cita <span className="font-medium text-foreground">sin necesidad de iniciar sesión</span>.
              </p>
            </div>
            <div className="bg-card rounded-xl border border-border p-5 text-left space-y-3 text-sm mb-8 max-w-sm mx-auto">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-foreground">{doctor?.name}</p>
                  <p className="text-muted-foreground">{doctor?.location}</p>
                  <p className="text-muted-foreground text-xs">{doctor?.address}</p>
                </div>
                {doctor?.whatsapp && (
                  <a
                    href={`https://wa.me/${doctor.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary flex items-center gap-1 hover:underline"
                  >
                    <MessageSquare className="w-4 h-4" /> WhatsApp
                  </a>
                )}
              </div>
              <div className="pt-2 border-t border-border">
                <p className="text-muted-foreground"><span className="font-medium text-foreground">{visitType?.name}</span></p>
                <p className="text-muted-foreground">Día {selectedDate} de {currentMonth} a las {selectedTime}</p>
              </div>
            </div>
            <Link to={user ? (user.role === "paciente" ? "/portal" : "/dashboard") : "/"}>
              <Button variant="outline">Volver al inicio</Button>
            </Link>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">MiConsultorio</span>
          </Link>
          <span className="text-muted-foreground">|</span>
          <span className="text-sm text-muted-foreground">Agendar cita</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-lg">
        {step > 1 && step < 5 && (
          <button
            onClick={() => setStep(step - 1)}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Volver
          </button>
        )}

        {step < 5 && (
          <div className="flex gap-2 mb-8">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  s <= step ? "bg-primary" : "bg-border"
                }`}
              />
            ))}
          </div>
        )}

        {renderStep()}
      </div>
    </div>
  );
};

export default BookingPage;
