import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Clock, MessageSquare } from "lucide-react";
import type { User as UserType } from "@/services/api/types";

interface PatientDataFormProps {
  user: UserType | null;
  doctor: {
    name: string;
    location: string;
    address: string;
    whatsapp?: string;
  } | undefined;
  visitType: {
    name: string;
  } | undefined;
  selectedTime: string;
  selectedDate: string;
  currentMonth: string;
  onSubmit: (data: Record<string, unknown>) => void;
}

export const PatientDataForm = ({
  user,
  doctor,
  visitType,
  selectedTime,
  selectedDate,
  currentMonth,
  onSubmit
}: PatientDataFormProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());
    onSubmit(data as Record<string, unknown>);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-foreground mb-1">Tus datos</h2>
      <p className="text-sm text-muted-foreground mb-6">Completa tu información para confirmar la cita</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="firstName">Nombre</Label>
            <Input
              id="firstName"
              name="firstName"
              placeholder="Juan"
              required
              defaultValue={user?.firstName || ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Apellido</Label>
            <Input
              id="lastName"
              name="lastName"
              placeholder="Pérez"
              required
              defaultValue={user?.lastName || ""}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="tu@correo.com"
            required
            defaultValue={user?.email || ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder=""
            required
            defaultValue={user?.phone || ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reason">Motivo de consulta (opcional)</Label>
          <Input id="reason" name="reason" placeholder="Describe brevemente tu motivo" />
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
              <p>{visitType?.name || "Determinado automáticamente"} - {selectedTime} ({selectedDate} de {currentMonth})</p>
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full" size="lg">
          Confirmar cita
        </Button>
      </form>
    </div>
  );
};
