import type {
  Patient, Appointment, Consultation, Diagnosis, Notification,
  DashboardStats, ReportMetrics, AuditLog, SystemHealth,
  User, Location, AppointmentType, Schedule, Professional, Clinic,
} from "./types";

export const mockClinics: Clinic[] = [
  { id: "clinic-1", name: "Clínica San Rafael", shortName: "San Rafael", color: "210 70% 35%", address: "Av. Reforma 100, CDMX" },
  { id: "clinic-2", name: "Centro Médico Polanco", shortName: "Polanco", color: "175 55% 38%", address: "Polanco V Sec, CDMX" },
  { id: "clinic-3", name: "Clínica Norte", shortName: "Norte", color: "32 85% 50%", address: "Lindavista, CDMX" },
];

export const mockProfessional: Professional = {
  id: "prof-1",
  email: "dra.garcia@miconsultorio.com",
  firstName: "María",
  lastName: "García",
  role: "profesional",
  phone: "+52 55 9876 5432",
  createdAt: "2024-01-15",
  status: "activo",
  specialty: "Medicina General",
  licenseNumber: "12345678",
  codingConfig: { cie10: true, cie11: false, snomedCt: false },
  clinicMemberships: [
    { clinicId: "clinic-1", role: "admin" },
    { clinicId: "clinic-2", role: "staff" },
    { clinicId: "clinic-3", role: "staff" },
  ],
  locations: [
    { id: "loc-1", name: "Consultorio Centro", address: "Av. Reforma 123, Col. Centro, CDMX", phone: "+52 55 1234 0001", active: true },
    { id: "loc-2", name: "Consultorio Norte", address: "Blvd. Ávila Camacho 456, Polanco, CDMX", phone: "+52 55 1234 0002", active: true },
  ],
};

export const mockPatients: Patient[] = [
  { id: "p-1", firstName: "Laura", lastName: "Martínez", email: "laura@email.com", phone: "+52 55 1111 2222", birthDate: "1991-06-15", gender: "Femenino", address: "Col. Roma, Ciudad de México", bloodType: "O+", allergies: "Penicilina", conditions: "Hipertensión arterial controlada", createdAt: "2024-03-10", lastVisit: "2026-04-05", totalVisits: 12, status: "activo", documentNumber: "30123456", clinicIds: ["clinic-1"], isPrivate: true },
  { id: "p-2", firstName: "Pedro", lastName: "Sánchez", email: "pedro@email.com", phone: "+52 55 3333 4444", birthDate: "1985-02-20", gender: "Masculino", address: "Col. Condesa, Ciudad de México", bloodType: "A+", allergies: "Ninguna", conditions: "Diabetes tipo 2", createdAt: "2024-05-12", lastVisit: "2026-04-03", totalVisits: 8, status: "activo", documentNumber: "27345678", clinicIds: ["clinic-1", "clinic-2"], isPrivate: false },
  { id: "p-3", firstName: "Ana", lastName: "Rodríguez", email: "ana@email.com", phone: "+52 55 5555 6666", birthDate: "1993-11-08", gender: "Femenino", address: "Col. Del Valle, Ciudad de México", bloodType: "B-", allergies: "Sulfonamidas", conditions: "Ninguna", createdAt: "2025-01-20", lastVisit: "2026-04-01", totalVisits: 3, status: "activo", documentNumber: "32987654", clinicIds: [], isPrivate: true },
  { id: "p-4", firstName: "Miguel", lastName: "Torres", email: "miguel@email.com", phone: "+52 55 7777 8888", birthDate: "1978-07-30", gender: "Masculino", address: "Col. Narvarte, Ciudad de México", bloodType: "AB+", allergies: "Ibuprofeno", conditions: "Asma leve", createdAt: "2023-09-05", lastVisit: "2026-03-28", totalVisits: 15, status: "activo", documentNumber: "25111222", clinicIds: ["clinic-2"], isPrivate: false },
  { id: "p-5", firstName: "Sofía", lastName: "Hernández", email: "sofia@email.com", phone: "+52 55 9999 0000", birthDate: "1988-04-12", gender: "Femenino", address: "Col. Coyoacán, Ciudad de México", bloodType: "O-", allergies: "Ninguna", conditions: "Hipotiroidismo", createdAt: "2024-11-15", lastVisit: "2026-03-25", totalVisits: 6, status: "activo", documentNumber: "29555444", clinicIds: ["clinic-3"], isPrivate: true },
  { id: "p-6", firstName: "Carlos", lastName: "Ruiz", email: "carlos@email.com", phone: "+52 55 1234 5678", birthDate: "1970-12-01", gender: "Masculino", address: "Col. Polanco, Ciudad de México", bloodType: "A-", allergies: "Aspirina, Latex", conditions: "Hipercolesterolemia, Hipertensión", createdAt: "2022-06-20", lastVisit: "2026-03-20", totalVisits: 22, status: "activo", documentNumber: "20888777", clinicIds: ["clinic-1", "clinic-3"], isPrivate: false },
  { id: "p-7", firstName: "Elena", lastName: "Guzmán", email: "elena@email.com", phone: "+52 55 2468 1357", birthDate: "1995-09-25", gender: "Femenino", address: "Col. Juárez, Ciudad de México", bloodType: "B+", allergies: "Ninguna", conditions: "Ninguna", createdAt: "2025-12-01", lastVisit: "2026-03-15", totalVisits: 2, status: "activo", documentNumber: "33222111", clinicIds: [], isPrivate: true },
  { id: "p-8", firstName: "Roberto", lastName: "Díaz", email: "roberto@email.com", phone: "+52 55 9753 1246", birthDate: "1982-03-17", gender: "Masculino", address: "Col. San Ángel, Ciudad de México", bloodType: "O+", allergies: "Mariscos", conditions: "Reflujo gastroesofágico", createdAt: "2024-08-10", lastVisit: "2026-02-28", totalVisits: 9, status: "inactivo", documentNumber: "26999888", clinicIds: ["clinic-2"], isPrivate: false },
];

