import { isBefore, parseISO, subHours } from "date-fns";
import type { Appointment } from "@/services/api/types";
import { DEFAULT_CANCELLATION_DEADLINE_HOURS, DEFAULT_RESCHEDULE_DEADLINE_HOURS } from "./schedulingConfig";

import { APPOINTMENT_STATUS, type AppointmentStatus } from "./appointmentStatus";
export type TransitionActor = "paciente" | "profesional" | "admin" | "system";

const ALLOWED_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  [APPOINTMENT_STATUS.SCHEDULED]: [APPOINTMENT_STATUS.CONFIRMED, APPOINTMENT_STATUS.CANCELLED, APPOINTMENT_STATUS.NO_SHOW],
  [APPOINTMENT_STATUS.CONFIRMED]: [APPOINTMENT_STATUS.CANCELLED, APPOINTMENT_STATUS.COMPLETED, APPOINTMENT_STATUS.NO_SHOW],
  [APPOINTMENT_STATUS.CANCELLED]: [],
  [APPOINTMENT_STATUS.COMPLETED]: [],
  [APPOINTMENT_STATUS.NO_SHOW]: [],
};

export interface TransitionInput {
  appointment: Appointment;
  toStatus: AppointmentStatus;
  actor: TransitionActor;
  reason: string;
  correlationId?: string;
}

export const appointmentPolicyEngine = {
  canTransition(from: AppointmentStatus, to: AppointmentStatus) {
    return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
  },
  isWithinDeadline(appointmentDate: string, appointmentTime: string, deadlineHours: number): boolean {
    const appointmentDateTime = parseISO(`${appointmentDate}T${appointmentTime}`);
    const deadline = subHours(appointmentDateTime, deadlineHours);
    return isBefore(new Date(), deadline);
  },
  canCancelAppointment(appointment: Pick<Appointment, "date" | "time" | "cancellationDeadlineHours">) {
    const deadline = appointment.cancellationDeadlineHours ?? DEFAULT_CANCELLATION_DEADLINE_HOURS;
    return this.isWithinDeadline(appointment.date, appointment.time, deadline);
  },
  canRescheduleAppointment(appointment: Pick<Appointment, "date" | "time" | "cancellationDeadlineHours">) {
    const deadline = appointment.cancellationDeadlineHours ?? DEFAULT_RESCHEDULE_DEADLINE_HOURS;
    return this.isWithinDeadline(appointment.date, appointment.time, deadline);
  },
  hasScheduleConflict(
    appointments: Appointment[],
    candidate: Pick<Appointment, "id" | "professionalId" | "date" | "time" | "endTime">
  ) {
    const toUtc = (date: string, hhmm: string) => new Date(`${date}T${hhmm}:00Z`).getTime();
    return appointments.some((a) =>
      a.id !== candidate.id &&
      a.professionalId === candidate.professionalId &&
      a.date === candidate.date &&
      toUtc(a.date, a.time) < toUtc(candidate.date, candidate.endTime) &&
      toUtc(candidate.date, candidate.time) < toUtc(a.date, a.endTime) &&
      a.status !== APPOINTMENT_STATUS.CANCELLED,
    );
  },
  buildTransition(input: TransitionInput): Appointment {
    const { appointment, toStatus, actor, reason, correlationId } = input;
    if (!this.canTransition(appointment.status, toStatus)) {
      throw new Error(`Transición inválida: ${appointment.status} -> ${toStatus}`);
    }

    if (toStatus === APPOINTMENT_STATUS.CANCELLED && !this.canCancelAppointment(appointment)) {
      throw new Error("La cita está fuera de la ventana de cancelación.");
    }

    const now = new Date().toISOString();
    const transitionCorrelationId = correlationId || `corr-${appointment.id}-${Date.now()}`;

    const auditEntry = {
      at: now,
      fromStatus: appointment.status,
      toStatus,
      actor,
      reason,
    };

    return {
      ...appointment,
      status: toStatus,
      correlationId: transitionCorrelationId,
      confirmedAt: toStatus === APPOINTMENT_STATUS.CONFIRMED ? appointment.confirmedAt || now : appointment.confirmedAt,
      confirmationSource: toStatus === APPOINTMENT_STATUS.CONFIRMED ? (actor === "paciente" ? "paciente" : "profesional") : appointment.confirmationSource,
      notes: `${appointment.notes ? `${appointment.notes}\n` : ""}[${auditEntry.at}] ${auditEntry.actor}: ${auditEntry.fromStatus} -> ${auditEntry.toStatus} | ${auditEntry.reason}`,
    };
  },
};
