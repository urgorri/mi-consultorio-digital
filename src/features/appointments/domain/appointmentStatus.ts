export const APPOINTMENT_STATUS = {
  PENDING: "pending",
  SCHEDULED: "scheduled",
  CONFIRMED: "confirmed",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  NO_SHOW: "no_show",
} as const;

export type AppointmentStatus = typeof APPOINTMENT_STATUS[keyof typeof APPOINTMENT_STATUS];

const LABELS: Record<string, Record<AppointmentStatus, string>> = {
  "es-MX": {
    pending: "Pendiente de acción",
    scheduled: "Pendiente",
    confirmed: "Confirmada",
    completed: "Completada",
    cancelled: "Cancelada",
    no_show: "No asistió",
  },
  en: {
    pending: "Pending action",
    scheduled: "Scheduled",
    confirmed: "Confirmed",
    completed: "Completed",
    cancelled: "Cancelled",
    no_show: "No show",
  },
};

const LEGACY_STATUS_MAP: Record<string, AppointmentStatus> = {
  pendiente: APPOINTMENT_STATUS.SCHEDULED,
  confirmada: APPOINTMENT_STATUS.CONFIRMED,
  completada: APPOINTMENT_STATUS.COMPLETED,
  cancelada: APPOINTMENT_STATUS.CANCELLED,
  no_asistio: APPOINTMENT_STATUS.NO_SHOW,
};

export const assertAppointmentStatus = (status: string): AppointmentStatus => {
  const normalized = LEGACY_STATUS_MAP[status] ?? status;
  if (Object.values(APPOINTMENT_STATUS).includes(normalized as AppointmentStatus)) {
    return normalized as AppointmentStatus;
  }
  throw new Error(`Unsupported appointment status: ${status}`);
};

export const getAppointmentStatusLabel = (status: AppointmentStatus, locale = "es-MX") => {
  const bundle = LABELS[locale] ?? LABELS.en;
  return bundle[status];
};
