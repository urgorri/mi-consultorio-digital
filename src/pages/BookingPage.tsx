import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  CheckCircle,
  Stethoscope,
  MessageSquare,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { appointmentsAdapter } from "@/features/appointments/api/appointmentsAdapter";
import { DoctorSelector } from "@/features/appointments/ui/DoctorSelector";
import { VisitTypeSelector } from "@/features/appointments/ui/VisitTypeSelector";
import { SlotSelector } from "@/features/appointments/ui/SlotSelector";
import { PatientDataForm } from "@/features/appointments/ui/PatientDataForm";

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  location: string;
  address: string;
  whatsapp?: string;
}

interface VisitType {
  id: string;
  name: string;
  duration: string;
}

const BookingPage = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [visitTypes, setVisitTypes] = useState<VisitType[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [selectedTypeId, setSelectedTypeId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [confirmedType, setConfirmedType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [docs, types] = await Promise.all([
          appointmentsAdapter.getDoctors(),
          appointmentsAdapter.getVisitTypes()
        ]);
        setDoctors(docs);
        setVisitTypes(types);
      } catch (error) {
        console.error("Error fetching booking data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedDoctorId && selectedDate) {
      const fetchSlots = async () => {
        // Formatear fecha para el API (YYYY-MM-DD)
        const today = new Date();
        const year = today.getFullYear();
        const month = (today.getMonth() + 1).toString().padStart(2, "0");
        const formattedDate = `${year}-${month}-${selectedDate.padStart(2, "0")}`;

        try {
          const slots = await appointmentsAdapter.getAvailableSlots(selectedDoctorId, formattedDate);
          setAvailableSlots(slots);
        } catch (error) {
          console.error("Error fetching available slots:", error);
        }
      };
      fetchSlots();
    }
  }, [selectedDoctorId, selectedDate]);

  const doctor = doctors.find(d => d.id === selectedDoctorId);
  const visitType = visitTypes.find(t => t.id === selectedTypeId);

  const today = new Date();
  const currentMonth = today.toLocaleDateString("es-MX", { month: "long", year: "numeric" });

  const handleBookingSubmit = async (patientData: Record<string, unknown>) => {
    try {
      const today = new Date();
      const year = today.getFullYear();
      const month = (today.getMonth() + 1).toString().padStart(2, "0");
      const formattedDate = `${year}-${month}-${selectedDate.padStart(2, "0")}`;

      const result = await appointmentsAdapter.createBooking({
        professionalId: selectedDoctorId,
        typeId: selectedTypeId,
        date: formattedDate,
        time: selectedTime,
        patientData
      });

      if (result && (result as any).type) {
        setConfirmedType((result as any).type);
      }

      setStep(4);
    } catch (error) {
      console.error("Error creating booking:", error);
    }
  };

  const renderStep = () => {
    if (isLoading) {
      return <div className="text-center py-8">Cargando...</div>;
    }

    switch (step) {
      case 1:
        return (
          <DoctorSelector
            doctors={doctors}
            selectedDoctorId={selectedDoctorId}
            onSelect={(id) => { setSelectedDoctorId(id); setStep(2); }}
          />
        );
      case 2:
        return (
          <SlotSelector
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            onDateSelect={setSelectedDate}
            onTimeSelect={(time) => { setSelectedTime(time); setStep(3); }}
            availableSlots={availableSlots}
          />
        );
      case 3:
        return (
          <PatientDataForm
            user={user}
            doctor={doctor}
            visitType={visitType}
            selectedTime={selectedTime}
            selectedDate={selectedDate}
            currentMonth={currentMonth}
            onSubmit={handleBookingSubmit}
          />
        );
      case 4:
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
                <p className="text-muted-foreground"><span className="font-medium text-foreground">{confirmedType || visitType?.name}</span></p>
                <p className="text-muted-foreground">Día {selectedDate} de {currentMonth} a las {selectedTime}</p>
              </div>
            </div>
            <Link to={user ? (user.role === "paciente" ? "/portal" : "/dashboard") : "/"}>
              <Button variant="outline">Volver al inicio</Button>
            </Link>
          </div>
        );
      default:
        return null;
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
        {step > 1 && step < 4 && (
          <button
            onClick={() => setStep(step - 1)}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Volver
          </button>
        )}

        {step < 4 && (
          <div className="flex gap-2 mb-8">
            {[1, 2, 3].map((s) => (
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
