import type { Appointment, AppointmentAccessToken } from "@/services/api/types";

export interface AppointmentRepository {
  createAppointment(data: Appointment): Promise<Appointment>;
  updateAppointmentStatus(id: string, status: Appointment["status"], metadata?: Partial<Appointment>): Promise<Appointment>;
  rescheduleAppointment(id: string, data: Pick<Appointment, "date" | "time" | "endTime">): Promise<Appointment>;
  cancelAppointment(id: string, cancelledAt?: string): Promise<Appointment>;
  listAppointmentsByProfessional(professionalId: string): Promise<Appointment[]>;
  listAppointmentsByPatient(patientId: string): Promise<Appointment[]>;
  findAppointmentByToken(token: string): Promise<Appointment | null>;
  saveAccessToken(token: AppointmentAccessToken): Promise<void>;
  findTokenByAppointmentId(appointmentId: string): Promise<AppointmentAccessToken | null>;
}
