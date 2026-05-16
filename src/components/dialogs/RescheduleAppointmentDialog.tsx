import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SlotSelector } from "@/features/appointments/ui/SlotSelector";
import { appointmentsApi } from "@/services/api";
import type { Appointment } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { parse, addMinutes, format } from "date-fns";

interface RescheduleAppointmentDialogProps {
  appointment: Appointment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (updatedAppointment: Appointment) => void;
}

export const RescheduleAppointmentDialog = ({
  appointment,
  open,
  onOpenChange,
  onSuccess,
}: RescheduleAppointmentDialogProps) => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && selectedDate) {
      const fetchSlots = async () => {
        setLoadingSlots(true);
        try {
          // Format date for API (YYYY-MM-DD)
          const today = new Date();
          const year = today.getFullYear();
          const month = (today.getMonth() + 1).toString().padStart(2, "0");
          const formattedDate = `${year}-${month}-${selectedDate.padStart(2, "0")}`;

          const res = await appointmentsApi.getAvailableSlots(
            appointment.professionalId,
            formattedDate
          );
          setAvailableSlots(res.data);
        } catch (error) {
          console.error("Error fetching available slots:", error);
          toast({
            title: "Error",
            description: "No se pudieron cargar los horarios disponibles",
            variant: "destructive",
          });
        } finally {
          setLoadingSlots(false);
        }
      };
      fetchSlots();
    }
  }, [open, selectedDate, appointment.professionalId, toast]);

  const handleReschedule = async () => {
    if (!selectedDate || !selectedTime) return;

    setSubmitting(true);
    try {
      // Extract year and month from original appointment date (YYYY-MM-DD)
      const [year, month] = appointment.date.split("-");
      const formattedDate = `${year}-${month}-${selectedDate.padStart(2, "0")}`;

      // Calculate duration from original appointment
      const startTimeOriginal = parse(appointment.time, "HH:mm", new Date());
      const endTimeOriginal = parse(appointment.endTime, "HH:mm", new Date());
      const durationMinutes = (endTimeOriginal.getTime() - startTimeOriginal.getTime()) / (1000 * 60);

      // Calculate new endTime
      const newStartTime = parse(selectedTime, "HH:mm", new Date());
      const newEndTime = addMinutes(newStartTime, durationMinutes > 0 ? durationMinutes : 30);
      const formattedEndTime = format(newEndTime, "HH:mm");

      const res = await appointmentsApi.reschedule(appointment.id, {
        date: formattedDate,
        time: selectedTime,
        endTime: formattedEndTime,
        reason: "Reprogramación desde agenda profesional",
        actor: "profesional",
      });

      toast({
        title: "Cita reprogramada",
        description: `Tu cita ha sido movida al ${formattedDate} a las ${selectedTime}`,
      });

      onSuccess(res.data);
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo reprogramar la cita",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Reprogramar cita</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <SlotSelector
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            onDateSelect={(date) => {
              setSelectedDate(date);
              setSelectedTime("");
            }}
            onTimeSelect={setSelectedTime}
            availableSlots={availableSlots}
          />
          {loadingSlots && <p className="text-sm text-muted-foreground mt-2">Cargando horarios...</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            onClick={handleReschedule}
            disabled={!selectedDate || !selectedTime || submitting}
          >
            {submitting ? "Reprogramando..." : "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
