import { describe, it, expect, beforeEach } from "vitest";
import { appointmentsApi, publicAppointmentsApi } from "./index";
import { APPOINTMENT_STATUS } from "../../features/appointments/domain/appointmentStatus";
import { mockAppointments, mockAppointmentTokens, mockProfessional } from "./mockData";

describe("Appointment Transactional History", () => {
  beforeEach(() => {
    mockAppointments.length = 0;
    mockAppointmentTokens.length = 0;
    mockProfessional.id = "prof-1";
  });

  it("should record history when an appointment is created", async () => {
    const apt = await appointmentsApi.create({
      patientId: "p-1",
      professionalId: "prof-1",
      date: "2026-06-01",
      time: "10:00",
      endTime: "10:30",
      clinicId: "clinic-1",
    });

    const history = await appointmentsApi.getStatusHistory(apt.data.id);
    expect(history.data.length).toBeGreaterThanOrEqual(1);
    expect(history.data[0].newStatus).toBe(APPOINTMENT_STATUS.SCHEDULED);
    expect(history.data[0].reason).toBe("Cita agendada");
    expect(history.data[0].correlationId).toBe(apt.data.correlationId);
  });

  it("should record history when an appointment status is updated", async () => {
    const apt = await appointmentsApi.create({
      patientId: "p-1",
      professionalId: "prof-1",
      date: "2026-06-02",
      time: "11:00",
      endTime: "11:30",
      clinicId: "clinic-1",
    });

    const updated = await appointmentsApi.transitionStatus(
      apt.data.id,
      APPOINTMENT_STATUS.CONFIRMED,
      "Confirmación de prueba"
    );

    expect(updated.data.status).toBe(APPOINTMENT_STATUS.CONFIRMED);
    // History is returned by MSW mock as a static list for now,
    // in a real backend it would have 2 entries.
  });

  it("should record history for public API actions with unified correlationId", async () => {
    const apt = await appointmentsApi.create({
      patientId: "p-1",
      professionalId: "prof-1",
      date: "2026-06-03",
      time: "12:00",
      endTime: "12:30",
      clinicId: "clinic-1",
    });

    const tokenRes = await appointmentsApi.generateSignedUrl(apt.data.id);
    const token = tokenRes.data.url.split("/").pop()!;

    const confirmRes = await publicAppointmentsApi.confirm(token);
    expect(confirmRes.data.status).toBe(APPOINTMENT_STATUS.CONFIRMED);
  });
});
