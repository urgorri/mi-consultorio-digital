export * from "./types";
export {
  authApi,
  patientsApi,
  consultationsApi,
  diagnosesApi,
  notificationsApi,
  dashboardApi,
  reportsApi,
  settingsApi,
  adminApi,
  patientPortalApi,
  patientSearchApi,
  kycApi,
  consentApi,
  authorize,
  PUBLIC_APPOINTMENTS_API_V1
} from "./client";

export { appointmentsApi, publicAppointmentsApi, bookingApi } from "@/adapters/domains/appointments";
