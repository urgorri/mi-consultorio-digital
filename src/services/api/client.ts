// API client - currently returns mock data. Will be connected to real backend later.
import type {
  ApiResponse, PaginatedResponse, Patient, Appointment, Consultation,
  Diagnosis, Notification, DashboardStats, ReportMetrics,
  User, AuditLog, SystemHealth, Professional, AppointmentType,
  DocumentType, ProfessionalPatientRequest, RegistrationInvite,
  DocumentVerificationResult,
} from "./types";
import {
  mockPatients, mockAppointments, mockConsultations, mockDiagnoses,
  mockNotifications, mockDashboardStats, mockReportMetrics,
  mockUsers, mockAuditLogs, mockSystemHealth, mockProfessional,
  mockAppointmentTypes, mockPatientNotifications, mockPatientPortalAppointments,
  mockProfessionalPatientRequests, mockRegistrationInvites, mockCareAuthorizations,
  mockAppointmentTokens, mockClinics,
} from "./mockData";

// Simulate network delay
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

function success<T>(data: T): ApiResponse<T> {
  return { data, success: true };
}

function paginated<T>(data: T[], total: number, page = 1, limit = 20): PaginatedResponse<T> {
  return { data, success: true, total, page, limit };
}

// ===== AUTH =====
export const authApi = {
  async login(email: string, _password: string) {
    await delay();
    const user = mockUsers.find(u => u.email === email);
    return success({ user: user || mockUsers[0], token: "mock-jwt-token-xyz" });
  },
  async register(_data: { email: string; password: string; firstName: string; lastName: string; role: string }) {
    await delay();
    return success({ message: "Cuenta creada exitosamente. Revisa tu correo para verificar." });
  },
  async recoverPassword(_email: string) {
    await delay();
    return success({ message: "Instrucciones enviadas al correo electrónico." });
  },
  async getCurrentUser() {
    await delay(100);
    return success(mockProfessional);
  },
  async logout() {
    await delay(100);
    return success({ message: "Sesión cerrada." });
  },
};

// ===== HELPERS =====
const enrichPatient = (patient: Patient, professionalId: string): Patient => {
  const authorizations = mockCareAuthorizations.filter(
    a => a.patientId === patient.id && a.professionalId === professionalId
  );

  const clinicIds = authorizations
    .filter(a => a.clinicId !== null)
    .map(a => a.clinicId as string);

  const isPrivate = authorizations.some(a => a.clinicId === null);

  // Status is active if at least one authorization is active
  const isActive = authorizations.some(a => a.status === "active");

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
  async list(params?: { search?: string; page?: number; limit?: number }) {
    await delay();
    const professionalId = mockProfessional.id; // Assume current logged in professional

    // Only show patients the professional has authorization for
    const authorizedPatientIds = new Set(
      mockCareAuthorizations
        .filter(a => a.professionalId === professionalId)
        .map(a => a.patientId)
    );

    let results = mockPatients
      .filter(p => authorizedPatientIds.has(p.id))
      .map(p => enrichPatient(p, professionalId));

    if (params?.search) {
      const q = params.search.toLowerCase();
      results = results.filter(p =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        p.documentNumber.includes(q)
      );
    }
    return paginated(results, results.length, params?.page, params?.limit);
  },
  async getById(id: string) {
    await delay();
    const professionalId = mockProfessional.id;
    const patient = mockPatients.find(p => p.id === id);
    if (!patient) throw new Error("Paciente no encontrado");

    // Check if professional has ANY authorization for this patient
    const hasAuth = mockCareAuthorizations.some(
      a => a.patientId === id && a.professionalId === professionalId
    );
    if (!hasAuth) throw new Error("No tiene autorización para acceder a este paciente");

    return success(enrichPatient(patient, professionalId));
  },
  async create(data: Partial<Patient>) {
    await delay();
    const professionalId = mockProfessional.id;
    const newPatient = { ...data, id: `p-${Date.now()}` } as Patient;
    // In a real scenario, we might also create a default authorization here
    return success(enrichPatient(newPatient, professionalId));
  },
  async update(id: string, data: Partial<Patient>) {
    await delay();
    const professionalId = mockProfessional.id;
    const patient = mockPatients.find(p => p.id === id);
    if (!patient) throw new Error("Paciente no encontrado");
    const updatedPatient = { ...patient, ...data } as Patient;
    return success(enrichPatient(updatedPatient, professionalId));
  },
};

