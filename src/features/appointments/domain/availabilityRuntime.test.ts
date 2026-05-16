import { describe, expect, it } from "vitest";
import { appointmentPolicyEngine } from "./appointmentPolicyEngine";
import type { Appointment } from "@/services/api/types";

const base: Appointment = {
  id: "a1",
  patientId: "p1",
  patientName: "P",
  professionalId: "prof-1",
  professionalName: "Dr",
  locationId: "loc-1",
  locationName: "Loc",
  clinicId: null,
  date: "2026-06-15",
  time: "09:00",
  endTime: "09:30",
  type: "Primera vez",
  status: "pendiente",
  confirmationSource: null,
  createdByRole: "paciente",
};

describe("availability runtime rules", () => {
  it("detects overlap using UTC-normalized timestamps", () => {
    const appointments = [base];
    expect(appointmentPolicyEngine.hasScheduleConflict(appointments, {
      id: "a2",
      professionalId: "prof-1",
      date: "2026-06-15",
      time: "09:15",
      endTime: "09:45",
    })).toBe(true);
  });

  it("allows schedule changes when existing appointment does not overlap", () => {
    const appointments = [base];
    expect(appointmentPolicyEngine.hasScheduleConflict(appointments, {
      id: "a3",
      professionalId: "prof-1",
      date: "2026-06-15",
      time: "09:30",
      endTime: "10:00",
    })).toBe(false);
  });
});
