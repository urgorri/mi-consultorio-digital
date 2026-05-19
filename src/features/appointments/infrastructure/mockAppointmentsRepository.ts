import type { Appointment, AppointmentAccessToken, AppointmentStatusHistory } from "@/services/api/types";
import { mockAppointments, mockAppointmentTokens } from "@/services/api/mockData";
import type { AvailabilityException, ProfessionalAppointmentType, Schedule } from "@/services/api/types";
import type { AppointmentRepository } from "../domain/appointmentsRepository";
import { APPOINTMENT_STATUS } from "../domain/appointmentStatus";

export class MockAppointmentsRepository implements AppointmentRepository {
  private weeklyAvailability: Schedule[] = [];
  private availabilityExceptions: AvailabilityException[] = [];
  private professionalAppointmentTypes: ProfessionalAppointmentType[] = [];
  private statusHistory: AppointmentStatusHistory[] = [];

  async createAppointment(data: Appointment) { mockAppointments.push(data); return data; }
  async updateAppointmentStatus(id: string, status: Appointment["status"], metadata?: Partial<Appointment>) {
    const i = mockAppointments.findIndex(a => a.id === id);
    if (i === -1) throw new Error("Cita no encontrada");
    const updated = { ...mockAppointments[i], ...metadata, status } as Appointment;
    mockAppointments[i] = updated;
    return updated;
  }
  async rescheduleAppointment(id: string, data: Pick<Appointment, "date" | "time" | "endTime">) {
    const i = mockAppointments.findIndex(a => a.id === id);
    if (i === -1) throw new Error("Cita no encontrada");
    const updated = { ...mockAppointments[i], ...data, rescheduledAt: new Date().toISOString() } as Appointment;
    mockAppointments[i] = updated;
    return updated;
  }
  async cancelAppointment(id: string, cancelledAt = new Date().toISOString()) {
    return this.updateAppointmentStatus(id, APPOINTMENT_STATUS.CANCELLED, { cancelledAt });
  }
  async listAppointmentsByProfessional(professionalId: string) { return mockAppointments.filter(a => a.professionalId === professionalId); }
  async listAppointmentsByPatient(patientId: string) { return mockAppointments.filter(a => a.patientId === patientId); }
  async findAppointmentByToken(token: string) {
    const tokenData = mockAppointmentTokens.find(t => t.token === token);
    if (!tokenData || new Date(tokenData.expiresAt) < new Date()) return null;
    return mockAppointments.find(a => a.id === tokenData.appointmentId) ?? null;
  }
  async saveAccessToken(token: AppointmentAccessToken) {
    const i = mockAppointmentTokens.findIndex(t => t.token === token.token || t.appointmentId === token.appointmentId);
    if (i >= 0) mockAppointmentTokens[i] = token;
    else mockAppointmentTokens.push(token);
  }
  async findTokenByAppointmentId(appointmentId: string) {
    return mockAppointmentTokens.find(t => t.appointmentId === appointmentId) ?? null;
  }

  async saveStatusHistory(history: AppointmentStatusHistory) {
    // Idempotency check
    if (this.statusHistory.some(h => h.correlationId === history.correlationId)) {
      console.log(`[REPO] Ignored duplicate history entry for correlationId: ${history.correlationId}`);
      return;
    }
    this.statusHistory.push(history);
  }

  async listStatusHistory(appointmentId: string) {
    return this.statusHistory
      .filter(h => h.appointmentId === appointmentId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }
  async listWeeklyAvailability(tenantId: string, professionalId: string) {
    return this.weeklyAvailability.filter(w => w.tenantId === tenantId && w.professionalId === professionalId);
  }
  async upsertWeeklyAvailability(entries: Schedule[]) {
    for (const entry of entries) {
      const i = this.weeklyAvailability.findIndex(w => w.tenantId === entry.tenantId && w.professionalId === entry.professionalId && w.dayOfWeek === entry.dayOfWeek);
      if (i >= 0) this.weeklyAvailability[i] = entry;
      else this.weeklyAvailability.push(entry);
    }
  }
  async listAvailabilityExceptions(tenantId: string, professionalId: string, date: string) {
    return this.availabilityExceptions.filter(e => e.tenantId === tenantId && e.professionalId === professionalId && e.date === date);
  }
  async upsertAvailabilityExceptions(entries: AvailabilityException[]) {
    for (const entry of entries) {
      const i = this.availabilityExceptions.findIndex(e => e.id === entry.id);
      if (i >= 0) this.availabilityExceptions[i] = entry;
      else this.availabilityExceptions.push(entry);
    }
  }
  async listProfessionalAppointmentTypes(tenantId: string, professionalId: string) {
    return this.professionalAppointmentTypes.filter(t => t.tenantId === tenantId && t.professionalId === professionalId);
  }
  async upsertProfessionalAppointmentTypes(entries: ProfessionalAppointmentType[]) {
    for (const entry of entries) {
      const i = this.professionalAppointmentTypes.findIndex(t => t.id === entry.id);
      if (i >= 0) this.professionalAppointmentTypes[i] = entry;
      else this.professionalAppointmentTypes.push(entry);
    }
  }
}
