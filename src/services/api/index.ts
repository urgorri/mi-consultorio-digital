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
  bookingApi,
  patientSearchApi,
  kycApi,
  consentApi,
} from "./client";

export { appointmentsApi, publicAppointmentsApi } from "@/adapters/domains/appointments";
