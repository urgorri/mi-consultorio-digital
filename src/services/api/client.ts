// API client - currently returns mock data. Will be connected to real backend later.
import type {
  ApiResponse, PaginatedResponse, Patient, Appointment, Consultation,
  Diagnosis, Notification, DashboardStats, ReportMetrics,
  User, AuditLog, SystemHealth, Professional, AppointmentType,
  DocumentType, ProfessionalPatientRequest, RegistrationInvite,
  DocumentVerificationResult, UserSession,
  ConsentDocument, ConsentAcceptance, AccessGrant, AcceptanceMethod,
  CareAuthorization,
} from "./types";
import { decrypt, encrypt } from "../../lib/crypto";
import { getUserRestrictions } from "../../lib/auth-routing";
import { DEFAULT_CANCELLATION_DEADLINE_HOURS, getAppointmentTypePolicy, schedulingConfig } from "@/features/appointments/domain/schedulingConfig";
import {
  mockPatients, mockAppointments, mockConsultations, mockDiagnoses,
  mockNotifications, mockDashboardStats, mockReportMetrics,
  mockUsers, mockAuditLogs, mockSystemHealth, mockProfessional,
  mockAppointmentTypes, mockPatientNotifications, mockPatientPortalAppointments,
  mockProfessionalPatientRequests, mockRegistrationInvites, mockCareAuthorizations,
  mockAppointmentTokens, mockClinics, mockSchedules,
  mockConsentDocuments, mockConsentAcceptances, mockAccessGrants, mockPasswordResetTokens,
} from "./mockData";

// Simulate network delay
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Centralized Audit Pipeline (simulated server-side)
const recordAuditEvent = async (event: Omit<AuditLog, "id" | "timestamp" | "hash" | "previousHash">) => {
  const previousLog = mockAuditLogs[mockAuditLogs.length - 1];
  const previousHash = previousLog ? previousLog.hash : "0";

  const newLog: AuditLog = {
    ...event,
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    previousHash,
    // Simulated hash calculation
    hash: btoa(`${previousHash}-${event.action}-${event.correlationId}-${Date.now()}`).substring(0, 32),
  };

  mockAuditLogs.push(newLog);
  console.log(`[AUDIT] Recorded event: ${event.action} by ${event.actor.name}`, newLog);
  return newLog;
};

const securityTracker = {
  loginAttempts: new Map<string, { count: number; lastAttempt: number; lockedUntil?: number }>(),
  async trackLoginAttempt(email: string, ip: string, success: boolean) {
    const now = Date.now();
    const attempts = this.loginAttempts.get(email) || { count: 0, lastAttempt: now };

    if (success) {
      this.loginAttempts.delete(email);
      return;
    }

    attempts.count++;
    attempts.lastAttempt = now;

    if (attempts.count >= 5) {
      attempts.lockedUntil = now + 15 * 60 * 1000; // 15 mins
      recordAuditEvent({
        actor: { id: "system", name: "Security Service", role: "admin" },
        action: "account.lockout",
        resource: "auth",
        details: `Cuenta bloqueada temporalmente por intentos fallidos: ${email}`,
        ipAddress: ip,
        device: "Server",
        result: "success",
        correlationId: `lock-${now}`,
      });
    }
    this.loginAttempts.set(email, attempts);
  },
  isLocked(email: string) {
    const attempts = this.loginAttempts.get(email);
    if (attempts?.lockedUntil && attempts.lockedUntil > Date.now()) {
      return { locked: true, until: attempts.lockedUntil };
    }
    return { locked: false };
  }
};

export const PUBLIC_APPOINTMENTS_API_V1 = {
  basePath: "/api/appointments-public/v1",
  availability: "/api/appointments-public/v1/availability",
  reservations: "/api/appointments-public/v1/reservations",
  reservationByToken: (token: string) => `/api/appointments-public/v1/reservations/token/${token}`,
  confirmByToken: (token: string) => `/api/appointments-public/v1/reservations/token/${token}/confirm`,
  cancelByToken: (token: string) => `/api/appointments-public/v1/reservations/token/${token}/cancel`,
} as const;

export const SECURITY_HEADERS = {
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "Content-Security-Policy": "default-src 'self'; script-src 'self'; object-src 'none';",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin"
};

const authorize = async (actorId: string, patientId?: string, clinicId: string | null = null, requiredRole?: string) => {
  const user = mockUsers.find(u => u.id === actorId) || (mockProfessional.id === actorId ? mockProfessional : undefined);
  if (!user) throw new Error("Usuario no encontrado");

  if (requiredRole && user.role !== requiredRole) {
    throw new Error(`Acceso denegado: Se requiere rol ${requiredRole}`);
  }

  const restriction = getUserRestrictions(user);
  if (restriction) {
    throw new Error(`Acceso restringido: ${restriction}`);
  }

  if (patientId && user.role === "profesional") {
    const hasAuth = mockAccessGrants.some(
      g => g.patientId === patientId && g.professionalId === actorId && g.status === "active"
    );
    if (!hasAuth) {
      if (requiredRole === "profesional") {
        throw new Error("No existe una autorización vigente para este paciente en el ámbito seleccionado.");
      }
      throw new Error("No tiene autorización para acceder a este paciente");
    }
  }

  return true;
};

const decryptPatient = (p: Patient): Patient => ({
  ...p,
  email: decrypt(p.email) || "",
  phone: decrypt(p.phone) || "",
  address: decrypt(p.address) || "",
  allergies: decrypt(p.allergies) || "",
  conditions: decrypt(p.conditions) || "",
  documentNumber: decrypt(p.documentNumber) || "",
});

const encryptPatient = (p: Partial<Patient>): Patient => {
  const e = { ...p };
  if (p.email) e.email = encrypt(p.email);
  if (p.phone) e.phone = encrypt(p.phone);
  if (p.address) e.address = encrypt(p.address);
  if (p.documentNumber) e.documentNumber = encrypt(p.documentNumber);
  if (p.allergies) e.allergies = encrypt(p.allergies);
  if (p.conditions) e.conditions = encrypt(p.conditions);
  return e as Patient;
};

const decryptConsultation = (c: Consultation): Consultation => ({
  ...c,
  anamnesis: decrypt(c.anamnesis) || "",
  physicalExam: decrypt(c.physicalExam) || "",
  treatment: decrypt(c.treatment) || "",
  notes: decrypt(c.notes) || "",
});

const encryptConsultation = (c: Partial<Consultation>): Consultation => {
  const e = { ...c };
  if (c.anamnesis) e.anamnesis = encrypt(c.anamnesis);
  if (c.physicalExam) e.physicalExam = encrypt(c.physicalExam);
  if (c.treatment) e.treatment = encrypt(c.treatment);
  if (c.notes) e.notes = encrypt(c.notes);
  return e as Consultation;
};

function success<T>(data: T): ApiResponse<T> {
  return { data, success: true };
}

function paginated<T>(data: T[], total: number, page = 1, limit = 20): PaginatedResponse<T> {
  return { data, success: true, total, page, limit };
}