// ===== APPOINTMENTS =====
export const appointmentsApi = {
  async list(params?: { date?: string; patientId?: string; status?: string }) {
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
    await delay();
    const professionalId = mockProfessional.id;

    // Validate active authorization
    const auth = mockCareAuthorizations.find(
      a => a.patientId === data.patientId &&
           a.professionalId === professionalId &&
           a.clinicId === (data.clinicId || null)
    );

    if (!auth) {
      throw new Error("No existe una autorización para agendar citas con este paciente en el ámbito seleccionado.");
    }

    if (auth.status === "revoked") {
      throw new Error("La autorización para este paciente ha sido revocada. No se pueden agendar nuevas citas.");
    }

    const newAppointment: Appointment = {
      ...data,
      id: `apt-${Date.now()}`,
      status: data.status || "pendiente",
      createdByRole: data.createdByRole || "profesional",
      confirmationSource: data.confirmationSource || (data.status === "confirmada" ? "profesional" : null),
      cancellationDeadlineHours: data.cancellationDeadlineHours || 24,
    } as Appointment;

    return success(newAppointment);
  },
  async update(id: string, data: Partial<Appointment>) {
    await delay();
    const apt = mockAppointments.find(a => a.id === id);
    if (!apt) throw new Error("Cita no encontrada");

    const updatedApt = {
      ...apt,
      ...data
    } as Appointment;

    // If status changes to confirmed and no confirmation info is provided, set defaults
    if (data.status === "confirmada" && apt.status !== "confirmada") {
      updatedApt.confirmedAt = updatedApt.confirmedAt || new Date().toISOString();
      updatedApt.confirmationSource = updatedApt.confirmationSource || "profesional";
    }

    return success(updatedApt);
  },
  async cancel(id: string) {
    await delay();
    return success({ message: "Cita cancelada exitosamente." });
  },
  async getAvailableSlots(professionalId: string, date: string) {
    await delay();
    const booked = mockAppointments.filter(a => a.date === date && a.professionalId === professionalId).map(a => a.time);
    const allSlots = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"];
    return success(allSlots.filter(s => !booked.includes(s)));
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
        apt.patientPhone = patient.phone;
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
        apt.patientPhone = patient.phone;
      }
    }

    const url = `${window.location.origin}/citas/v/${tokenData.token}`;
    return success({ url });
  },
};

