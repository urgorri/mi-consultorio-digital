import { encrypt } from "../../lib/crypto";
import type {
  Patient, Appointment, Consultation, Diagnosis, Notification,
  DashboardStats, ReportMetrics, AuditLog, SystemHealth,
  User, Location, AppointmentType, Schedule, Professional, Clinic,
  DocumentType, ProfessionalPatientRequest, RegistrationInvite,
  ConsultationFieldsConfig, ConsentDocument, ConsentAcceptance, AccessGrant,
} from "./types";

export const mockClinics: Clinic[] = [
  { id: "clinic-1", name: "Clínica San Rafael", shortName: "San Rafael", color: "210 70% 35%", address: encrypt("Av. Reforma 100, CDMX") },
  { id: "clinic-2", name: "Centro Médico Polanco", shortName: "Polanco", color: "175 55% 38%", address: encrypt("Polanco V Sec, CDMX") },
  { id: "clinic-3", name: "Clínica Norte", shortName: "Norte", color: "32 85% 50%", address: encrypt("Lindavista, CDMX") },
];

export const SPECIALTY_DEFAULT_CONFIGS: Record<string, ConsultationFieldsConfig> = {
  "Medicina General": {
    bloodPressure: true,
    heartRate: true,
    temperature: true,
    weight: true,
    heightCm: true,
    bmi: true,
  },
  "Pediatría": {
    bloodPressure: true,
    heartRate: true,
    temperature: true,
    weight: true,
    heightCm: true,
    bmi: true,
  },
  "Nutrición": {
    bloodPressure: false,
    heartRate: false,
    temperature: false,
    weight: true,
    heightCm: true,
    bmi: true,
  },
  "Psicología": {
    bloodPressure: false,
    heartRate: false,
    temperature: false,
    weight: false,
    heightCm: false,
    bmi: false,
  },
  "default": {
    bloodPressure: true,
    heartRate: true,
    temperature: true,
    weight: true,
    heightCm: true,
    bmi: true,
  }
};

export const mockProfessional: Professional = {
  id: "prof-1",
  email: encrypt("dra.garcia@miconsultorio.ar"),
  firstName: "María",
  lastName: "Pérez",
  role: "profesional",
  phone: encrypt("+52 55 9876 5432"),
  createdAt: "2024-01-15",
  status: "activo",
  kycStatus: "approved",
  licenseStatus: "valid",
  licenseLastCheckedAt: "2026-04-05T10:00:00Z", emailVerifiedAt: "2024-01-15T10:00:00Z",
  specialty: "Medicina General",
  licenseNumber: "12345678",
  codingConfig: { cie10: true, cie11: false, snomedCt: false },
  consultationFieldsConfig: {
    bmi: true,
  },
  clinicMemberships: [
    { clinicId: "clinic-1", role: "admin" },
    { clinicId: "clinic-2", role: "staff" },
    { clinicId: "clinic-3", role: "staff" },
  ],
  locations: [
    { id: "loc-1", name: "Consultorio Centro", address: encrypt("Av. Reforma 123, Col. Centro, CDMX"), phone: encrypt("+52 55 1234 0001"), active: true },
    { id: "loc-2", name: "Consultorio Norte", address: encrypt("Blvd. Ávila Camacho 456, Polanco, CDMX"), phone: encrypt("+52 55 1234 0002"), active: true },
  ],
};