export const mockAppointments: Appointment[] = [
  { id: "apt-1", patientId: "p-1", patientName: "Laura Martínez", professionalId: "prof-1", professionalName: "Dra. María García", locationId: "loc-1", locationName: "Consultorio Centro", clinicId: "clinic-1", date: "2026-04-10", time: "09:00", endTime: "09:30", type: "Consulta General", status: "confirmada" },
  { id: "apt-2", patientId: "p-2", patientName: "Pedro Sánchez", professionalId: "prof-1", professionalName: "Dra. María García", locationId: "loc-1", locationName: "Consultorio Centro", clinicId: "clinic-1", date: "2026-04-10", time: "09:30", endTime: "10:00", type: "Seguimiento", status: "confirmada" },
  { id: "apt-3", patientId: "p-3", patientName: "Ana Rodríguez", professionalId: "prof-1", professionalName: "Dra. María García", locationId: "loc-1", locationName: "Consultorio Centro", clinicId: null, date: "2026-04-10", time: "10:30", endTime: "11:15", type: "Primera vez", status: "pendiente" },
  { id: "apt-4", patientId: "p-4", patientName: "Miguel Torres", professionalId: "prof-1", professionalName: "Dra. María García", locationId: "loc-1", locationName: "Consultorio Centro", clinicId: "clinic-2", date: "2026-04-10", time: "11:00", endTime: "11:30", type: "Consulta General", status: "confirmada" },
  { id: "apt-5", patientId: "p-5", patientName: "Sofía Hernández", professionalId: "prof-1", professionalName: "Dra. María García", locationId: "loc-2", locationName: "Consultorio Norte", clinicId: "clinic-3", date: "2026-04-10", time: "14:00", endTime: "14:30", type: "Seguimiento", status: "confirmada" },
  { id: "apt-6", patientId: "p-6", patientName: "Carlos Ruiz", professionalId: "prof-1", professionalName: "Dra. María García", locationId: "loc-2", locationName: "Consultorio Norte", clinicId: "clinic-1", date: "2026-04-10", time: "15:00", endTime: "15:30", type: "Consulta General", status: "confirmada" },
  { id: "apt-7", patientId: "p-7", patientName: "Elena Guzmán", professionalId: "prof-1", professionalName: "Dra. María García", locationId: "loc-1", locationName: "Consultorio Centro", clinicId: null, date: "2026-04-10", time: "16:00", endTime: "16:30", type: "Seguimiento", status: "pendiente" },
  { id: "apt-8", patientId: "p-1", patientName: "Laura Martínez", professionalId: "prof-1", professionalName: "Dra. María García", locationId: "loc-1", locationName: "Consultorio Centro", clinicId: "clinic-1", date: "2026-04-05", time: "10:30", endTime: "11:00", type: "Consulta General", status: "completada" },
  { id: "apt-9", patientId: "p-2", patientName: "Pedro Sánchez", professionalId: "prof-1", professionalName: "Dra. María García", locationId: "loc-1", locationName: "Consultorio Centro", clinicId: "clinic-2", date: "2026-04-03", time: "11:00", endTime: "11:30", type: "Seguimiento", status: "completada" },
  { id: "apt-10", patientId: "p-3", patientName: "Ana Rodríguez", professionalId: "prof-1", professionalName: "Dra. María García", locationId: "loc-1", locationName: "Consultorio Centro", clinicId: null, date: "2026-04-01", time: "14:00", endTime: "14:45", type: "Primera vez", status: "cancelada" },
  { id: "apt-11", patientId: "p-4", patientName: "Miguel Torres", professionalId: "prof-1", professionalName: "Dra. María García", locationId: "loc-2", locationName: "Consultorio Norte", clinicId: "clinic-2", date: "2026-04-11", time: "09:00", endTime: "09:30", type: "Consulta General", status: "confirmada" },
  { id: "apt-12", patientId: "p-5", patientName: "Sofía Hernández", professionalId: "prof-1", professionalName: "Dra. María García", locationId: "loc-1", locationName: "Consultorio Centro", clinicId: "clinic-3", date: "2026-04-11", time: "10:00", endTime: "10:30", type: "Seguimiento", status: "pendiente" },
  { id: "apt-13", patientId: "p-6", patientName: "Carlos Ruiz", professionalId: "prof-1", professionalName: "Dra. María García", locationId: "loc-1", locationName: "Consultorio Centro", clinicId: "clinic-1", date: "2026-04-12", time: "09:30", endTime: "10:00", type: "Consulta General", status: "confirmada" },
  { id: "apt-14", patientId: "p-8", patientName: "Roberto Díaz", professionalId: "prof-1", professionalName: "Dra. María García", locationId: "loc-2", locationName: "Consultorio Norte", clinicId: "clinic-2", date: "2026-04-12", time: "14:00", endTime: "14:30", type: "Seguimiento", status: "confirmada" },
];

