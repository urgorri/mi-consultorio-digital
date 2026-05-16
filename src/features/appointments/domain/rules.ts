import { appointmentPolicyEngine } from "./appointmentPolicyEngine";

export const isWithinDeadline = appointmentPolicyEngine.isWithinDeadline.bind(appointmentPolicyEngine);
export const canCancelAppointment = appointmentPolicyEngine.canCancelAppointment.bind(appointmentPolicyEngine);
export const canRescheduleAppointment = appointmentPolicyEngine.canRescheduleAppointment.bind(appointmentPolicyEngine);

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

export function detectVisitType(totalVisits: number): string {
  return totalVisits === 0 ? AppointmentVisitType.FIRST_TIME : AppointmentVisitType.FOLLOW_UP;
}
