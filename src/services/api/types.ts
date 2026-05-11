// API response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
}

// Domain types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "profesional" | "paciente" | "admin";
  phone?: string;
  createdAt: string;
  status: "activo" | "inactivo" | "bloqueado";
  emailVerifiedAt?: string;
  trialExpired?: boolean;
  invalidLicense?: boolean;
  subscriptionInactive?: boolean;
}

export interface EmailVerificationCode {
  id: string;
  userId: string;
  email: string;
  codeHash: string;
  expiresAt: string;
  attemptsConsumed: number;
  cooldownUntil: string;
  sendsInWindow: number;
}

export interface UserSession {
  id: string;
  device: string;
  browser: string;
  os: string;
  ipAddress: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface Professional extends User {
  role: "profesional";
  specialty: string;
  licenseNumber: string;
  locations: Location[];
  codingConfig: ProfessionalCodingConfig;
  clinicMemberships: ProfessionalClinicMembership[];
  consultationFieldsConfig?: Partial<ConsultationFieldsConfig>;
}

export interface ConsultationFieldsConfig {
  bloodPressure: boolean;
  heartRate: boolean;
  temperature: boolean;
  weight: boolean;
  heightCm: boolean;
  bmi: boolean;
}

export type ClinicRole = "admin" | "staff";

export type DocumentType = "dni" | "pasaporte" | "cedula" | "otro";

export interface ProfessionalPatientRequest {
  id: string;
  patientId: string;
  professionalId: string;
  clinicId?: string;
  status: "pending" | "accepted" | "rejected" | "expired";
  createdAt: string;
  expiresAt?: string;
}

export interface RegistrationInvite {
  token: string;
  expiresAt: string;
  sentByProfessionalId: string;
  documentType: DocumentType;
  documentNumber: string;
  status: "pending" | "used" | "expired";
}

export interface Clinic {
  id: string;
  name: string;
  shortName: string;
  /** HSL color token for badges, e.g. "210 70% 35%" */
  color: string;
  address?: string;
}

export interface ProfessionalClinicMembership {
  clinicId: string;
  role: ClinicRole;
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  gender: string;
  address: string;
  bloodType: string;
  allergies: string;
  conditions: string;
  createdAt: string;
  /** Document type (DNI, pasaporte, etc.) */
  documentType: DocumentType;
  /** Document number (DNI/ID). Unique identity for the patient. */
  documentNumber: string;

  // The following fields are derived from the active CareAuthorization(s)
  // for the professional/clinics context when queried through the API.
  lastVisit: string;
  totalVisits: number;
  status: "activo" | "inactivo";
  /** Clinics this patient is associated with for the current professional. */
  clinicIds: string[];
  /** Whether this patient belongs to the professional's private scope. */
  isPrivate: boolean;
}

export type AuthorizationStatus = "active" | "revoked" | "pending";

export interface CareAuthorization {
  id: string;
  patientId: string;
  professionalId: string;
  /** Clinic this authorization belongs to. null = private scope. */
  clinicId: string | null;
  status: AuthorizationStatus;
  createdAt: string;
  revokedAt?: string;
  lastVisit?: string;
  totalVisits: number;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  professionalId: string;
  professionalName: string;
  locationId: string;
  locationName: string;
  /** Clinic this appointment belongs to. null = private appointment. */
  clinicId: string | null;
  date: string;
  time: string;
  endTime: string;
  type: string;
  status: "confirmada" | "pendiente" | "cancelada" | "completada" | "no_asistio";
  reason?: string;
  notes?: string;
  confirmationSource: "paciente" | "profesional" | null;
  patientPhone?: string;
  confirmedAt?: string;
  confirmedByUserId?: string;
  rescheduledAt?: string;
  createdByRole: "paciente" | "profesional";
  cancellationDeadlineHours?: number;
}

export interface AppointmentAccessToken {
  token: string;
  appointmentId: string;
  expiresAt: string;
  permissions: string[];
}

export interface Consultation {
  id: string;
  patientId: string;
  patientName: string;
  professionalId: string;
  professionalName: string;
  /** Clinic this consultation belongs to. null = private. */
  clinicId: string | null;
  type: string;
  date: string;
  reason: string;
  anamnesis: string;
  physicalExam: string;
  vitalSigns: {
    bloodPressure?: string;
    heartRate?: string;
    temperature?: string;
    weight?: string;
    heightCm?: number;
    bmi?: number;
  };
  diagnoses: Diagnosis[];
  treatment: string;
  followUp: string;
  notes?: string;
}

export type CodingSystem = "CIE-10" | "CIE-11" | "SNOMED-CT";

export interface Diagnosis {
  code: string;
  name: string;
  category?: string;
  codingSystem: CodingSystem;
}

export interface ProfessionalCodingConfig {
  cie10: boolean;
  cie11: boolean;
  snomedCt: boolean;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  phone?: string;
  active: boolean;
}

export interface Schedule {
  dayOfWeek: number;
  enabled: boolean;
  startTime: string;
  endTime: string;
  locationId: string;
}

export interface AppointmentType {
  id: string;
  name: string;
  duration: number;
  visible: boolean;
}

export interface Notification {
  id: string;
  type: "appointment" | "cancellation" | "reminder" | "patient" | "system";
  title: string;
  message: string;
  time: string;
  read: boolean;
  createdAt: string;
}

export interface DashboardStats {
  appointmentsToday: number;
  activePatients: number;
  nextAppointmentTime: string;
  occupancyRate: number;
  appointmentsTrend: string;
  patientsTrend: string;
  occupancyTrend: string;
}

export interface ReportMetrics {
  appointmentsThisMonth: number;
  occupancyRate: number;
  cancellationRate: number;
  newPatients: number;
  noShowRate: number;
  visitTypeBreakdown: { type: string; count: number; percentage: number }[];
  monthlyTrend: { month: string; appointments: number }[];
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

export interface SystemHealth {
  status: "healthy" | "degraded" | "down";
  uptime: string;
  activeUsers: number;
  totalRequests: number;
  avgResponseTime: number;
  services: { name: string; status: "up" | "down"; latency: number }[];
}

export interface DocumentVerificationResult {
  firstName?: string;
  lastName?: string;
  documentType?: DocumentType;
  documentNumber?: string;
  birthDate?: string;
  confidenceScore: number;
  status: "approved" | "manual_review" | "rejected";
  error?: string;
}
