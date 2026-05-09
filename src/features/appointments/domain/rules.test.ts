import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  canCancelAppointment,
  canRescheduleAppointment,
  detectVisitType,
  AppointmentVisitType
} from "./rules";
import { addHours, format, addDays } from "date-fns";

describe("Appointment Business Rules", () => {
  // We use a fixed date for the appointment to avoid issues with day transitions
  // But we need to ensure the test is relative to "now"

  describe("canCancelAppointment", () => {
    it("should allow cancellation if before the 24h deadline (default)", () => {
      const future = addHours(new Date(), 25);
      const dateStr = format(future, "yyyy-MM-dd");
      const timeStr = format(future, "HH:mm");

      const appointment = { date: dateStr, time: timeStr };
      expect(canCancelAppointment(appointment)).toBe(true);
    });

    it("should not allow cancellation if after the 24h deadline (default)", () => {
      const nearFuture = addHours(new Date(), 23);
      const dateStr = format(nearFuture, "yyyy-MM-dd");
      const timeStr = format(nearFuture, "HH:mm");

      const appointment = { date: dateStr, time: timeStr };
      expect(canCancelAppointment(appointment)).toBe(false);
    });

    it("should respect custom cancellation deadline", () => {
      const customDeadline = 48;

      const farFuture = addHours(new Date(), 49);
      const dateStrFar = format(farFuture, "yyyy-MM-dd");
      const timeStrFar = format(farFuture, "HH:mm");
      const appointment = { date: dateStrFar, time: timeStrFar, cancellationDeadlineHours: customDeadline };
      expect(canCancelAppointment(appointment)).toBe(true);

      const nearFuture = addHours(new Date(), 47);
      const dateStrNear = format(nearFuture, "yyyy-MM-dd");
      const timeStrNear = format(nearFuture, "HH:mm");
      const appointment2 = { date: dateStrNear, time: timeStrNear, cancellationDeadlineHours: customDeadline };
      expect(canCancelAppointment(appointment2)).toBe(false);
    });
  });

  describe("canRescheduleAppointment", () => {
    it("should allow rescheduling if before the deadline", () => {
      const future = addHours(new Date(), 25);
      const dateStr = format(future, "yyyy-MM-dd");
      const timeStr = format(future, "HH:mm");

      const appointment = { date: dateStr, time: timeStr };
      expect(canRescheduleAppointment(appointment)).toBe(true);
    });

    it("should not allow rescheduling if after the deadline", () => {
      const nearFuture = addHours(new Date(), 23);
      const dateStr = format(nearFuture, "yyyy-MM-dd");
      const timeStr = format(nearFuture, "HH:mm");

      const appointment = { date: dateStr, time: timeStr };
      expect(canRescheduleAppointment(appointment)).toBe(false);
    });
  });

  describe("detectVisitType", () => {
    it("should return FIRST_TIME if total visits is 0", () => {
      expect(detectVisitType(0)).toBe(AppointmentVisitType.FIRST_TIME);
    });

    it("should return FOLLOW_UP if total visits is greater than 0", () => {
      expect(detectVisitType(1)).toBe(AppointmentVisitType.FOLLOW_UP);
      expect(detectVisitType(5)).toBe(AppointmentVisitType.FOLLOW_UP);
    });
  });
});