export const mockPatients: Patient[] = [
  { id: "p-1", firstName: "Laura", lastName: "Martínez", email: encrypt("laura@email.com"), phone: encrypt("+52 55 1111 2222"), birthDate: "1991-06-15", gender: "Femenino", address: encrypt("Col. Roma, Ciudad de México"), bloodType: "O+", allergies: encrypt("Penicilina"), conditions: encrypt("Hipertensión arterial controlada"), createdAt: "2024-03-10", lastVisit: "2026-04-05", totalVisits: 12, status: "activo", documentType: "dni", documentNumber: encrypt("30123456"), clinicIds: ["clinic-1"], isPrivate: true },
  { id: "p-2", firstName: "Pedro", lastName: "Sánchez", email: encrypt("pedro@email.com"), phone: encrypt("+52 55 3333 4444"), birthDate: "1985-02-20", gender: "Masculino", address: encrypt("Col. Condesa, Ciudad de México"), bloodType: "A+", allergies: encrypt("Ninguna"), conditions: encrypt("Diabetes tipo 2"), createdAt: "2024-05-12", lastVisit: "2026-04-03", totalVisits: 8, status: "activo", documentType: "dni", documentNumber: encrypt("27345678"), clinicIds: ["clinic-1", "clinic-2"], isPrivate: false },
  { id: "p-3", firstName: "Ana", lastName: "Rodríguez", email: encrypt("ana@email.com"), phone: encrypt("+52 55 5555 6666"), birthDate: "1993-11-08", gender: "Femenino", address: encrypt("Col. Del Valle, Ciudad de México"), bloodType: "B-", allergies: encrypt("Sulfonamidas"), conditions: encrypt("Ninguna"), createdAt: "2025-01-20", lastVisit: "2026-04-01", totalVisits: 3, status: "activo", documentType: "dni", documentNumber: encrypt("32987654"), clinicIds: [], isPrivate: true },
  { id: "p-4", firstName: "Miguel", lastName: "Torres", email: encrypt("miguel@email.com"), phone: encrypt("+52 55 7777 8888"), birthDate: "1978-07-30", gender: "Masculino", address: encrypt("Col. Narvarte, Ciudad de México"), bloodType: "AB+", allergies: encrypt("Ibuprofeno"), conditions: encrypt("Asma leve"), createdAt: "2023-09-05", lastVisit: "2026-03-28", totalVisits: 15, status: "activo", documentType: "dni", documentNumber: encrypt("25111222"), clinicIds: ["clinic-2"], isPrivate: false },
  { id: "p-5", firstName: "Sofía", lastName: "Hernández", email: encrypt("sofia@email.com"), phone: encrypt("+52 55 9999 0000"), birthDate: "1988-04-12", gender: "Femenino", address: encrypt("Col. Coyoacán, Ciudad de México"), bloodType: "O-", allergies: encrypt("Ninguna"), conditions: encrypt("Hipotiroidismo"), createdAt: "2024-11-15", lastVisit: "2026-03-25", totalVisits: 6, status: "activo", documentType: "dni", documentNumber: encrypt("29555444"), clinicIds: ["clinic-3"], isPrivate: true },
  { id: "p-6", firstName: "Julián", lastName: "Ruiz", email: encrypt("julian@email.com"), phone: encrypt(""), birthDate: "1970-12-01", gender: "Masculino", address: encrypt("Col. Polanco, Ciudad de México"), bloodType: "A-", allergies: encrypt("Aspirina, Latex"), conditions: encrypt("Hipercolesterolemia, Hipertensión"), createdAt: "2022-06-20", lastVisit: "2026-03-20", totalVisits: 22, status: "activo", documentType: "dni", documentNumber: encrypt("20888777"), clinicIds: ["clinic-1", "clinic-3"], isPrivate: false },
  { id: "p-7", firstName: "Elena", lastName: "Guzmán", email: encrypt("elena@email.com"), phone: encrypt("+52 55 2468 1357"), birthDate: "1995-09-25", gender: "Femenino", address: encrypt("Col. Juárez, Ciudad de México"), bloodType: "B+", allergies: encrypt("Ninguna"), conditions: encrypt("Ninguna"), createdAt: "2025-12-01", lastVisit: "2026-03-15", totalVisits: 2, status: "activo", documentType: "dni", documentNumber: encrypt("33222111"), clinicIds: [], isPrivate: true },
  { id: "p-8", firstName: "Roberto", lastName: "Díaz", email: encrypt("roberto@email.com"), phone: encrypt("+52 55 9753 1246"), birthDate: "1982-03-17", gender: "Masculino", address: encrypt("Col. San Ángel, Ciudad de México"), bloodType: "O+", allergies: encrypt("Mariscos"), conditions: encrypt("Reflujo gastroesofágico"), createdAt: "2024-08-10", lastVisit: "2026-02-28", totalVisits: 9, status: "inactivo", documentType: "dni", documentNumber: encrypt("26999888"), clinicIds: ["clinic-2"], isPrivate: false },
];