// ===== CONSULTATIONS =====
export const consultationsApi = {
  async list(params?: { patientId?: string }) {
    await delay();
    let results = [...mockConsultations];
    if (params?.patientId) results = results.filter(c => c.patientId === params.patientId);
    return success(results);
  },
  async getById(id: string) {
    await delay();
    const consultation = mockConsultations.find(c => c.id === id);
    if (!consultation) throw new Error("Consulta no encontrada");
    return success(consultation);
  },
  async create(data: Partial<Consultation>) {
    await delay();
    const professionalId = mockProfessional.id;

    // Validate active authorization
    const auth = mockCareAuthorizations.find(
      a => a.patientId === data.patientId &&
           a.professionalId === professionalId &&
           a.clinicId === (data.clinicId || null)
    );

    if (!auth) {
      throw new Error("No existe una autorización para realizar consultas a este paciente en el ámbito seleccionado.");
    }

    if (auth.status === "revoked") {
      throw new Error("La autorización para este paciente ha sido revocada. No se pueden registrar nuevas consultas.");
    }

    // Update authorization stats
    auth.totalVisits += 1;
    auth.lastVisit = new Date().toISOString();

    return success({ ...data, id: `con-${Date.now()}` } as Consultation);
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
    return success(mockAppointmentTypes);
  },
  async updateAppointmentType(id: string, data: Partial<AppointmentType>) {
    await delay();
    return success(data);
  },
  async requestPremiumUpgrade(feature: string) {
    await delay();
    console.log(`[TRACKING] User requested premium upgrade for feature: ${feature}`);
    return success({ message: "Solicitud de versión Premium enviada con éxito. Nos pondremos en contacto contigo pronto." });
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
  async getProfile() {
    await delay();
    return success(mockPatients[0]);
  },
  async getRequests() {
    await delay();
    // Get requests for the current patient (p-1)
    const requests = mockProfessionalPatientRequests.filter(r => r.patientId === "p-1");
    return success(requests);
  },
  async acceptRequest(requestId: string) {
    await delay();
    const request = mockProfessionalPatientRequests.find(r => r.id === requestId);
    if (!request) throw new Error("Solicitud no encontrada");
    request.status = "accepted";

    // Create patient-professional-clinic authorization relationship
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
    mockPatientNotifications.push({
      id: `pn-${Date.now()}`,
      type: "patient",
      title: "Solicitud aceptada",
      message: `El paciente ${patient?.firstName} ${patient?.lastName} ha aceptado tu solicitud de acceso`,
      time: "Ahora",
      read: false,
      createdAt: new Date().toISOString(),
    });

    return success(request);
  },
  async rejectRequest(requestId: string) {
    await delay();
    const request = mockProfessionalPatientRequests.find(r => r.id === requestId);
    if (!request) throw new Error("Solicitud no encontrada");
    request.status = "rejected";

    // Add notification for professional
    const patient = mockPatients.find(p => p.id === request.patientId);
    mockPatientNotifications.push({
      id: `pn-${Date.now()}`,
      type: "patient",
      title: "Solicitud rechazada",
      message: `El paciente ${patient?.firstName} ${patient?.lastName} ha rechazado tu solicitud de acceso`,
      time: "Ahora",
      read: false,
      createdAt: new Date().toISOString(),
    });

    return success(request);
  },
};

// ===== KYC / DOCUMENT VERIFICATION =====
export const kycApi = {
  async verifyIdentityDocument(
    files: File[],
    formData: { firstName: string; lastName: string; documentType: DocumentType; documentNumber: string }
  ): Promise<ApiResponse<DocumentVerificationResult>> {
    await delay(2000); // Simulate processing time

    // Mock OCR result extraction based on file presence
    // In a real scenario, this would come from a backend service processing the images
    const hasFront = files.length > 0;

    if (!hasFront) {
      return success({
        confidenceScore: 0,
        status: "rejected",
        error: "No se detectaron imágenes del documento.",
      });
    }

    // Simulate different results based on document number for testing
    // If doc number ends in '0', simulate blurred photo
    if (formData.documentNumber.endsWith("0")) {
      return success({
        confidenceScore: 0.4,
        status: "rejected",
        error: "La foto está borrosa. Por favor, intenta de nuevo con mejor iluminación.",
      });
    }

    // If doc number ends in '9', simulate expired document
    if (formData.documentNumber.endsWith("9")) {
      return success({
        confidenceScore: 0.95,
        status: "rejected",
        error: "El documento parece estar vencido.",
      });
    }

    // Normalize names for comparison
    const normalize = (s: string) => s.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const ocrResult: Partial<DocumentVerificationResult> = {
      firstName: formData.firstName, // Mocking correct OCR for most cases
      lastName: formData.lastName,
      documentType: formData.documentType,
      documentNumber: formData.documentNumber,
      birthDate: "1990-01-01",
      confidenceScore: 0.92,
    };

    // Simulate name mismatch if first name is 'Error'
    if (normalize(formData.firstName) === "error") {
      ocrResult.firstName = "Correcto";
      return success({
        ...ocrResult,
        confidenceScore: 0.85,
        status: "manual_review",
        error: "Los datos del documento no coinciden exactamente con el formulario.",
      } as DocumentVerificationResult);
    }

    // Check for document uniqueness (mock)
    const alreadyExists = mockPatients.some(
      p => p.documentNumber === formData.documentNumber && (p.documentType || "dni") === formData.documentType
    );

    if (alreadyExists) {
      return success({
        confidenceScore: 1.0,
        status: "rejected",
        error: "Este documento ya se encuentra registrado en el sistema.",
      });
    }

    return success({
      ...ocrResult,
      status: "approved",
    } as DocumentVerificationResult);
  },
};

// ===== BOOKING (PUBLIC) =====
export const bookingApi = {
  async getDoctors() {
    await delay();
    return success([
      { id: "prof-1", name: "Dra. María García", specialty: "Medicina General", location: "Consultorio Centro" },
      { id: "prof-2", name: "Dr. Carlos Mendoza", specialty: "Pediatría", location: "Consultorio Norte" },
      { id: "prof-3", name: "Dra. Ana López", specialty: "Dermatología", location: "Consultorio Centro" },
    ]);
  },
  async getVisitTypes() {
    await delay();
    return success(mockAppointmentTypes.filter(t => t.visible));
  },
  async getAvailableSlots(professionalId: string, date: string) {
    return appointmentsApi.getAvailableSlots(professionalId, date);
  },
  async createBooking(data: { professionalId: string; typeId: string; date: string; time: string; patientData: Record<string, string> }) {
    await delay(500);
    return success({ id: `apt-${Date.now()}`, message: "Cita agendada exitosamente." });
  },
};

// ===== PATIENT SEARCH & PROFESSIONAL REQUESTS =====
export const patientSearchApi = {
  async findPatientByDocument(documentType: DocumentType, documentNumber: string) {
    await delay();
    const patient = mockPatients.find(
      p => p.documentNumber === documentNumber && (p.documentType || "dni") === documentType
    );
    if (patient) {
      return success({ found: true, patient });
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
