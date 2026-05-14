import {
  authApi,
  patientsApi,
  consentApi,
  consultationsApi,
  adminApi,
  settingsApi,
  dashboardApi,
} from "../../services/api";

export const authAdapter = authApi;
export const identityAdapter = settingsApi;
export const patientsAdapter = patientsApi;
export const professionalsAdapter = adminApi;
export const consentsAdapter = consentApi;
export const clinicalRecordsAdapter = consultationsApi;
export const auditAdapter = adminApi;
export const billingAdapter = dashboardApi;
