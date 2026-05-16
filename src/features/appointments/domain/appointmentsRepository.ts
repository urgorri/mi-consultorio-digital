import type { Appointment, AppointmentAccessToken, AppointmentStatusHistory } from "@/services/api/types";
import type { AvailabilityException, ProfessionalAppointmentType, Schedule } from "@/services/api/types";

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

  saveStatusHistory(history: AppointmentStatusHistory): Promise<void>;
  listStatusHistory(appointmentId: string): Promise<AppointmentStatusHistory[]>;

  listWeeklyAvailability(tenantId: string, professionalId: string): Promise<Schedule[]>;
  upsertWeeklyAvailability(entries: Schedule[]): Promise<void>;
  listAvailabilityExceptions(tenantId: string, professionalId: string, date: string): Promise<AvailabilityException[]>;
  upsertAvailabilityExceptions(entries: AvailabilityException[]): Promise<void>;
  listProfessionalAppointmentTypes(tenantId: string, professionalId: string): Promise<ProfessionalAppointmentType[]>;
  upsertProfessionalAppointmentTypes(entries: ProfessionalAppointmentType[]): Promise<void>;
}
