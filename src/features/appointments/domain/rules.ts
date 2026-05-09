import { isBefore, subHours, parseISO } from "date-fns";

/**
 * Checks if the current time is before the deadline for an appointment.
 */
export function isWithinDeadline(appointmentDate: string, appointmentTime: string, deadlineHours: number): boolean {
  try {
    const appointmentDateTime = parseISO(`${appointmentDate}T${appointmentTime}`);
    const deadline = subHours(appointmentDateTime, deadlineHours);
    return isBefore(new Date(), deadline);
  } catch (error) {
    console.error("Error parsing appointment date/time:", error);
    return false;
  }
}

/**
 * Global rule to check if an appointment can be cancelled.
 */
export function canCancelAppointment(appointment: { date: string; time: string; cancellationDeadlineHours?: number }): boolean {
  const deadline = appointment.cancellationDeadlineHours ?? 24;
  return isWithinDeadline(appointment.date, appointment.time, deadline);
}

/**
 * Global rule to check if an appointment can be rescheduled.
 */
export function canRescheduleAppointment(appointment: { date: string; time: string; cancellationDeadlineHours?: number }): boolean {
  const deadline = appointment.cancellationDeadlineHours ?? 24;
  return isWithinDeadline(appointment.date, appointment.time, deadline);
}

/**
 * Rules for visit types
 */
export const AppointmentVisitType = {
  FIRST_TIME: "Primera vez",
  FOLLOW_UP: "Seguimiento",
};

export function isFirstTimeVisit(type: string): boolean {
  return type === AppointmentVisitType.FIRST_TIME;
}

export function isFollowUpVisit(type: string): boolean {
  return type === AppointmentVisitType.FOLLOW_UP;
}

/**
 * Automatically detects the visit type based on the number of previous visits.
 */
export function detectVisitType(totalVisits: number): string {
  return totalVisits === 0 ? AppointmentVisitType.FIRST_TIME : AppointmentVisitType.FOLLOW_UP;
}
