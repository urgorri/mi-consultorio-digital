import type { Appointment, AppointmentAccessToken } from "@/services/api/types";
import { mockAppointments, mockAppointmentTokens } from "@/services/api/mockData";
import type { AppointmentRepository } from "../domain/appointmentsRepository";

export class MockAppointmentsRepository implements AppointmentRepository {
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
    return this.updateAppointmentStatus(id, "cancelada", { cancelledAt });
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
}