export const mockConsultations: Consultation[] = [
  {
    id: "con-1", patientId: "p-1", patientName: "Laura Martínez", professionalId: "prof-1",
    date: "2026-04-05", reason: "Control de presión arterial",
    anamnesis: "Paciente refiere sentirse bien, sin cefalea ni mareos. Toma losartán 50mg diariamente.",
    physicalExam: "Paciente consciente, orientada, bien hidratada. Ruidos cardíacos rítmicos.",
    vitalSigns: { bloodPressure: "130/85 mmHg", heartRate: "72 bpm", temperature: "36.5 °C", weight: "65 kg" },
    diagnoses: [{ code: "I10", name: "Hipertensión esencial (primaria)", codingSystem: "CIE-10" }],
    treatment: "Se mantiene losartán 50mg c/24h. Dieta baja en sodio. Ejercicio 30 min diarios.",
    followUp: "Control en 4 semanas con perfil lipídico actualizado.",
    notes: "Paciente estable. Se mantiene medicación actual."
  },
  {
    id: "con-2", patientId: "p-1", patientName: "Laura Martínez", professionalId: "prof-1",
    date: "2026-03-20", reason: "Revisión de laboratorios",
    anamnesis: "Paciente acude con resultados de laboratorio solicitados en consulta previa.",
    physicalExam: "Sin hallazgos relevantes. Paciente en buen estado general.",
    vitalSigns: { bloodPressure: "125/80 mmHg", heartRate: "68 bpm", temperature: "36.3 °C", weight: "65.5 kg" },
    diagnoses: [{ code: "Z01.7", name: "Examen de laboratorio", codingSystem: "CIE-10" }],
    treatment: "Resultados dentro de parámetros normales. Sin cambios en medicación.",
    followUp: "Se agenda seguimiento en 2 semanas para control de presión.",
  },
  {
    id: "con-3", patientId: "p-2", patientName: "Pedro Sánchez", professionalId: "prof-1",
    date: "2026-04-03", reason: "Control de glucosa",
    anamnesis: "Paciente con diabetes tipo 2 diagnosticada hace 3 años. Refiere buena adherencia a metformina.",
    physicalExam: "IMC 28.5. Piel sin lesiones. Sensibilidad conservada en extremidades.",
    vitalSigns: { bloodPressure: "120/80 mmHg", heartRate: "76 bpm", temperature: "36.4 °C", weight: "82 kg" },
    diagnoses: [{ code: "E11", name: "Diabetes mellitus tipo 2", codingSystem: "CIE-10" }],
    treatment: "Metformina 850mg c/12h. Dieta diabética. Ejercicio aeróbico regular.",
    followUp: "Hemoglobina glucosilada en 3 meses. Control en 6 semanas.",
  },
  {
    id: "con-4", patientId: "p-4", patientName: "Miguel Torres", professionalId: "prof-1",
    date: "2026-03-28", reason: "Crisis asmática leve",
    anamnesis: "Paciente refiere episodio de disnea y sibilancias desde hace 2 días, posiblemente por cambio climático.",
    physicalExam: "Sibilancias espiratorias bilaterales leves. Saturación O2 96%. FR 20.",
    vitalSigns: { bloodPressure: "118/75 mmHg", heartRate: "88 bpm", temperature: "36.6 °C", weight: "78 kg" },
    diagnoses: [{ code: "J45.0", name: "Asma predominantemente alérgica", codingSystem: "CIE-10" }],
    treatment: "Salbutamol inhalado PRN. Budesonida inhalada 200mcg c/12h por 2 semanas.",
    followUp: "Reevaluar en 2 semanas. Si empeora, acudir a urgencias.",
  },
];