export const mockAppointments: Appointment[] = [
  { id: "apt-1", patientId: "p-1", patientName: "Laura Martínez", professionalId: "prof-1", professionalName: "Dra. María Pérez", locationId: "loc-1", locationName: "Consultorio Centro", clinicId: "clinic-1", date: "2026-04-10", time: "09:00", endTime: "09:30", type: "Seguimiento", status: "confirmada", createdByRole: "profesional", confirmationSource: "profesional" },
  { id: "apt-2", patientId: "p-2", patientName: "Pedro Sánchez", professionalId: "prof-1", professionalName: "Dra. María Pérez", locationId: "loc-1", locationName: "Consultorio Centro", clinicId: "clinic-1", date: "2026-04-10", time: "09:30", endTime: "10:00", type: "Seguimiento", status: "confirmada", createdByRole: "profesional", confirmationSource: "profesional" },
  { id: "apt-3", patientId: "p-3", patientName: "Ana Rodríguez", professionalId: "prof-1", professionalName: "Dra. María Pérez", locationId: "loc-1", locationName: "Consultorio Centro", clinicId: null, date: "2026-04-10", time: "10:30", endTime: "11:15", type: "Primera vez", status: "pendiente", createdByRole: "profesional", confirmationSource: null },
  { id: "apt-4", patientId: "p-4", patientName: "Miguel Torres", professionalId: "prof-1", professionalName: "Dra. María Pérez", locationId: "loc-1", locationName: "Consultorio Centro", clinicId: "clinic-2", date: "2026-04-10", time: "11:00", endTime: "11:30", type: "Seguimiento", status: "confirmada", createdByRole: "paciente", confirmationSource: "profesional", confirmedAt: "2026-04-09T16:00:00", confirmedByUserId: "prof-1" },
  { id: "apt-5", patientId: "p-5", patientName: "Sofía Hernández", professionalId: "prof-1", professionalName: "Dra. María Pérez", locationId: "loc-2", locationName: "Consultorio Norte", clinicId: "clinic-3", date: "2026-04-10", time: "14:00", endTime: "14:30", type: "Seguimiento", status: "confirmada", createdByRole: "profesional", confirmationSource: "paciente", confirmedAt: "2026-04-09T10:00:00" },
  { id: "apt-6", patientId: "p-6", patientName: "Julián Ruiz", professionalId: "prof-1", professionalName: "Dra. María Pérez", locationId: "loc-2", locationName: "Consultorio Norte", clinicId: "clinic-1", date: "2026-04-10", time: "15:00", endTime: "15:30", type: "Seguimiento", status: "confirmada", createdByRole: "profesional", confirmationSource: "profesional" },
  { id: "apt-7", patientId: "p-7", patientName: "Elena Guzmán", professionalId: "prof-1", professionalName: "Dra. María Pérez", locationId: "loc-1", locationName: "Consultorio Centro", clinicId: null, date: "2026-04-10", time: "16:00", endTime: "16:30", type: "Seguimiento", status: "pendiente", createdByRole: "paciente", confirmationSource: null },
  { id: "apt-8", patientId: "p-1", patientName: "Laura Martínez", professionalId: "prof-1", professionalName: "Dra. María Pérez", locationId: "loc-1", locationName: "Consultorio Centro", clinicId: "clinic-1", date: "2026-04-05", time: "10:30", endTime: "11:00", type: "Seguimiento", status: "completada", createdByRole: "profesional", confirmationSource: "profesional" },
  { id: "apt-9", patientId: "p-2", patientName: "Pedro Sánchez", professionalId: "prof-1", professionalName: "Dra. María Pérez", locationId: "loc-1", locationName: "Consultorio Centro", clinicId: "clinic-2", date: "2026-04-03", time: "11:00", endTime: "11:30", type: "Seguimiento", status: "completada", createdByRole: "profesional", confirmationSource: "profesional" },
  { id: "apt-10", patientId: "p-3", patientName: "Ana Rodríguez", professionalId: "prof-1", professionalName: "Dra. María Pérez", locationId: "loc-1", locationName: "Consultorio Centro", clinicId: null, date: "2026-04-01", time: "14:00", endTime: "14:45", type: "Primera vez", status: "cancelada", createdByRole: "paciente", confirmationSource: null },
  { id: "apt-11", patientId: "p-4", patientName: "Miguel Torres", professionalId: "prof-1", professionalName: "Dra. María Pérez", locationId: "loc-2", locationName: "Consultorio Norte", clinicId: "clinic-2", date: "2026-04-11", time: "09:00", endTime: "09:30", type: "Seguimiento", status: "confirmada", createdByRole: "profesional", confirmationSource: "profesional" },
  { id: "apt-12", patientId: "p-5", patientName: "Sofía Hernández", professionalId: "prof-1", professionalName: "Dra. María Pérez", locationId: "loc-1", locationName: "Consultorio Centro", clinicId: "clinic-3", date: "2026-04-11", time: "10:00", endTime: "10:30", type: "Seguimiento", status: "pendiente", createdByRole: "profesional", confirmationSource: null },
  { id: "apt-13", patientId: "p-6", patientName: "Julián Ruiz", professionalId: "prof-1", professionalName: "Dra. María Pérez", locationId: "loc-1", locationName: "Consultorio Centro", clinicId: "clinic-1", date: "2026-04-12", time: "09:30", endTime: "10:00", type: "Seguimiento", status: "confirmada", createdByRole: "profesional", confirmationSource: "profesional" },
  { id: "apt-14", patientId: "p-8", patientName: "Roberto Díaz", professionalId: "prof-1", professionalName: "Dra. María Pérez", locationId: "loc-2", locationName: "Consultorio Norte", clinicId: "clinic-2", date: "2026-04-12", time: "14:00", endTime: "14:30", type: "Seguimiento", status: "confirmada", createdByRole: "profesional", confirmationSource: "profesional" },
  // Turno creado por paciente y pendiente con token activo
  { id: "apt-15", patientId: "p-1", patientName: "Laura Martínez", professionalId: "prof-1", professionalName: "Dra. María Pérez", locationId: "loc-1", locationName: "Consultorio Centro", clinicId: "clinic-1", date: "2026-04-15", time: "10:00", endTime: "10:30", type: "Seguimiento", status: "pendiente", createdByRole: "paciente", confirmationSource: null, cancellationDeadlineHours: 24 },
  // Turno creado por profesional y pendiente con token expirado
  { id: "apt-16", patientId: "p-2", patientName: "Pedro Sánchez", professionalId: "prof-1", professionalName: "Dra. María Pérez", locationId: "loc-1", locationName: "Consultorio Centro", clinicId: "clinic-1", date: "2026-04-16", time: "11:00", endTime: "11:30", type: "Seguimiento", status: "pendiente", createdByRole: "profesional", confirmationSource: null, cancellationDeadlineHours: 48 },
  // Turno para pruebas de cancelación (dentro de ventana)
  { id: "apt-test-1", patientId: "p-1", patientName: "Laura Martínez", professionalId: "prof-1", professionalName: "Dra. María Pérez", locationId: "loc-1", locationName: "Consultorio Centro", clinicId: "clinic-1", date: "2026-05-15", time: "10:00", endTime: "10:30", type: "Seguimiento", status: "confirmada", createdByRole: "paciente", confirmationSource: "paciente", cancellationDeadlineHours: 24 },
  // Turno para pruebas de cancelación (fuera de ventana - muy pronto)
  { id: "apt-test-2", patientId: "p-1", patientName: "Laura Martínez", professionalId: "prof-1", professionalName: "Dra. María Pérez", locationId: "loc-1", locationName: "Consultorio Centro", clinicId: "clinic-1", date: "2026-05-08", time: "12:00", endTime: "12:30", type: "Seguimiento", status: "confirmada", createdByRole: "paciente", confirmationSource: "paciente", cancellationDeadlineHours: 24 },
];

