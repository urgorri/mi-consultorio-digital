import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { isBefore, subHours, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Checks if the current time is before the deadline for an appointment.
 * @param appointmentDate ISO date string (YYYY-MM-DD)
 * @param appointmentTime Time string (HH:mm)
 * @param deadlineHours Number of hours before the appointment
 * @returns true if still within the allowed time to perform actions
 */
export function isWithinDeadline(appointmentDate: string, appointmentTime: string, deadlineHours: number): boolean {
  try {
    // Combine date and time. Assuming appointmentDate is YYYY-MM-DD and appointmentTime is HH:mm
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