export const mockDiagnoses: Diagnosis[] = [
  // CIE-10
  { code: "A09", name: "Diarrea y gastroenteritis de presunto origen infeccioso", category: "Infecciosas", codingSystem: "CIE-10" },
  { code: "B34.9", name: "Infección viral, no especificada", category: "Infecciosas", codingSystem: "CIE-10" },
  { code: "E11", name: "Diabetes mellitus tipo 2", category: "Endocrinas", codingSystem: "CIE-10" },
  { code: "E78.0", name: "Hipercolesterolemia pura", category: "Endocrinas", codingSystem: "CIE-10" },
  { code: "F32.9", name: "Episodio depresivo, no especificado", category: "Mentales", codingSystem: "CIE-10" },
  { code: "F41.1", name: "Trastorno de ansiedad generalizada", category: "Mentales", codingSystem: "CIE-10" },
  { code: "G43.9", name: "Migraña, no especificada", category: "Neurológicas", codingSystem: "CIE-10" },
  { code: "H10.9", name: "Conjuntivitis, no especificada", category: "Oftalmológicas", codingSystem: "CIE-10" },
  { code: "I10", name: "Hipertensión esencial (primaria)", category: "Circulatorias", codingSystem: "CIE-10" },
  { code: "J06.9", name: "Infección aguda de las vías respiratorias superiores, no especificada", category: "Respiratorias", codingSystem: "CIE-10" },
  { code: "J20.9", name: "Bronquitis aguda, no especificada", category: "Respiratorias", codingSystem: "CIE-10" },
  { code: "J45.0", name: "Asma predominantemente alérgica", category: "Respiratorias", codingSystem: "CIE-10" },
  { code: "K21.0", name: "Enfermedad por reflujo gastroesofágico con esofagitis", category: "Digestivas", codingSystem: "CIE-10" },
  { code: "K29.7", name: "Gastritis, no especificada", category: "Digestivas", codingSystem: "CIE-10" },
  { code: "K30", name: "Dispepsia funcional", category: "Digestivas", codingSystem: "CIE-10" },
  { code: "L30.9", name: "Dermatitis, no especificada", category: "Dermatológicas", codingSystem: "CIE-10" },
  { code: "M54.5", name: "Dolor en la parte baja de la espalda", category: "Musculoesqueléticas", codingSystem: "CIE-10" },
  { code: "N39.0", name: "Infección de vías urinarias, sitio no especificado", category: "Genitourinarias", codingSystem: "CIE-10" },
  { code: "R50.9", name: "Fiebre, no especificada", category: "Síntomas", codingSystem: "CIE-10" },
  { code: "R51", name: "Cefalea", category: "Síntomas", codingSystem: "CIE-10" },
  { code: "Z00.0", name: "Examen médico general", category: "Factores", codingSystem: "CIE-10" },
  { code: "Z01.7", name: "Examen de laboratorio", category: "Factores", codingSystem: "CIE-10" },
  // CIE-11
  { code: "1A00", name: "Cólera", category: "Infecciosas", codingSystem: "CIE-11" },
  { code: "5A11", name: "Diabetes mellitus tipo 2", category: "Endocrinas", codingSystem: "CIE-11" },
  { code: "BA00", name: "Hipertensión esencial", category: "Circulatorias", codingSystem: "CIE-11" },
  { code: "CA01", name: "Bronquitis aguda", category: "Respiratorias", codingSystem: "CIE-11" },
  { code: "8B00", name: "Migraña", category: "Neurológicas", codingSystem: "CIE-11" },
  { code: "6A70", name: "Episodio depresivo", category: "Mentales", codingSystem: "CIE-11" },
  { code: "DA94", name: "Gastritis", category: "Digestivas", codingSystem: "CIE-11" },
  { code: "GC08", name: "Infección de vías urinarias", category: "Genitourinarias", codingSystem: "CIE-11" },
  // SNOMED CT
  { code: "38341003", name: "Hipertensión arterial", category: "Circulatorias", codingSystem: "SNOMED-CT" },
  { code: "44054006", name: "Diabetes mellitus tipo 2", category: "Endocrinas", codingSystem: "SNOMED-CT" },
  { code: "195967001", name: "Asma", category: "Respiratorias", codingSystem: "SNOMED-CT" },
  { code: "37796009", name: "Migraña", category: "Neurológicas", codingSystem: "SNOMED-CT" },
  { code: "35489007", name: "Trastorno depresivo", category: "Mentales", codingSystem: "SNOMED-CT" },
  { code: "4556007", name: "Gastritis", category: "Digestivas", codingSystem: "SNOMED-CT" },
  { code: "68566005", name: "Infección del tracto urinario", category: "Genitourinarias", codingSystem: "SNOMED-CT" },
  { code: "386661006", name: "Fiebre", category: "Síntomas", codingSystem: "SNOMED-CT" },
];

