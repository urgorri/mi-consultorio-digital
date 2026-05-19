import { describe, expect, it } from "vitest";
import type { AppointmentRepository } from "../../domain/appointmentsRepository";
import { MockAppointmentsRepository } from "../mockAppointmentsRepository";
import { SqliteAppointmentsRepository } from "../sqliteAppointmentsRepository";
import type { Appointment } from "@/services/api/types";
import { APPOINTMENT_STATUS } from "../../domain/appointmentStatus";

const baseAppointment: Appointment = {
  id: "apt-contract-1",
  patientId: "p-contract",
  patientName: "Paciente Contract",
  professionalId: "prof-contract",
  professionalName: "Profesional Contract",
  locationId: "loc-1",
  locationName: "Consultorio",
  clinicId: null,
  date: "2026-05-20",
  time: "09:00",
  endTime: "09:30",
  type: "Primera vez",
  status: APPOINTMENT_STATUS.SCHEDULED,
  confirmationSource: null,
  createdByRole: "paciente",
};

const runContract = (name: string, build: () => AppointmentRepository) => {
  describe(name, () => {
    it("create/list/update/reschedule/cancel/findToken and availability entities", async () => {
      const repo = build();
      await repo.createAppointment({ ...baseAppointment, id: `id-${name}` });
      const byPro = await repo.listAppointmentsByProfessional("prof-contract");
      expect(byPro.length).toBeGreaterThan(0);

      const updated = await repo.updateAppointmentStatus(`id-${name}`, APPOINTMENT_STATUS.CONFIRMED, { confirmationSource: "profesional" });
      expect(updated.status).toBe(APPOINTMENT_STATUS.CONFIRMED);

      const rescheduled = await repo.rescheduleAppointment(`id-${name}`, { date: "2026-06-01", time: "10:00", endTime: "10:30" });
      expect(rescheduled.date).toBe("2026-06-01");

      const cancelled = await repo.cancelAppointment(`id-${name}`);
      expect(cancelled.status).toBe(APPOINTMENT_STATUS.CANCELLED);


      await repo.upsertWeeklyAvailability([{ id: `wa-${name}`, tenantId: "t-1", professionalId: "prof-contract", dayOfWeek: 1, enabled: true, startTime: "09:00", endTime: "12:00", locationId: "loc-1" }]);
      const weekly = await repo.listWeeklyAvailability("t-1", "prof-contract");
      expect(weekly.length).toBe(1);

      await repo.upsertAvailabilityExceptions([{ id: `ex-${name}`, tenantId: "t-1", professionalId: "prof-contract", date: "2026-06-01", startTime: "10:00", endTime: "11:00", kind: "blocked" }]);
      const ex = await repo.listAvailabilityExceptions("t-1", "prof-contract", "2026-06-01");
      expect(ex[0]?.kind).toBe("blocked");

      await repo.upsertProfessionalAppointmentTypes([{ id: `pat-${name}`, tenantId: "t-1", professionalId: "prof-contract", appointmentTypeId: "type-2", duration: 20, enabled: true }]);
      const pats = await repo.listProfessionalAppointmentTypes("t-1", "prof-contract");
      expect(pats[0]?.appointmentTypeId).toBe("type-2");
      await repo.saveAccessToken({ token: `token-${name}`, appointmentId: `id-${name}`, expiresAt: "2099-01-01T00:00:00.000Z", permissions: ["confirm"] });
      const found = await repo.findAppointmentByToken(`token-${name}`);
      expect(found?.id).toBe(`id-${name}`);
    });
  });
};

runContract("mock", () => new MockAppointmentsRepository());
runContract("sqlite", () => new SqliteAppointmentsRepository());
