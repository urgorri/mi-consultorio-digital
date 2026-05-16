import { describe, expect, it } from "vitest";
import { APPOINTMENT_STATUS, assertAppointmentStatus } from "./appointmentStatus";

describe("appointmentStatus canonical enum", () => {
  it("normalizes legacy statuses", () => {
    expect(assertAppointmentStatus("pendiente")).toBe(APPOINTMENT_STATUS.SCHEDULED);
  });

  it("fails on unsupported statuses", () => {
    expect(() => assertAppointmentStatus("reagendada")).toThrow(/Unsupported appointment status/);
  });
});
