import { mockAppointmentTypes, mockClinics, mockSchedules } from "@/services/api/mockData";

export const SLOT_INTERVAL_MINUTES = 30;
export const DEFAULT_CANCELLATION_DEADLINE_HOURS = 24;
export const DEFAULT_RESCHEDULE_DEADLINE_HOURS = 24;

export const appointmentTypeBusinessRules = {
  "type-2": { cancellationDeadlineHours: 24, rescheduleDeadlineHours: 24 },
  "type-3": { cancellationDeadlineHours: 48, rescheduleDeadlineHours: 48 },
  "type-4": { cancellationDeadlineHours: 0, rescheduleDeadlineHours: 0 },
} as const;

export const schedulingConfig = {
  locations: mockClinics,
  schedules: mockSchedules,
  appointmentTypes: mockAppointmentTypes.map((type) => ({
    ...type,
    cancellationDeadlineHours:
      appointmentTypeBusinessRules[type.id as keyof typeof appointmentTypeBusinessRules]?.cancellationDeadlineHours ?? DEFAULT_CANCELLATION_DEADLINE_HOURS,
    rescheduleDeadlineHours:
      appointmentTypeBusinessRules[type.id as keyof typeof appointmentTypeBusinessRules]?.rescheduleDeadlineHours ?? DEFAULT_RESCHEDULE_DEADLINE_HOURS,
  })),
  slotIntervalMinutes: SLOT_INTERVAL_MINUTES,
};

export const getAppointmentTypePolicy = (typeId?: string, typeName?: string) => {
  if (typeId) {
    const byId = schedulingConfig.appointmentTypes.find((type) => type.id === typeId);
    if (byId) return byId;
  }
  if (typeName) {
    return schedulingConfig.appointmentTypes.find((type) => type.name === typeName);
  }
  return undefined;
};
