export type Role = "admin" | "profesional" | "paciente";
export type UserState = "active" | "suspended" | "blocked";

export type PermissionKey =
  | "auth.session.login"
  | "identity.verification.read"
  | "patients.patient.read"
  | "patients.patient.update"
  | "professionals.license.invalidate"
  | "consents.consent.accept"
  | "consents.consent.revoke"
  | "clinical-records.consultation.create"
  | "clinical-records.consultation.read"
  | "audit.event.read"
  | "billing.invoice.read";

const matrix: Record<PermissionKey, Partial<Record<Role, boolean>>> = {
  "auth.session.login": { admin: true, profesional: true, paciente: true },
  "identity.verification.read": { admin: true, profesional: true, paciente: true },
  "patients.patient.read": { admin: true, profesional: true, paciente: true },
  "patients.patient.update": { admin: true, profesional: true, paciente: true },
  "professionals.license.invalidate": { admin: true, profesional: false, paciente: false },
  "consents.consent.accept": { admin: true, profesional: true, paciente: true },
  "consents.consent.revoke": { admin: true, profesional: true, paciente: true },
  "clinical-records.consultation.create": { admin: true, profesional: true, paciente: false },
  "clinical-records.consultation.read": { admin: true, profesional: true, paciente: true },
  "audit.event.read": { admin: true, profesional: false, paciente: false },
  "billing.invoice.read": { admin: true, profesional: true, paciente: false },
};

export function canPerformAction(role: Role, state: UserState, permission: PermissionKey): boolean {
  if (state !== "active" && permission !== "auth.session.login") return false;
  return matrix[permission][role] === true;
}