export const mockNotifications: Notification[] = [
  { id: "n-1", type: "appointment", title: "Nueva cita agendada", message: "Pedro Sánchez agendó una cita para el 10 abr a las 11:00", time: "Hace 5 min", read: false, createdAt: "2026-04-10T08:55:00" },
  { id: "n-2", type: "cancellation", title: "Cita cancelada", message: "Ana Rodríguez canceló su cita del 9 abr a las 14:00", time: "Hace 30 min", read: false, createdAt: "2026-04-10T08:30:00" },
  { id: "n-3", type: "reminder", title: "Recordatorio", message: "Tienes 3 citas pendientes de confirmación para mañana", time: "Hace 1 hora", read: false, createdAt: "2026-04-10T08:00:00" },
  { id: "n-4", type: "patient", title: "Nuevo paciente registrado", message: "Elena Guzmán se registró en la plataforma", time: "Hace 2 horas", read: true, createdAt: "2026-04-10T07:00:00" },
  { id: "n-5", type: "appointment", title: "Cita confirmada", message: "Miguel Torres confirmó su cita del 10 abr a las 11:00", time: "Ayer", read: true, createdAt: "2026-04-09T16:00:00" },
  { id: "n-6", type: "system", title: "Actualización del sistema", message: "Se han aplicado mejoras de rendimiento a la plataforma", time: "Hace 2 días", read: true, createdAt: "2026-04-08T10:00:00" },
  { id: "n-7", type: "reminder", title: "Recordatorio de laboratorios", message: "Laura Martínez tiene laboratorios pendientes de revisión", time: "Hace 3 días", read: true, createdAt: "2026-04-07T09:00:00" },
];

