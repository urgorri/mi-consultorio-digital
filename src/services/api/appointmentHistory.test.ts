import { describe, it, expect, beforeEach } from "vitest";
import { appointmentsApi, publicAppointmentsApi } from "./client";
import { APPOINTMENT_STATUS } from "../../features/appointments/domain/appointmentStatus";
import { mockAppointments, mockAppointmentTokens, mockProfessional } from "./mockData";

describe("Appointment Transactional History", () => {
  beforeEach(() => {
    mockAppointments.length = 0;
    mockAppointmentTokens.length = 0;
    // Ensure mockProfessional is set up as the one we use in client.ts
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
    expect(history.data.length).toBe(1);
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
      "Confirmación de prueba",
      "profesional"
    );

    const history = await appointmentsApi.getStatusHistory(apt.data.id);
    expect(history.data.length).toBe(2);
    expect(history.data[1].previousStatus).toBe(APPOINTMENT_STATUS.SCHEDULED);
    expect(history.data[1].newStatus).toBe(APPOINTMENT_STATUS.CONFIRMED);
    expect(history.data[1].reason).toBe("Confirmación de prueba");
    expect(history.data[1].correlationId).toBe(updated.data.correlationId);
  });

  it("should record history for public API actions with unified correlationId", async () => {
    // We need a real token or mock one. appointmentsApi.generateSignedUrl creates one.
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

    await publicAppointmentsApi.confirm(token);

    const history = await appointmentsApi.getStatusHistory(apt.data.id);
    const confirmEntry = history.data.find(h => h.newStatus === APPOINTMENT_STATUS.CONFIRMED);

    expect(confirmEntry).toBeDefined();
    expect(confirmEntry?.actor.role).toBe("paciente");
    expect(confirmEntry?.correlationId).toMatch(/^pub-conf-/);
  });

  it("should prevent duplicate history entries (idempotency)", async () => {
     const apt = await appointmentsApi.create({
      patientId: "p-1",
      professionalId: "prof-1",
      date: "2026-06-04",
      time: "14:00",
      endTime: "14:30",
      clinicId: "clinic-1",
    });

    const historyBefore = await appointmentsApi.getStatusHistory(apt.data.id);
    const initialHistoryEntry = historyBefore.data[0];

    // Try to save the same history entry again via repository (simulation of duplicate event)
    const { getAppointmentsRepository } = await import("../../features/appointments/infrastructure/repositoryFactory");
    const repo = await getAppointmentsRepository();
    await repo.saveStatusHistory(initialHistoryEntry);

    const historyAfter = await appointmentsApi.getStatusHistory(apt.data.id);
    expect(historyAfter.data.length).toBe(1);
  });
});
