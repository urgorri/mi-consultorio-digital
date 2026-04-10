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
}

export interface Professional extends User {
  role: "profesional";
  specialty: string;
  licenseNumber: string;
  locations: Location[];
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
  lastVisit: string;
  totalVisits: number;
  status: "activo" | "inactivo";
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  professionalId: string;
  professionalName: string;
  locationId: string;
  locationName: string;
  date: string;
  time: string;
  endTime: string;
  type: string;
  status: "confirmada" | "pendiente" | "cancelada" | "completada" | "no_asistio";
  reason?: string;
  notes?: string;
}

export interface Consultation {
  id: string;
  patientId: string;
  patientName: string;
  professionalId: string;
  date: string;
  reason: string;
  anamnesis: string;
  physicalExam: string;
  vitalSigns: {
    bloodPressure?: string;
    heartRate?: string;
    temperature?: string;
    weight?: string;
  };
  diagnoses: Diagnosis[];
  treatment: string;
  followUp: string;
  notes?: string;
}

export interface Diagnosis {
  code: string;
  name: string;
  category?: string;
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