export const mockDashboardStats: DashboardStats = {
  appointmentsToday: 7,
  activePatients: 142,
  nextAppointmentTime: "09:00",
  occupancyRate: 78,
  appointmentsTrend: "+2 vs ayer",
  patientsTrend: "+5 este mes",
  occupancyTrend: "+12% vs semana pasada",
};

export const mockReportMetrics: ReportMetrics = {
  appointmentsThisMonth: 87,
  occupancyRate: 78,
  cancellationRate: 6,
  newPatients: 14,
  noShowRate: 4,
  visitTypeBreakdown: [
    { type: "Consulta General", count: 42, percentage: 48 },
    { type: "Seguimiento", count: 28, percentage: 32 },
    { type: "Primera vez", count: 17, percentage: 20 },
  ],
  monthlyTrend: [
    { month: "Nov", appointments: 62 },
    { month: "Dic", appointments: 55 },
    { month: "Ene", appointments: 71 },
    { month: "Feb", appointments: 68 },
    { month: "Mar", appointments: 79 },
    { month: "Abr", appointments: 87 },
  ],
};

export const mockUsers: User[] = [
  { id: "prof-1", email: "dra.garcia@email.com", firstName: "María", lastName: "García", role: "profesional", phone: "+52 55 9876 5432", createdAt: "2024-01-15", status: "activo" },
  { id: "prof-2", email: "dr.mendoza@email.com", firstName: "Carlos", lastName: "Mendoza", role: "profesional", phone: "+52 55 8765 4321", createdAt: "2024-03-20", status: "activo" },
  { id: "prof-3", email: "dra.lopez@email.com", firstName: "Ana", lastName: "López", role: "profesional", phone: "+52 55 7654 3210", createdAt: "2024-06-10", status: "activo" },
  { id: "pat-1", email: "laura@email.com", firstName: "Laura", lastName: "Martínez", role: "paciente", createdAt: "2024-03-10", status: "activo" },
  { id: "pat-2", email: "pedro@email.com", firstName: "Pedro", lastName: "Sánchez", role: "paciente", createdAt: "2024-05-12", status: "activo" },
  { id: "pat-3", email: "ana@email.com", firstName: "Ana", lastName: "Rodríguez", role: "paciente", createdAt: "2025-01-20", status: "activo" },
  { id: "pat-4", email: "miguel@email.com", firstName: "Miguel", lastName: "Torres", role: "paciente", createdAt: "2023-09-05", status: "activo" },
  { id: "pat-5", email: "sofia@email.com", firstName: "Sofía", lastName: "Hernández", role: "paciente", createdAt: "2024-11-15", status: "activo" },
  { id: "pat-6", email: "carlos@email.com", firstName: "Carlos", lastName: "Ruiz", role: "paciente", createdAt: "2022-06-20", status: "activo" },
  { id: "pat-7", email: "roberto@email.com", firstName: "Roberto", lastName: "Díaz", role: "paciente", createdAt: "2024-08-10", status: "inactivo" },
  { id: "admin-1", email: "admin@miconsultorio.com", firstName: "Admin", lastName: "Sistema", role: "admin", createdAt: "2023-01-01", status: "activo" },
];