// ===== AUTH =====
export const authApi = {
  async login(email: string, password: string): Promise<ApiResponse<{ user: User; mfaRequired?: boolean }>> {
    const ip = "127.0.0.1";
    const lockout = securityTracker.isLocked(email);
    if (lockout.locked) {
      throw new Error(`Cuenta bloqueada temporalmente. Intente nuevamente en ${Math.ceil((lockout.until! - Date.now()) / 60000)} minutos.`);
    }

    const correlationId = `login-${Date.now()}`;
    try {
      const response = await fetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      if (!response.ok) {
        await securityTracker.trackLoginAttempt(email, ip, false);
        throw new Error("Credenciales inválidas");
      }

      const result = await response.json();
      await securityTracker.trackLoginAttempt(email, ip, true);

      if (result.data.mfaRequired) {
        return result;
      }

      recordAuditEvent({
        actor: { id: result.data.user.id, name: `${result.data.user.firstName} ${result.data.user.lastName}`, role: result.data.user.role },
        action: "login",
        resource: "auth",
        details: "Inicio de sesión exitoso",
        ipAddress: "127.0.0.1",
        device: "Web Browser",
        result: "success",
        correlationId,
      });

      return result;
    } catch (error: any) {
      recordAuditEvent({
        actor: { id: "unknown", name: email, role: "unknown" },
        action: "login",
        resource: "auth",
        details: `Fallo de inicio de sesión: ${error.message}`,
        ipAddress: "127.0.0.1",
        device: "Web Browser",
        result: "failure",
        correlationId,
      });
      throw error;
    }
  },
  async registerPatient(data: Partial<User> & { password?: string; inviteToken?: string }): Promise<ApiResponse<{ user: User }>> {
    const correlationId = `reg-pat-${Date.now()}`;
    try {
      const response = await fetch("/auth/register/patient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Error al registrar paciente");
      const result = await response.json();

      recordAuditEvent({
        actor: { id: result.data.user.id, name: `${result.data.user.firstName} ${result.data.user.lastName}`, role: "paciente" },
        action: "register",
        resource: "auth",
        details: "Registro de nuevo paciente",
        ipAddress: "127.0.0.1",
        device: "Web Browser",
        result: "success",
        correlationId,
      });

      return result;
    } catch (error: any) {
      recordAuditEvent({
        actor: { id: "unknown", name: data.email || "unknown", role: "paciente" },
        action: "register",
        resource: "auth",
        details: `Fallo de registro: ${error.message}`,
        ipAddress: "127.0.0.1",
        device: "Web Browser",
        result: "failure",
        correlationId,
      });
      throw error;
    }
  },
  async registerProfessional(data: Partial<Professional> & { password?: string }): Promise<ApiResponse<{ user: User }>> {
    const correlationId = `reg-prof-${Date.now()}`;
    try {
      const response = await fetch("/auth/register/professional", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Error al registrar profesional");
      const result = await response.json();

      recordAuditEvent({
        actor: { id: result.data.user.id, name: `${result.data.user.firstName} ${result.data.user.lastName}`, role: "profesional" },
        action: "register",
        resource: "auth",
        details: "Registro de nuevo profesional",
        ipAddress: "127.0.0.1",
        device: "Web Browser",
        result: "success",
        correlationId,
      });

      return result;
    } catch (error: any) {
      recordAuditEvent({
        actor: { id: "unknown", name: data.email || "unknown", role: "profesional" },
        action: "register",
        resource: "auth",
        details: `Fallo de registro: ${error.message}`,
        ipAddress: "127.0.0.1",
        device: "Web Browser",
        result: "failure",
        correlationId,
      });
      throw error;
    }
  },
  async verifyEmail(email: string, code: string): Promise<ApiResponse<{ user: User }>> {
    const response = await fetch("/auth/email/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
      credentials: "include",
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al verificar correo");
    }
    return response.json();
  },
  async resendVerificationEmail(email: string): Promise<ApiResponse<{ message: string; cooldownUntil?: string }>> {
    const response = await fetch("/auth/email/resend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
      credentials: "include",
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al reenviar correo de verificación");
    }
    return response.json();
  },
  async recoverPassword(email: string) {
    const response = await fetch("/auth/recover-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
      credentials: "include",
    });
    if (!response.ok) throw new Error("Error al iniciar recuperación de contraseña");
    return response.json();
  },
  async resetPassword(token: string, password: string): Promise<ApiResponse<{ message: string }>> {
    const response = await fetch("/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
      credentials: "include",
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al restablecer contraseña");
    }
    return response.json();
  },
  async verifyMfa(code: string): Promise<ApiResponse<{ user: User }>> {
    const response = await fetch("/auth/mfa/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
      credentials: "include",
    });
    if (!response.ok) throw new Error("Código MFA inválido");
    return response.json();
  },
  async toggleMfa(enabled: boolean): Promise<ApiResponse<{ secret?: string; qrCode?: string }>> {
    const response = await fetch("/auth/mfa/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled }),
      credentials: "include",
    });
    if (!response.ok) throw new Error("Error al configurar MFA");
    return response.json();
  },
  async getCurrentUser(): Promise<ApiResponse<User>> {
    const response = await fetch("/auth/me", {
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    if (!response.ok) throw new Error("No autenticado");
    return response.json();
  },
  async logout() {
    const user = mockProfessional; // Simulated current user
    const correlationId = `logout-${Date.now()}`;

    recordAuditEvent({
      actor: { id: user.id, name: `${user.firstName} ${user.lastName}`, role: user.role },
      action: "logout",
      resource: "auth",
      details: "Cierre de sesión",
      ipAddress: "127.0.0.1",
      device: "Web Browser",
      result: "success",
      correlationId,
    });

    const response = await fetch("/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    return response.json();
  },
  async refresh(): Promise<ApiResponse<{ user: User }>> {
    const response = await fetch("/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    if (!response.ok) throw new Error("Error al refrescar sesión");
    return response.json();
  },
  async listSessions(): Promise<ApiResponse<UserSession[]>> {
    const response = await fetch("/auth/sessions", {
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    if (!response.ok) throw new Error("Error al listar sesiones");
    return response.json();
  },
  async revokeSession(sessionId: string): Promise<ApiResponse<{ message: string }>> {
    const response = await fetch(`/auth/sessions/${sessionId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    if (!response.ok) throw new Error("Error al revocar sesión");
    return response.json();
  },
};

// ===== HELPERS =====
const normalizeValue = (val: string) => (val || "").trim().toLowerCase();
const normalizeDocument = (val: string) => (val || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

const resolvePatientIdentity = (data: Partial<Patient>): Patient | undefined => {
  const normEmail = normalizeValue(decrypt(data.email || ""));
  const normDoc = normalizeDocument(decrypt(data.documentNumber || ""));
  const docType = data.documentType || "dni";

  return mockPatients.find(p => {
    const decP = decryptPatient(p);
    const pEmail = normalizeValue(decP.email);
    const pDoc = normalizeDocument(decP.documentNumber);
    const pDocType = decP.documentType || "dni";

    // Primary match: Normalized Document Number + Document Type
    if (normDoc && pDoc === normDoc && docType === pDocType) return true;

    // Secondary match: Normalized Email
    if (normEmail && pEmail === normEmail) return true;

    return false;
  });
};

const hasActiveAccessGrant = (patientId: string, professionalId: string, clinicId: string | null): boolean => {
  return mockAccessGrants.some(
    g => g.patientId === patientId &&
         g.professionalId === professionalId &&
         g.clinicId === clinicId &&
         g.status === "active"
  );
};

const enrichPatient = (patient: Patient, professionalId: string): Patient => {
  // Use Access Grants as the source of truth for authorization
  const activeGrants = mockAccessGrants.filter(
    g => g.patientId === patient.id && g.professionalId === professionalId && g.status === "active"
  );

  const clinicIds = activeGrants
    .filter(g => g.clinicId !== null)
    .map(g => g.clinicId as string);

  const isPrivate = activeGrants.some(g => g.clinicId === null);

  // Status is active if at least one access grant is active
  const isActive = activeGrants.length > 0;

  // For stats, we still use CareAuthorizations but only if there's an active grant
  const authorizations = mockCareAuthorizations.filter(
    a => a.patientId === patient.id &&
         a.professionalId === professionalId &&
         hasActiveAccessGrant(a.patientId, a.professionalId, a.clinicId)
  );

  // Aggregate stats
  let totalVisits = 0;
  let lastVisit = patient.createdAt;

  authorizations.forEach(a => {
    totalVisits += a.totalVisits;
    if (a.lastVisit && new Date(a.lastVisit) > new Date(lastVisit)) {
      lastVisit = a.lastVisit;
    }
  });

  return {
    ...patient,
    clinicIds,
    isPrivate,
    status: isActive ? "activo" : "inactivo",
    totalVisits,
    lastVisit,
  };
};

// ===== PATIENTS =====
export const patientsApi = {
  async list(params?: { search?: string; page?: number; limit?: number; clinicalType?: string; reason?: string; context?: string }) {
    await delay();
    const professionalId = mockProfessional.id; // Assume current logged in professional

    recordAuditEvent({
      actor: { id: professionalId, name: `${mockProfessional.firstName} ${mockProfessional.lastName}`, role: mockProfessional.role },
      action: "hc.list",
      resource: "patients",
      details: "Lectura de listado de pacientes",
      ipAddress: "127.0.0.1",
      device: "Web Browser",
      result: "success",
      correlationId: `list-${Date.now()}`,
      reason: params?.reason || "Navegación general",
      context: params?.context || "Panel de pacientes",
    });

    // Only show patients the professional has an active access grant for
    await authorize(mockProfessional.id, undefined, null, "profesional");
    const authorizedPatientIds = new Set(
      mockAccessGrants
        .filter(g => g.professionalId === professionalId && g.status === "active")
        .map(g => g.patientId)
    );

    let results = mockPatients
      .filter(p => authorizedPatientIds.has(p.id))
      .map(p => enrichPatient(decryptPatient(p), professionalId));

    if (params?.search) {
      const q = params.search.toLowerCase();
      results = results.filter(p =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        p.documentNumber.includes(q) ||
        `${p.documentType} ${p.documentNumber}`.toLowerCase().includes(q)
      );
    }

    if (params?.clinicalType === "first") {
      results = results.filter(p => p.totalVisits === 1);
    } else if (params?.clinicalType === "followup") {
      results = results.filter(p => p.totalVisits > 1);
    }

    return paginated(results, results.length, params?.page, params?.limit);
  },
  async getById(id: string, audit?: { reason: string; context: string }) {
    await authorize(mockProfessional.id, id, null, "profesional");
    await delay();
    const professionalId = mockProfessional.id;
    const patient = mockPatients.find(p => p.id === id);

    const correlationId = `read-${id}-${Date.now()}`;

    if (!patient) {
      recordAuditEvent({
        actor: { id: professionalId, name: `${mockProfessional.firstName} ${mockProfessional.lastName}`, role: mockProfessional.role },
        action: "hc.read",
        resource: `patients/${id}`,
        details: "Fallo al leer paciente: No encontrado",
        ipAddress: "127.0.0.1",
        device: "Web Browser",
        result: "failure",
        correlationId,
        reason: audit?.reason,
        context: audit?.context,
      });
      throw new Error("Paciente no encontrado");
    }

    // Check if professional has ANY active access grant for this patient
    const hasAuth = mockAccessGrants.some(
      g => g.patientId === id && g.professionalId === professionalId && g.status === "active"
    );

    if (!hasAuth) {
      recordAuditEvent({
        actor: { id: professionalId, name: `${mockProfessional.firstName} ${mockProfessional.lastName}`, role: mockProfessional.role },
        action: "hc.read",
        resource: `patients/${id}`,
        details: "Fallo al leer paciente: Sin autorización",
        ipAddress: "127.0.0.1",
        device: "Web Browser",
        result: "failure",
        correlationId,
        reason: audit?.reason,
        context: audit?.context,
      });
      throw new Error("No tiene autorización para acceder a este paciente");
    }

    const decPatient = decryptPatient(patient);

    recordAuditEvent({
      actor: { id: professionalId, name: `${mockProfessional.firstName} ${mockProfessional.lastName}`, role: mockProfessional.role },
      action: "hc.read",
      resource: `patients/${id}`,
      details: `Lectura de historia clínica de ${decPatient.firstName} ${decPatient.lastName}`,
      ipAddress: "127.0.0.1",
      device: "Web Browser",
      result: "success",
      correlationId,
      reason: audit?.reason || "Consulta de paciente",
      context: audit?.context || "Perfil de paciente",
    });

    return success(enrichPatient(decPatient, professionalId));
  },
  async create(data: Partial<Patient>) {
    await delay();
    const professionalId = mockProfessional.id;
    const normalizedData = {
      ...data,
      email: data.email ? normalizeValue(decrypt(data.email)) : "",
      documentNumber: data.documentNumber ? normalizeDocument(decrypt(data.documentNumber)) : "",
    };

    const existingPatient = resolvePatientIdentity(normalizedData);
    const targetClinicId = (data.clinicIds && data.clinicIds.length > 0) ? data.clinicIds[0] : null;

    if (existingPatient) {
      // Identity resolution match
      const hasAuth = mockCareAuthorizations.some(
        a => a.patientId === existingPatient.id &&
             a.professionalId === professionalId &&
             a.clinicId === targetClinicId
      );

      if (!hasAuth) {
        mockCareAuthorizations.push({
          id: `auth-${Date.now()}`,
          patientId: existingPatient.id,
          professionalId,
          clinicId: targetClinicId,
          status: "active",
          createdAt: new Date().toISOString(),
          totalVisits: 0,
        });

        // Also create Access Grant for this new link
        mockAccessGrants.push({
          id: `grant-${Date.now()}`,
          patientId: existingPatient.id,
          professionalId,
          clinicId: targetClinicId,
          consentAcceptanceId: "acc-1", // Assume pre-existing consent for simplified mock
          status: "active",
          grantedAt: new Date().toISOString(),
        });
      }

      const decExisting = decryptPatient(existingPatient);
      recordAuditEvent({
        actor: { id: professionalId, name: `${mockProfessional.firstName} ${mockProfessional.lastName}`, role: mockProfessional.role },
        action: "patient.identity_reuse",
        resource: "patients",
        details: `Reutilizada identidad existente para paciente ${decExisting.firstName} ${decExisting.lastName} (DNI: ${decExisting.documentNumber})`,
        ipAddress: "127.0.0.1",
        device: "Server-side",
        result: "success",
        correlationId: `reuse-${Date.now()}`,
      });

      return success(enrichPatient(decExisting, professionalId));
    }

    // New patient
    const newPatientId = `p-${Date.now()}`;
    const newPatientBase = {
      ...normalizedData,
      id: newPatientId,
      createdAt: new Date().toISOString(),
      totalVisits: 0,
      status: "activo",
    } as Patient;

    mockPatients.push(encryptPatient(newPatientBase));

    mockCareAuthorizations.push({
      id: `auth-${Date.now()}`,
      patientId: newPatientId,
      professionalId,
      clinicId: targetClinicId,
      status: "active",
      createdAt: new Date().toISOString(),
      totalVisits: 0,
    });

    mockAccessGrants.push({
      id: `grant-${Date.now()}`,
      patientId: newPatientId,
      professionalId,
      clinicId: targetClinicId,
      consentAcceptanceId: "acc-1", // Assume pre-existing consent for simplified mock
      status: "active",
      grantedAt: new Date().toISOString(),
    });

    recordAuditEvent({
      actor: { id: professionalId, name: `${mockProfessional.firstName} ${mockProfessional.lastName}`, role: mockProfessional.role },
      action: "patient.create",
      resource: "patients",
      details: `Creado nuevo paciente ${newPatientBase.firstName} ${newPatientBase.lastName} (DNI: ${newPatientBase.documentNumber})`,
      ipAddress: "127.0.0.1",
      device: "Server-side",
      result: "success",
      correlationId: `create-${Date.now()}`,
    });

    return success(enrichPatient(newPatientBase, professionalId));
  },
  async update(id: string, data: Partial<Patient>) {
    await delay();
    const professionalId = mockProfessional.id;
    const patient = mockPatients.find(p => p.id === id);
    if (!patient) throw new Error("Paciente no encontrado");

    recordAuditEvent({
      actor: { id: professionalId, name: `${mockProfessional.firstName} ${mockProfessional.lastName}`, role: mockProfessional.role },
      action: "hc.update",
      resource: `patients/${id}`,
      details: `Actualización de historia clínica de ${patient.firstName} ${patient.lastName}`,
      ipAddress: "127.0.0.1",
      device: "Web Browser",
      result: "success",
      correlationId: `update-${id}-${Date.now()}`,
    });

    const updatedPatient = { ...patient, ...data } as Patient;
    return success(enrichPatient(decryptPatient(updatedPatient), professionalId));
  },
};

// ===== APPOINTMENTS =====
export const appointmentsApi = {
  async list(params?: { date?: string; patientId?: string; status?: string }) {
    await authorize(mockProfessional.id, params?.patientId, null, "profesional");
    await delay();
    let results = [...mockAppointments];
    if (params?.date) results = results.filter(a => a.date === params.date);
    if (params?.patientId) results = results.filter(a => a.patientId === params.patientId);
    if (params?.status) results = results.filter(a => a.status === params.status);
    return success(results);
  },
  async getById(id: string) {
    await delay();
    const apt = mockAppointments.find(a => a.id === id);
    if (!apt) throw new Error("Cita no encontrada");
    return success(apt);
  },
  async create(data: Partial<Appointment>) {
    await authorize(mockProfessional.id, data.patientId, data.clinicId || null, "profesional");
    await delay();
    const professionalId = mockProfessional.id;

    // Validate active access grant
    const hasAuth = hasActiveAccessGrant(data.patientId!, professionalId, data.clinicId || null);

    if (!hasAuth) {
      throw new Error("No existe una autorización vigente para agendar citas con este paciente en el ámbito seleccionado.");
    }

    // Determine visit type automatically if not provided
    let visitType = data.type;
    if (!visitType) {
      const auth = mockCareAuthorizations.find(
        a => a.patientId === data.patientId && a.professionalId === professionalId
      );
      visitType = (auth && auth.totalVisits > 0) ? "Seguimiento" : "Primera vez";
    }

    const newAppointment: Appointment = {
      ...data,
      type: visitType,
      id: `apt-${Date.now()}`,
      status: data.status || "pendiente",
      createdByRole: data.createdByRole || "profesional",
      confirmationSource: data.confirmationSource || (data.status === "confirmada" ? "profesional" : null),
      cancellationDeadlineHours: data.cancellationDeadlineHours || getAppointmentTypePolicy(undefined, visitType)?.cancellationDeadlineHours || DEFAULT_CANCELLATION_DEADLINE_HOURS,
    } as Appointment;

    mockAppointments.push(newAppointment);
    return success(newAppointment);
  },
  async update(id: string, data: Partial<Appointment>) {
    await delay();
    const index = mockAppointments.findIndex(a => a.id === id);
    if (index === -1) throw new Error("Cita no encontrada");

    const previous = mockAppointments[index];
    const updatedApt = {
      ...previous,
      ...data
    } as Appointment;

    // If status changes to confirmed and no confirmation info is provided, set defaults
    if (data.status === "confirmada" && previous.status !== "confirmada") {
      updatedApt.confirmedAt = updatedApt.confirmedAt || new Date().toISOString();
      updatedApt.confirmationSource = updatedApt.confirmationSource || "profesional";
    }

    mockAppointments[index] = updatedApt;
    return success(updatedApt);
  },
  async cancel(id: string) {
    return this.update(id, {
      status: "cancelada",
      cancelledAt: new Date().toISOString(),
    });
  },
  async reschedule(id: string, data: { date: string; time: string; endTime: string }) {
    await delay();
    const index = mockAppointments.findIndex(a => a.id === id);
    if (index === -1) throw new Error("Cita no encontrada");

    const updatedApt = {
      ...mockAppointments[index],
      ...data,
      rescheduledAt: new Date().toISOString()
    } as Appointment;

    mockAppointments[index] = updatedApt;

    return success(updatedApt);
  },
  async getAvailableSlots(professionalId: string, date: string) {
    await delay();
    const dayOfWeek = new Date(`${date}T12:00:00`).getDay();
    const schedule = schedulingConfig.schedules.find(s => s.dayOfWeek === dayOfWeek && s.enabled);

    if (!schedule) return success([]);

    const [startH, startM] = schedule.startTime.split(":").map(Number);
    const [endH, endM] = schedule.endTime.split(":").map(Number);

    const slots: string[] = [];
    let currentTotal = startH * 60 + startM;
    const endTotal = endH * 60 + endM;

    while (currentTotal < endTotal) {
      const h = Math.floor(currentTotal / 60);
      const m = currentTotal % 60;
      slots.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`);
      currentTotal += schedulingConfig.slotIntervalMinutes;
    }

    const booked = mockAppointments
      .filter(a => a.date === date && a.professionalId === professionalId)
      .map(a => a.time);

    return success(slots.filter(s => !booked.includes(s)));
  },
  async getByToken(token: string) {
    await delay();
    const tokenData = mockAppointmentTokens.find(t => t.token === token);
    if (!tokenData) throw new Error("Token de acceso no válido");
    if (new Date(tokenData.expiresAt) < new Date()) throw new Error("Token de acceso expirado");

    const apt = mockAppointments.find(a => a.id === tokenData.appointmentId);
    if (!apt) throw new Error("Cita no encontrada");

    // Enrich with patient phone if missing
    if (!apt.patientPhone) {
      const patient = mockPatients.find(p => p.id === apt.patientId);
      if (patient) {
        apt.patientPhone = decrypt(patient.phone);
      }
    }

    return success(apt);
  },
  async generateSignedUrl(appointmentId: string) {
    await delay();
    let tokenData = mockAppointmentTokens.find(t => t.appointmentId === appointmentId);

    // Si no existe un token para esta cita, creamos uno (mock)
    if (!tokenData) {
      tokenData = {
        token: `token-${appointmentId}-${Date.now()}`,
        appointmentId,
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        permissions: ["confirm", "cancel"]
      };
      mockAppointmentTokens.push(tokenData);
    }

    const apt = mockAppointments.find(a => a.id === appointmentId);
    if (apt && !apt.patientPhone) {
      const patient = mockPatients.find(p => p.id === apt.patientId);
      if (patient) {
        apt.patientPhone = decrypt(patient.phone);
      }
    }

    const url = `${window.location.origin}/citas/v/${tokenData.token}`;
    return success({ url });
  },
};

// ===== CONSULTATIONS =====
export const consultationsApi = {
  async list(params?: { patientId?: string; type?: string; reason?: string; context?: string }) {
    await authorize(mockProfessional.id, params?.patientId, null, "profesional");
    await delay();
    const professionalId = mockProfessional.id;

    recordAuditEvent({
      actor: { id: professionalId, name: `${mockProfessional.firstName} ${mockProfessional.lastName}`, role: mockProfessional.role },
      action: "hc.consultations.list",
      resource: params?.patientId ? `patients/${params.patientId}/consultations` : "consultations",
      details: "Lectura de listado de consultas",
      ipAddress: "127.0.0.1",
      device: "Web Browser",
      result: "success",
      correlationId: `con-list-${Date.now()}`,
      reason: params?.reason || "Navegación HC",
      context: params?.context || "Listado de consultas",
    });

    let results = [...mockConsultations];
    if (params?.patientId) results = results.filter(c => c.patientId === params.patientId);
    if (params?.type && params.type !== "all") {
      results = results.filter(c => c.type === params.type);
    }
    return success(results);
  },
  async getById(id: string, audit?: { reason: string; context: string }) {
    const professionalId = mockProfessional.id;
    const consultation = mockConsultations.find(c => c.id === id);
    if (consultation) {
      await authorize(professionalId, consultation.patientId, consultation.clinicId || null, "profesional");
    }
    await delay();

    if (!consultation) {
      recordAuditEvent({
        actor: { id: professionalId, name: `${mockProfessional.firstName} ${mockProfessional.lastName}`, role: mockProfessional.role },
        action: "hc.consultation.read",
        resource: `consultations/${id}`,
        details: "Fallo al leer consulta: No encontrada",
        ipAddress: "127.0.0.1",
        device: "Web Browser",
        result: "failure",
        correlationId: `con-read-${id}-${Date.now()}`,
        reason: audit?.reason,
        context: audit?.context,
      });
      throw new Error("Consulta no encontrada");
    }

    recordAuditEvent({
      actor: { id: professionalId, name: `${mockProfessional.firstName} ${mockProfessional.lastName}`, role: mockProfessional.role },
      action: "hc.consultation.read",
      resource: `consultations/${id}`,
      details: `Lectura de consulta médica del paciente ${consultation.patientName}`,
      ipAddress: "127.0.0.1",
      device: "Web Browser",
      result: "success",
      correlationId: `con-read-${id}-${Date.now()}`,
      reason: audit?.reason || "Revisión de historial",
      context: audit?.context || "Detalle de consulta",
    });

    return success(decryptConsultation(consultation));
  },
  async create(data: Partial<Consultation>) {
    await authorize(mockProfessional.id, data.patientId, data.clinicId || null, "profesional");
    await delay();
    const professionalId = mockProfessional.id;
    const correlationId = `con-create-${Date.now()}`;

    // Validate active access grant
    const hasAuth = hasActiveAccessGrant(data.patientId!, professionalId, data.clinicId || null);

    if (!hasAuth) {
      recordAuditEvent({
        actor: { id: professionalId, name: `${mockProfessional.firstName} ${mockProfessional.lastName}`, role: mockProfessional.role },
        action: "hc.consultation.create",
        resource: "consultations",
        details: "Fallo al crear consulta: Sin autorización",
        ipAddress: "127.0.0.1",
        device: "Web Browser",
        result: "failure",
        correlationId,
      });
      throw new Error("No existe una autorización vigente para realizar consultas a este paciente en el ámbito seleccionado.");
    }

    recordAuditEvent({
      actor: { id: professionalId, name: `${mockProfessional.firstName} ${mockProfessional.lastName}`, role: mockProfessional.role },
      action: "hc.consultation.create",
      resource: "consultations",
      details: `Creación de nueva consulta para paciente ID: ${data.patientId}`,
      ipAddress: "127.0.0.1",
      device: "Web Browser",
      result: "success",
      correlationId,
    });

    // Update authorization stats
    const auth = mockCareAuthorizations.find(
      a => a.patientId === data.patientId &&
           a.professionalId === professionalId &&
           a.clinicId === (data.clinicId || null)
    );
    if (auth) {
      auth.totalVisits += 1;
      auth.lastVisit = new Date().toISOString();
    }

    const newConsultation = { ...data, id: `con-${Date.now()}` } as Consultation;
    mockConsultations.push(encryptConsultation(newConsultation));
    return success(newConsultation);
  },
};

// ===== DIAGNOSES =====
const DIAGNOSES_RESULT_LIMIT = 20;

export const diagnosesApi = {
  async search(query: string, codingSystems?: string[], limit = DIAGNOSES_RESULT_LIMIT) {
    await delay(200);
    const q = (query || "").trim().toLowerCase();
    if (q.length < 2) {
      return { ...success<Diagnosis[]>([]), total: 0, limit, truncated: false };
    }
    let results = mockDiagnoses.filter(d =>
      d.code.toLowerCase().includes(q) || d.name.toLowerCase().includes(q)
    );
    if (codingSystems && codingSystems.length > 0) {
      results = results.filter(d => codingSystems.includes(d.codingSystem));
    }
    const total = results.length;
    const truncated = total > limit;
    return { ...success(results.slice(0, limit)), total, limit, truncated };
  },
};

// ===== NOTIFICATIONS =====
export const notificationsApi = {
  async list(params?: { unreadOnly?: boolean }) {
    await delay();
    let results = [...mockNotifications];
    if (params?.unreadOnly) results = results.filter(n => !n.read);
    return success(results);
  },
  async markAsRead(id: string) {
    await delay(100);
    return success({ message: "Notificación marcada como leída." });
  },
  async markAllAsRead() {
    await delay(100);
    return success({ message: "Todas las notificaciones marcadas como leídas." });
  },
};

// ===== DASHBOARD =====
export const dashboardApi = {
  async getStats() {
    await delay();
    return success(mockDashboardStats);
  },
  async getTodayAppointments() {
    await delay();
    const today = mockAppointments.filter(a => a.date === "2026-04-10");
    return success(today);
  },
  async getAlerts() {
    await delay(100);
    return success([
      { message: "3 citas pendientes de confirmación", type: "warning" as const },
      { message: "Recordatorio: Actualizar horarios para la próxima semana", type: "info" as const },
    ]);
  },
};

// ===== REPORTS =====
export const reportsApi = {
  async getMetrics() {
    await delay();
    return success(mockReportMetrics);
  },
};

// ===== SETTINGS =====
export const settingsApi = {
  async getProfile() {
    await delay();
    return success(mockProfessional);
  },
  async updateProfile(data: Partial<Professional>) {
    await delay();
    return success({ ...mockProfessional, ...data });
  },
  async getAppointmentTypes() {
    await delay();
    return success(schedulingConfig.appointmentTypes);
  },
  async updateAppointmentType(id: string, data: Partial<AppointmentType>) {
    await delay();
    return success(data);
  },
  async getSchedules() {
    await delay();
    return success(schedulingConfig.schedules);
  },
  async getLocations() {
    await delay();
    return success(schedulingConfig.locations);
  },
  async requestPremiumUpgrade(feature: string) {
    await delay();
    console.log(`[TRACKING] User requested premium upgrade for feature: ${feature}`);
    return success({ message: "Solicitud de versión Premium enviada con éxito. Nos pondremos en contacto contigo pronto." });
  },
  async revalidateLicense() {
    await delay(1500);
    const statuses: any[] = ["valid", "invalid", "unverifiable"];
    const newStatus = statuses[Math.floor(Math.random() * statuses.length)];

    // Update mock professional
    mockProfessional.licenseStatus = newStatus;
    mockProfessional.licenseLastCheckedAt = new Date().toISOString();

    return success({
      status: newStatus,
      lastCheckedAt: mockProfessional.licenseLastCheckedAt,
      message: `Matrícula validada con resultado: ${newStatus}`
    });
  },
};

// ===== ADMIN =====
export const adminApi = {
  async listUsers(params?: { search?: string; role?: string }) {
    await delay();
    let results = [...mockUsers];
    if (params?.search) {
      const q = params.search.toLowerCase();
      results = results.filter(u =>
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      );
    }
    if (params?.role) results = results.filter(u => u.role === params.role);
    return paginated(results, results.length);
  },
  async getAuditLogs(params?: { search?: string }) {
    await delay();
    let results = [...mockAuditLogs];
    if (params?.search) {
      const q = params.search.toLowerCase();
      results = results.filter(l =>
        l.userName.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        l.details.toLowerCase().includes(q)
      );
    }
    return success(results);
  },
  async getSystemHealth() {
    await delay();
    return success(mockSystemHealth);
  },
  async getNotificationLogs() {
    await delay();
    return success(mockNotifications);
  },
};

// ===== PATIENT PORTAL =====
export const patientPortalApi = {
  async getDashboard() {
    await delay();
    const upcoming = mockPatientPortalAppointments.filter(a => a.status !== "completada" && a.status !== "cancelada");
    return success({ upcoming, totalAppointments: mockPatientPortalAppointments.length });
  },
  async getAppointments() {
    await delay();
    return success(mockPatientPortalAppointments);
  },
  async getNotifications() {
    await delay();
    return success(mockPatientNotifications);
  },
  async markNotificationRead(id: string) {
    await delay(100);
    const notification = mockPatientNotifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
    }
    return success({ message: "Notificación marcada como leída." });
  },
  async markAllNotificationsRead() {
    await delay(100);
    mockPatientNotifications.forEach(n => {
      n.read = true;
    });
    return success({ message: "Todas las notificaciones marcadas como leídas." });
  },
  async getProfile() {
    await delay();
    return success(decryptPatient(mockPatients[0]));
  },
  async getRequests() {
    await delay();
    // Get requests for the current patient (p-1)
    const requests = mockProfessionalPatientRequests.filter(r => r.patientId === "p-1");
    return success(requests);
  },
  async acceptRequest(requestId: string, acceptanceData?: {
    method: AcceptanceMethod;
    ipAddress: string;
    userAgent: string;
  }) {
    await delay();
    const request = mockProfessionalPatientRequests.find(r => r.id === requestId);
    if (!request) throw new Error("Solicitud no encontrada");

    const docId = request.consentDocumentId || mockConsentDocuments[0].id;
    const doc = mockConsentDocuments.find(d => d.id === docId);
    if (!doc) throw new Error("Documento de consentimiento no disponible");

    request.status = "accepted";
    const correlationId = `consent-accept-${requestId}-${Date.now()}`;

    recordAuditEvent({
      actor: { id: request.patientId, name: "Paciente", role: "paciente" },
      action: "consent.accept",
      resource: `requests/${requestId}`,
      details: "Aceptación de consentimiento y acceso",
      ipAddress: acceptanceData?.ipAddress || "127.0.0.1",
      device: acceptanceData?.userAgent || "Unknown",
      result: "success",
      correlationId,
    });

    // Create Consent Acceptance with full traceability
    const acceptance: ConsentAcceptance = {
      id: `acc-${Date.now()}`,
      consentDocumentId: doc.id,
      patientId: request.patientId,
      acceptedAt: new Date().toISOString(),
      ipAddress: acceptanceData?.ipAddress || "127.0.0.1",
      userAgent: acceptanceData?.userAgent || "Unknown",
      method: acceptanceData?.method || "panel",
      consentVersionHash: doc.versionHash,
    };
    mockConsentAcceptances.push(acceptance);

    // Create Access Grant
    const grant: AccessGrant = {
      id: `grant-${Date.now()}`,
      patientId: request.patientId,
      professionalId: request.professionalId,
      clinicId: request.clinicId || null,
      consentAcceptanceId: acceptance.id,
      status: "active",
      grantedAt: acceptance.acceptedAt,
    };
    mockAccessGrants.push(grant);

    // Keep CareAuthorization for legacy compatibility during transition
    const newAuth: CareAuthorization = {
      id: `auth-${Date.now()}`,
      patientId: request.patientId,
      professionalId: request.professionalId,
      clinicId: request.clinicId || null,
      status: "active",
      createdAt: new Date().toISOString(),
      totalVisits: 0,
    };
    mockCareAuthorizations.push(newAuth);

    const patient = mockPatients.find(p => p.id === request.patientId);
    const patientName = patient ? `${patient.firstName} ${patient.lastName}` : "Paciente";
    mockPatientNotifications.push({
      id: `pn-${Date.now()}`,
      type: "patient",
      title: "Solicitud aceptada",
      message: `El paciente ${patientName} ha aceptado tu solicitud de acceso`,
      time: "Ahora",
      read: false,
      createdAt: new Date().toISOString(),
    });

    return success(request);
  },
  async acceptConsentByToken(token: string, acceptanceData: {
    method: AcceptanceMethod;
    ipAddress: string;
    userAgent: string;
  }) {
    await delay();
    // Simulate finding a request/invitation from a signed token
    if (!token.startsWith("signed-")) throw new Error("Token no válido");

    // Mock logic: assume it's for the first pending request
    const request = mockProfessionalPatientRequests.find(r => r.status === "pending");
    if (!request) throw new Error("No hay solicitudes pendientes para este token");

    return this.acceptRequest(request.id, acceptanceData);
  },
  async getAccessGrants(): Promise<ApiResponse<AccessGrant[]>> {
    await delay();
    // Simplified: return grants for the current patient (p-1)
    return success(mockAccessGrants.filter(g => g.patientId === "p-1"));
  },
  async revokeAccessGrant(grantId: string) {
    await delay();
    const grant = mockAccessGrants.find(g => g.id === grantId);
    if (!grant) throw new Error("Permiso de acceso no encontrado");

    recordAuditEvent({
      actor: { id: grant.patientId, name: "Paciente", role: "paciente" },
      action: "consent.revoke",
      resource: `grants/${grantId}`,
      details: "Revocación de acceso profesional",
      ipAddress: "127.0.0.1",
      device: "Web Browser",
      result: "success",
      correlationId: `consent-revoke-${grantId}-${Date.now()}`,
    });

    grant.status = "revoked";
    grant.revokedAt = new Date().toISOString();

    // Revoke corresponding CareAuthorization if it exists
    const auth = mockCareAuthorizations.find(
      a => a.patientId === grant.patientId &&
           a.professionalId === grant.professionalId &&
           a.clinicId === grant.clinicId
    );
    if (auth) {
      auth.status = "revoked";
      auth.revokedAt = grant.revokedAt;
    }

    // Invalidate sessions/caches for the professional (simulated)
    console.log(`[REAL-TIME INVALIDATION] Invalidating access for professional ${grant.professionalId} to patient ${grant.patientId}`);
    // In a real system, we would broadcast a WebSocket event or update a Redis cache

    return success({ message: "Acceso revocado exitosamente" });
  },
  async rejectRequest(requestId: string) {
    await delay();
    const request = mockProfessionalPatientRequests.find(r => r.id === requestId);
    if (!request) throw new Error("Solicitud no encontrada");
    request.status = "rejected";

    // Add notification for professional
    const patient = mockPatients.find(p => p.id === request.patientId);
    const patientName = patient ? `${patient.firstName} ${patient.lastName}` : "Paciente";
    mockPatientNotifications.push({
      id: `pn-${Date.now()}`,
      type: "patient",
      title: "Solicitud rechazada",
      message: `El paciente ${patientName} ha rechazado tu solicitud de acceso`,
      time: "Ahora",
      read: false,
      createdAt: new Date().toISOString(),
    });

    return success(request);
  },
};

// ===== CONSENT =====
export const consentApi = {
  async getDocument(id: string): Promise<ApiResponse<ConsentDocument>> {
    await delay();
    const doc = mockConsentDocuments.find(d => d.id === id);
    if (!doc) throw new Error("Documento de consentimiento no encontrado");
    return success(doc);
  },
  async getLatestDocument(): Promise<ApiResponse<ConsentDocument>> {
    await delay();
    return success(mockConsentDocuments[mockConsentDocuments.length - 1]);
  },
  async getSignedAcceptanceToken(acceptanceId: string): Promise<ApiResponse<{ token: string }>> {
    await delay();
    // Simulate generation of a signed token for email/external use
    return success({ token: `signed-acc-${acceptanceId}-${Date.now()}` });
  },
};

// ===== KYC / DOCUMENT VERIFICATION =====
export const kycApi = {
  async uploadDocument(file: File, side: "front" | "back" | "selfie"): Promise<ApiResponse<{ url: string }>> {
    await delay(800);
    // Simulate secure upload and return a "encrypted" reference as requested in requirements
    const ref = `secure://documents/${side}-${Date.now()}.enc`;
    return success({ url: ref });
  },

  async verifyIdentityDocument(
    files: File[], // [front, back]
    formData: { firstName: string; lastName: string; documentType: DocumentType; documentNumber: string },
    selfieFile?: File
  ): Promise<ApiResponse<DocumentVerificationResult>> {
    await delay(2000); // Simulate processing time

    const correlationId = `kyc-${Date.now()}`;
    // Simulate actor as the current professional
    const actor = { id: mockProfessional.id, name: `${mockProfessional.firstName} ${mockProfessional.lastName}`, role: mockProfessional.role };

    // Create initial audit log for attempt
    recordAuditEvent({
      actor,
      action: "kyc.verification_attempt",
      resource: "identity",
      details: `Intento de verificación KYC para documento ${formData.documentNumber}`,
      ipAddress: "127.0.0.1",
      device: "Web Browser",
      result: "success",
      correlationId,
    });

    const hasFront = files.length > 0;
    const hasBack = files.length > 1;
    const hasSelfie = !!selfieFile;

    if (!hasFront || !hasBack || !hasSelfie) {
      const errorResult: DocumentVerificationResult = {
        confidenceScore: 0,
        status: "rejected",
        error: "Se requieren imágenes del frente, dorso y una selfie para completar el KYC.",
      };

      recordAuditEvent({
        actor,
        action: "kyc.verification_failed",
        resource: "identity",
        details: "Faltan documentos requeridos (frente, dorso o selfie).",
        ipAddress: "127.0.0.1",
        device: "Web Browser",
        result: "failure",
        correlationId,
      });

      return success(errorResult);
    }

    // Simulate different results based on document number for testing
    if (formData.documentNumber.endsWith("0")) {
      const result: DocumentVerificationResult = {
        confidenceScore: 0.4,
        status: "rejected",
        error: "La foto está borrosa o la iluminación es insuficiente.",
      };
      recordAuditEvent({
        actor,
        action: "kyc.verification_rejected",
        resource: "identity",
        details: "Calidad de imagen insuficiente.",
        ipAddress: "127.0.0.1",
        device: "Web Browser",
        result: "failure",
        correlationId,
      });
      return success(result);
    }

    // Normalize names for comparison (simulating consistency check)
    const normalize = (s: string) => s.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const ocrResult: DocumentVerificationResult = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      documentType: formData.documentType,
      documentNumber: formData.documentNumber,
      birthDate: "1990-01-01",
      confidenceScore: 0.95,
      selfieMatchScore: 0.98,
      livenessCheck: true,
      status: "approved",
    };

    // Consistency check: simulate name mismatch
    if (normalize(formData.firstName) === "error") {
      ocrResult.firstName = "Validado";
      ocrResult.status = "manual_review";
      ocrResult.error = "El nombre en el documento no coincide exactamente con el registro.";
      ocrResult.confidenceScore = 0.75;
    }

    // Check for document uniqueness (mock)
    const alreadyExists = mockPatients.some(
      p => decrypt(p.documentNumber) === formData.documentNumber && (p.documentType || "dni") === formData.documentType
    );

    if (alreadyExists) {
      const result: DocumentVerificationResult = {
        confidenceScore: 1.0,
        status: "rejected",
        error: "Este documento ya se encuentra registrado en el sistema.",
      };
      recordAuditEvent({
        actor,
        action: "kyc.verification_rejected",
        resource: "identity",
        details: "Documento ya registrado.",
        ipAddress: "127.0.0.1",
        device: "Web Browser",
        result: "failure",
        correlationId,
      });
      return success(result);
    }

    // Persist KYC metadata in the user object (mock)
    const mockUser = mockUsers.find(u => u.id === "prof-1"); // Simplified for mock
    if (mockUser && ocrResult.status === "approved") {
      mockUser.kycStatus = "approved";
      mockUser.kycMetadata = {
        status: "approved",
        provider: "InternalIdentityService",
        score: ocrResult.confidenceScore,
        updatedAt: new Date().toISOString(),
        attempts: 1,
        documentFiles: {
          front: "secure://documents/front-mock.enc",
          back: "secure://documents/back-mock.enc",
          selfie: "secure://documents/selfie-mock.enc",
        }
      };
    }

    recordAuditEvent({
      actor,
      action: "kyc.verification_completed",
      resource: "identity",
      details: `Resultado KYC: ${ocrResult.status}. Score: ${ocrResult.confidenceScore}. Liveness: ${ocrResult.livenessCheck}`,
      ipAddress: "127.0.0.1",
      device: "Web Browser",
      result: ocrResult.status === "approved" ? "success" : "failure",
      correlationId,
    });

    return success(ocrResult);
  },
};

// ===== BOOKING (PUBLIC) =====
export const bookingApi = {
  async getDoctors() {
    await delay();
    return success([
      { id: "prof-1", name: "Dra. María Pérez", specialty: "Medicina General", location: schedulingConfig.locations[0]?.name || "Consultorio" },
      { id: "prof-2", name: "Dr. Julián Mendoza", specialty: "Pediatría", location: schedulingConfig.locations[1]?.name || schedulingConfig.locations[0]?.name || "Consultorio" },
      { id: "prof-3", name: "Dra. Ana López", specialty: "Dermatología", location: schedulingConfig.locations[0]?.name || "Consultorio" },
    ]);
  },
  async getVisitTypes() {
    await delay();
    return success(schedulingConfig.appointmentTypes.filter(t => t.visible));
  },
  async getAvailableSlots(professionalId: string, date: string) {
    return appointmentsApi.getAvailableSlots(professionalId, date);
  },
  async createBooking(data: { professionalId: string; typeId?: string; date: string; time: string; patientData: Record<string, string> }) {
    await delay(500);

    // Determine visit type automatically if not provided
    let visitType = data.typeId ? schedulingConfig.appointmentTypes.find(t => t.id === data.typeId)?.name : null;

    if (!visitType) {
      const docNumber = data.patientData.documentNumber;
      const patient = mockPatients.find(p => decrypt(p.documentNumber) === docNumber);

      if (patient) {
        const hasPreviousVisits = mockCareAuthorizations.some(
          a => a.patientId === patient.id &&
               a.professionalId === data.professionalId &&
               a.totalVisits > 0
        );
        visitType = hasPreviousVisits ? "Seguimiento" : "Primera vez";
      } else {
        // New patient
        visitType = "Primera vez";
      }
    }

    return success({
      id: `apt-${Date.now()}`,
      message: "Cita agendada exitosamente.",
      type: visitType
    });
  },
};

// ===== PATIENT SEARCH & PROFESSIONAL REQUESTS =====
export const patientSearchApi = {
  async findPatientByDocument(documentType: DocumentType, documentNumber: string) {
    await delay();
    const patient = mockPatients.find(
      p => decrypt(p.documentNumber) === documentNumber && (p.documentType || "dni") === documentType
    );
    if (patient) {
      return success({ found: true, patient: decryptPatient(patient) });
    }
    return success({ found: false, patient: null });
  },
  async createProfessionalPatientRequest(patientId: string, professionalId: string, clinicId?: string) {
    await delay();
    const request: ProfessionalPatientRequest = {
      id: `req-${Date.now()}`,
      patientId,
      professionalId,
      clinicId,
      status: "pending",
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    };
    mockProfessionalPatientRequests.push(request);
    return success(request);
  },
  async createPatientRegistrationInvite(
    sentByProfessionalId: string,
    documentType: DocumentType,
    documentNumber: string,
  ) {
    await delay();
    const invite: RegistrationInvite = {
      token: `invite-${Date.now()}`,
      sentByProfessionalId,
      documentType,
      documentNumber,
      status: "pending",
      expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
    };
    mockRegistrationInvites.push(invite);
    return success({
      invite,
      registrationUrl: `/registro/paciente?inviteToken=${invite.token}`,
      channels: {
        email: true,
        whatsapp: true,
      },
    });
  },
  async getRegistrationInviteByToken(token: string) {
    await delay(120);
    const invite = mockRegistrationInvites.find(i => i.token === token);
    if (!invite) return success(null);
    if (new Date(invite.expiresAt).getTime() < Date.now() && invite.status === "pending") {
      invite.status = "expired";
    }
    return success(invite);
  },
  async markRegistrationInviteAsUsed(token: string) {
    await delay(120);
    const invite = mockRegistrationInvites.find(i => i.token === token);
    if (!invite) throw new Error("Invitación no encontrada");
    invite.status = "used";
    return success(invite);
  },
  async getProfessionalPatientRequests(professionalId: string) {
    await delay();
    const requests = mockProfessionalPatientRequests.filter(r => r.professionalId === professionalId);
    return success(requests);
  },
  async updateProfessionalPatientRequestStatus(requestId: string, status: "accepted" | "rejected") {
    await delay();
    const request = mockProfessionalPatientRequests.find(r => r.id === requestId);
    if (!request) throw new Error("Solicitud no encontrada");
    request.status = status;
    return success(request);
  },
};
