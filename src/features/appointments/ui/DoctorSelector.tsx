import { User, MessageSquare, MapPin, ArrowRight } from "lucide-react";

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  location: string;
  address: string;
  whatsapp?: string;
}

interface DoctorSelectorProps {
  doctors: Doctor[];
  selectedDoctorId: string;
  onSelect: (doctorId: string) => void;
}

export const DoctorSelector = ({ doctors, selectedDoctorId, onSelect }: DoctorSelectorProps) => {
  return (
    <div>
      <h2 className="text-xl font-semibold text-foreground mb-1">Selecciona un profesional</h2>
      <p className="text-sm text-muted-foreground mb-6">Elige al especialista con quien deseas agendar tu cita</p>
      <div className="space-y-3">
        {doctors.map((doc) => (
          <button
            key={doc.id}
            onClick={() => onSelect(doc.id)}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
              selectedDoctorId === doc.id
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
};