export const mockAuditLogs: AuditLog[] = [
  { id: "log-1", userId: "prof-1", userName: "Dra. María García", action: "login", resource: "auth", details: "Inicio de sesión exitoso", ipAddress: "192.168.1.100", timestamp: "2026-04-10T08:30:00" },
  { id: "log-2", userId: "pat-1", userName: "Laura Martínez", action: "booking.create", resource: "appointments", details: "Cita creada para 10 abr 2026 09:00", ipAddress: "192.168.1.101", timestamp: "2026-04-09T16:45:00" },
  { id: "log-3", userId: "prof-1", userName: "Dra. María García", action: "consultation.create", resource: "consultations", details: "Consulta registrada para paciente Laura Martínez", ipAddress: "192.168.1.100", timestamp: "2026-04-05T11:00:00" },
  { id: "log-4", userId: "pat-3", userName: "Ana Rodríguez", action: "booking.cancel", resource: "appointments", details: "Cita del 9 abr cancelada", ipAddress: "10.0.0.55", timestamp: "2026-04-08T14:20:00" },
  { id: "log-5", userId: "prof-1", userName: "Dra. María García", action: "patient.update", resource: "patients", details: "Actualización de datos de Pedro Sánchez", ipAddress: "192.168.1.100", timestamp: "2026-04-03T10:15:00" },
  { id: "log-6", userId: "admin-1", userName: "Admin Sistema", action: "user.block", resource: "users", details: "Usuario roberto@email.com bloqueado por inactividad", ipAddress: "10.0.0.1", timestamp: "2026-04-02T09:00:00" },
  { id: "log-7", userId: "pat-7", userName: "Elena Guzmán", action: "register", resource: "auth", details: "Registro de nueva cuenta de paciente", ipAddress: "200.23.45.67", timestamp: "2025-12-01T14:30:00" },
  { id: "log-8", userId: "prof-1", userName: "Dra. María García", action: "settings.update", resource: "settings", details: "Horario actualizado: Lunes 09:00-17:00", ipAddress: "192.168.1.100", timestamp: "2026-03-30T08:00:00" },
  { id: "log-9", userId: "prof-2", userName: "Dr. Carlos Mendoza", action: "login", resource: "auth", details: "Inicio de sesión exitoso", ipAddress: "192.168.2.50", timestamp: "2026-04-10T07:45:00" },
  { id: "log-10", userId: "pat-5", userName: "Sofía Hernández", action: "password.reset", resource: "auth", details: "Solicitud de restablecimiento de contraseña", ipAddress: "189.203.10.22", timestamp: "2026-04-07T20:15:00" },
];

export const mockSystemHealth: SystemHealth = {
  status: "healthy",
  uptime: "99.97%",
  activeUsers: 23,
  totalRequests: 15420,
  avgResponseTime: 145,
  services: [
    { name: "API Principal", status: "up", latency: 120 },
    { name: "Base de Datos", status: "up", latency: 45 },
    { name: "Autenticación", status: "up", latency: 89 },
    { name: "Notificaciones Email", status: "up", latency: 230 },
    { name: "Almacenamiento", status: "up", latency: 67 },
  ],
};

export const mockAppointmentTypes: AppointmentType[] = [
  { id: "type-1", name: "Consulta General", duration: 30, visible: true },
  { id: "type-2", name: "Seguimiento", duration: 20, visible: true },
  { id: "type-3", name: "Primera vez", duration: 45, visible: true },
  { id: "type-4", name: "Urgencia", duration: 15, visible: false },
];

export const mockSchedules: Schedule[] = [
  { dayOfWeek: 1, enabled: true, startTime: "09:00", endTime: "17:00", locationId: "loc-1" },
  { dayOfWeek: 2, enabled: true, startTime: "09:00", endTime: "17:00", locationId: "loc-1" },
  { dayOfWeek: 3, enabled: true, startTime: "09:00", endTime: "17:00", locationId: "loc-1" },
  { dayOfWeek: 4, enabled: true, startTime: "09:00", endTime: "17:00", locationId: "loc-1" },
  { dayOfWeek: 5, enabled: true, startTime: "09:00", endTime: "15:00", locationId: "loc-1" },
  { dayOfWeek: 6, enabled: false, startTime: "09:00", endTime: "13:00", locationId: "loc-1" },
  { dayOfWeek: 0, enabled: false, startTime: "", endTime: "", locationId: "loc-1" },
];

// Patient portal mock data
export const mockPatientPortalAppointments: Appointment[] = mockAppointments.filter(a => a.patientId === "p-1");

export const mockPatientNotifications: Notification[] = [
  { id: "pn-1", type: "appointment", title: "Cita confirmada", message: "Tu cita con Dra. García del 10 abr a las 09:00 ha sido confirmada", time: "Hace 1 hora", read: false, createdAt: "2026-04-10T08:00:00" },
  { id: "pn-2", type: "reminder", title: "Recordatorio de cita", message: "Tienes una cita mañana 10 abr a las 09:00 con Dra. García", time: "Ayer", read: true, createdAt: "2026-04-09T18:00:00" },
  { id: "pn-3", type: "system", title: "Bienvenido a MiConsultorio", message: "Tu cuenta ha sido creada exitosamente. Explora la plataforma.", time: "Hace 1 semana", read: true, createdAt: "2026-04-03T10:00:00" },
];