export const mockConsultations: Consultation[] = [
  {
    id: "con-1", patientId: "p-1", patientName: "Laura Martínez", professionalId: "prof-1", professionalName: "Dra. María Pérez", clinicId: "clinic-1",
    type: "Seguimiento", date: "2026-04-05", reason: "Control de presión arterial",
    anamnesis: encrypt("Paciente refiere sentirse bien, sin cefalea ni mareos. Toma losartán 50mg diariamente."),
    physicalExam: encrypt("Paciente consciente, orientada, bien hidratada. Ruidos cardíacos rítmicos."),
    vitalSigns: { bloodPressure: "130/85 mmHg", heartRate: "72 bpm", temperature: "36.5 °C", weight: "65 kg", heightCm: 165, bmi: 23.9 },
    diagnoses: [{ code: "I10", name: "Hipertensión esencial (primaria)", codingSystem: "CIE-10" }],
    treatment: encrypt("Se mantiene losartán 50mg c/24h. Dieta baja en sodio. Ejercicio 30 min diarios."),
    followUp: "Control en 4 semanas con perfil lipídico actualizado.",
    notes: encrypt("Paciente estable. Se mantiene medicación actual.")
  },
  {
    id: "con-2", patientId: "p-1", patientName: "Laura Martínez", professionalId: "prof-1", professionalName: "Dra. María Pérez", clinicId: null,
    type: "Seguimiento", date: "2026-03-20", reason: "Revisión de laboratorios",
    anamnesis: encrypt("Paciente acude con resultados de laboratorio solicitados en consulta previa."),
    physicalExam: encrypt("Sin hallazgos relevantes. Paciente en buen estado general."),
    vitalSigns: { bloodPressure: "125/80 mmHg", heartRate: "68 bpm", temperature: "36.3 °C", weight: "65.5 kg", heightCm: 165, bmi: 24.1 },
    diagnoses: [{ code: "Z01.7", name: "Examen de laboratorio", codingSystem: "CIE-10" }],
    treatment: encrypt("Resultados dentro de parámetros normales. Sin cambios en medicación."),
    followUp: "Se agenda seguimiento en 2 semanas para control de presión.",
  },
  {
    id: "con-3", patientId: "p-2", patientName: "Pedro Sánchez", professionalId: "prof-1", professionalName: "Dra. María Pérez", clinicId: "clinic-2",
    type: "Seguimiento", date: "2026-04-03", reason: "Control de glucosa",
    anamnesis: encrypt("Paciente con diabetes tipo 2 diagnosticada hace 3 años. Refiere buena adherencia a metformina."),
    physicalExam: encrypt("IMC 28.5. Piel sin lesiones. Sensibilidad conservada en extremidades."),
    vitalSigns: { bloodPressure: "120/80 mmHg", heartRate: "76 bpm", temperature: "36.4 °C", weight: "82 kg", heightCm: 170, bmi: 28.4 },
    diagnoses: [{ code: "E11", name: "Diabetes mellitus tipo 2", codingSystem: "CIE-10" }],
    treatment: encrypt("Metformina 850mg c/12h. Dieta diabética. Ejercicio aeróbico regular."),
    followUp: "Hemoglobina glucosilada en 3 meses. Control en 6 semanas.",
  },
  {
    id: "con-4", patientId: "p-4", patientName: "Miguel Torres", professionalId: "prof-1", professionalName: "Dra. María Pérez", clinicId: "clinic-2",
    type: "Primera vez", date: "2026-03-28", reason: "Crisis asmática leve",
    anamnesis: encrypt("Paciente refiere episodio de disnea y sibilancias desde hace 2 días, posiblemente por cambio climático."),
    physicalExam: encrypt("Sibilancias espiratorias bilaterales leves. Saturación O2 96%. FR 20."),
    vitalSigns: { bloodPressure: "118/75 mmHg", heartRate: "88 bpm", temperature: "36.6 °C", weight: "78 kg", heightCm: 175, bmi: 25.5 },
    diagnoses: [{ code: "J45.0", name: "Asma predominantemente alérgica", codingSystem: "CIE-10" }],
    treatment: encrypt("Salbutamol inhalado PRN. Budesonida inhalada 200mcg c/12h por 2 semanas."),
    followUp: "Reevaluar en 2 semanas. Si empeora, acudir a urgencias.",
  },
  {
    id: "con-5", patientId: "p-6", patientName: "Julián Ruiz", professionalId: "prof-1", professionalName: "Dra. María Pérez", clinicId: "clinic-3",
    type: "Seguimiento", date: "2026-03-15", reason: "Control de colesterol y presión",
    anamnesis: encrypt("Paciente con hipercolesterolemia e hipertensión. Refiere dieta irregular las últimas semanas."),
    physicalExam: encrypt("Paciente con sobrepeso. Auscultación cardiopulmonar normal."),
    vitalSigns: { bloodPressure: "140/90 mmHg", heartRate: "78 bpm", temperature: "36.5 °C", weight: "88 kg", heightCm: 172, bmi: 29.7 },
    diagnoses: [
      { code: "I10", name: "Hipertensión esencial (primaria)", codingSystem: "CIE-10" },
      { code: "E78.0", name: "Hipercolesterolemia pura", codingSystem: "CIE-10" },
    ],
    treatment: encrypt("Atorvastatina 20mg nocturno. Losartán 50mg c/24h. Dieta hipolipemiante estricta."),
    followUp: "Perfil lipídico en 8 semanas. Control en 4 semanas.",
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
    { type: "Seguimiento", count: 70, percentage: 80 },
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
  { id: "prof-1", email: encrypt("dra.garcia@email.com"), firstName: "María", lastName: "Pérez", role: "profesional", phone: encrypt("+52 55 9876 5432"), createdAt: "2024-01-15", status: "activo", kycStatus: "approved", licenseStatus: "valid", licenseLastCheckedAt: "2026-04-05T10:00:00Z", emailVerifiedAt: "2024-01-15T10:00:00Z" },
  { id: "prof-2", email: encrypt("dr.mendoza@email.com"), firstName: "Julián", lastName: "Mendoza", role: "profesional", phone: encrypt("+52 55 8765 4321"), createdAt: "2024-03-20", status: "activo", kycStatus: "approved", licenseStatus: "pending", trialExpired: false, emailVerifiedAt: "2024-03-20T10:00:00Z" },
  { id: "prof-3", email: encrypt("dra.lopez@email.com"), firstName: "Ana", lastName: "López", role: "profesional", phone: encrypt("+52 55 7654 3210"), createdAt: "2024-06-10", status: "activo", kycStatus: "none", licenseStatus: "unverifiable", trialExpired: true },
  { id: "pat-1", email: encrypt("laura@email.com"), firstName: "Laura", lastName: "Martínez", role: "paciente", createdAt: "2024-03-10", status: "activo", kycStatus: "approved", emailVerifiedAt: "2024-03-10T10:00:00Z" },
  { id: "pat-2", email: encrypt("pedro@email.com"), firstName: "Pedro", lastName: "Sánchez", role: "paciente", createdAt: "2024-05-12", status: "activo", kycStatus: "none" },
  { id: "pat-3", email: encrypt("ana@email.com"), firstName: "Ana", lastName: "Rodríguez", role: "paciente", createdAt: "2025-01-20", status: "activo", kycStatus: "pending" },
  { id: "pat-4", email: encrypt("miguel@email.com"), firstName: "Miguel", lastName: "Torres", role: "paciente", createdAt: "2023-09-05", status: "activo", kycStatus: "approved" },
  { id: "pat-5", email: encrypt("sofia@email.com"), firstName: "Sofía", lastName: "Hernández", role: "paciente", createdAt: "2024-11-15", status: "activo", kycStatus: "approved" },
  { id: "pat-6", email: encrypt("julian@email.com"), firstName: "Julián", lastName: "Ruiz", role: "paciente", createdAt: "2022-06-20", status: "activo", kycStatus: "approved" },
  { id: "pat-7", email: encrypt("roberto@email.com"), firstName: "Roberto", lastName: "Díaz", role: "paciente", createdAt: "2024-08-10", status: "inactivo", kycStatus: "none" },
  { id: "admin-1", email: encrypt("admin@miconsultorio.ar"), firstName: "Admin", lastName: "Sistema", role: "admin", createdAt: "2023-01-01", status: "activo", kycStatus: "approved" },
];

export const mockAuditLogs: AuditLog[] = [
  {
    id: "log-1",
    actor: { id: "prof-1", name: "Dra. María Pérez", role: "profesional" },
    action: "login",
    resource: "auth",
    details: "Inicio de sesión exitoso",
    ipAddress: "192.168.1.100",
    timestamp: "2026-04-10T08:30:00Z",
    device: "Desktop - Chrome",
    result: "success",
    correlationId: "corr-1",
    hash: "h1",
    previousHash: "0",
  },
  {
    id: "log-2",
    actor: { id: "pat-1", name: "Laura Martínez", role: "paciente" },
    action: "booking.create",
    resource: "appointments",
    details: "Cita creada para 10 abr 2026 09:00",
    ipAddress: "192.168.1.101",
    timestamp: "2026-04-09T16:45:00Z",
    device: "Mobile - iOS",
    result: "success",
    correlationId: "corr-2",
    hash: "h2",
    previousHash: "h1",
  },
  {
    id: "log-3",
    actor: { id: "prof-1", name: "Dra. María Pérez", role: "profesional" },
    action: "consultation.create",
    resource: "consultations",
    details: "Consulta registrada para paciente Laura Martínez",
    ipAddress: "192.168.1.100",
    timestamp: "2026-04-05T11:00:00Z",
    device: "Desktop - Chrome",
    result: "success",
    correlationId: "corr-3",
    hash: "h3",
    previousHash: "h2",
  },
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
  { id: "pn-1", type: "appointment", title: "Cita confirmada", message: "Tu cita con Dra. Pérez del 10 abr a las 09:00 ha sido confirmada", time: "Hace 1 hora", read: false, createdAt: "2026-04-10T08:00:00" },
  { id: "pn-2", type: "reminder", title: "Recordatorio de cita", message: "Tienes una cita mañana 10 abr a las 09:00 con Dra. Pérez", time: "Ayer", read: true, createdAt: "2026-04-09T18:00:00" },
  { id: "pn-3", type: "system", title: "Bienvenido a MiConsultorio", message: "Tu cuenta ha sido creada exitosamente. Explora la plataforma.", time: "Hace 1 semana", read: true, createdAt: "2026-04-03T10:00:00" },
];

import type { CareAuthorization, AppointmentAccessToken } from "./types";

export const mockAppointmentTokens: AppointmentAccessToken[] = [
  {
    token: "token-active-123",
    appointmentId: "apt-15",
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    permissions: ["confirm", "cancel"]
  },
  {
    token: "token-expired-456",
    appointmentId: "apt-16",
    expiresAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    permissions: ["confirm", "cancel"]
  },
  {
    token: "token-test-1",
    appointmentId: "apt-test-1",
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    permissions: ["confirm", "cancel"]
  },
  {
    token: "token-test-2",
    appointmentId: "apt-test-2",
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    permissions: ["confirm", "cancel"]
  }
];

export const mockConsentDocuments: ConsentDocument[] = [
  {
    id: "consent-v1",
    title: "Consentimiento Informado para el Tratamiento de Datos de Salud",
    content: "Por la presente, autorizo al profesional y a las clínicas asociadas a acceder a mi historial clínico, diagnósticos, tratamientos y notas de evolución con el fin de brindar atención médica coordinada. Entiendo que puedo revocar este consentimiento en cualquier momento desde mi portal de paciente.",
    version: "1.0",
    versionHash: "h1-abcde12345",
    createdAt: "2024-01-01T00:00:00Z"
  }
];

export const mockConsentAcceptances: ConsentAcceptance[] = [
  {
    id: "acc-1",
    consentDocumentId: "consent-v1",
    patientId: "p-1",
    acceptedAt: "2024-03-10T10:00:00Z",
    ipAddress: "192.168.1.101",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    method: "panel",
    consentVersionHash: "h1-abcde12345"
  },
  {
    id: "acc-2",
    consentDocumentId: "consent-v1",
    patientId: "p-1",
    acceptedAt: "2024-03-15T11:00:00Z",
    ipAddress: "192.168.1.101",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    method: "panel",
    consentVersionHash: "h1-abcde12345"
  }
];

export const mockAccessGrants: AccessGrant[] = [
  { id: "grant-1", patientId: "p-1", professionalId: "prof-1", clinicId: null, consentAcceptanceId: "acc-1", status: "active", grantedAt: "2024-03-10T10:00:00Z" },
  { id: "grant-2", patientId: "p-1", professionalId: "prof-1", clinicId: "clinic-1", consentAcceptanceId: "acc-2", status: "active", grantedAt: "2024-03-15T11:00:00Z" }
];

export const mockCareAuthorizations: CareAuthorization[] = [
  // Laura Martínez (p-1): Private + Clinic 1
  { id: "auth-1", patientId: "p-1", professionalId: "prof-1", clinicId: null, status: "active", createdAt: "2024-03-10", lastVisit: "2026-03-20", totalVisits: 5 },
  { id: "auth-2", patientId: "p-1", professionalId: "prof-1", clinicId: "clinic-1", status: "active", createdAt: "2024-03-15", lastVisit: "2026-04-05", totalVisits: 7 },
  // Pedro Sánchez (p-2): Clinic 1 + Clinic 2
  { id: "auth-3", patientId: "p-2", professionalId: "prof-1", clinicId: "clinic-1", status: "active", createdAt: "2024-05-12", lastVisit: "2026-04-10", totalVisits: 4 },
  { id: "auth-4", patientId: "p-2", professionalId: "prof-1", clinicId: "clinic-2", status: "active", createdAt: "2024-06-01", lastVisit: "2026-04-03", totalVisits: 4 },
  // Ana Rodríguez (p-3): Private only
  { id: "auth-5", patientId: "p-3", professionalId: "prof-1", clinicId: null, status: "active", createdAt: "2025-01-20", lastVisit: "2026-04-01", totalVisits: 3 },
  // Miguel Torres (p-4): Clinic 2 only
  { id: "auth-6", patientId: "p-4", professionalId: "prof-1", clinicId: "clinic-2", status: "active", createdAt: "2023-09-05", lastVisit: "2026-04-11", totalVisits: 15 },
  // Sofía Hernández (p-5): Clinic 3 + Private
  { id: "auth-7", patientId: "p-5", professionalId: "prof-1", clinicId: "clinic-3", status: "active", createdAt: "2024-11-15", lastVisit: "2026-04-11", totalVisits: 4 },
  { id: "auth-8", patientId: "p-5", professionalId: "prof-1", clinicId: null, status: "active", createdAt: "2024-12-01", lastVisit: "2026-03-25", totalVisits: 2 },
  // Julián Ruiz (p-6): Clinic 1 + Clinic 3
  { id: "auth-9", patientId: "p-6", professionalId: "prof-1", clinicId: "clinic-1", status: "active", createdAt: "2022-06-20", lastVisit: "2026-04-12", totalVisits: 12 },
  { id: "auth-10", patientId: "p-6", professionalId: "prof-1", clinicId: "clinic-3", status: "active", createdAt: "2023-01-10", lastVisit: "2026-03-15", totalVisits: 10 },
  // Elena Guzmán (p-7): Private only
  { id: "auth-11", patientId: "p-7", professionalId: "prof-1", clinicId: null, status: "active", createdAt: "2025-12-01", lastVisit: "2026-03-15", totalVisits: 2 },
  // Roberto Díaz (p-8): Clinic 2 - Revoked
  { id: "auth-12", patientId: "p-8", professionalId: "prof-1", clinicId: "clinic-2", status: "revoked", createdAt: "2024-08-10", revokedAt: "2026-03-01", lastVisit: "2026-02-28", totalVisits: 9 },
];

// Mock professional-patient requests
export const mockProfessionalPatientRequests: ProfessionalPatientRequest[] = [
  {
    id: "req-1",
    patientId: "p-1",
    professionalId: "prof-2", // Dr. Julián Mendoza
    clinicId: "clinic-2",
    status: "pending",
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    consentDocumentId: "consent-v1"
  }
];
export const mockRegistrationInvites: RegistrationInvite[] = [];

import type { EmailVerificationCode } from "./types";
export const mockEmailVerificationCodes: EmailVerificationCode[] = [];

export const mockPasswordResetTokens: { email: string; token: string; expiresAt: string }[] = [];
