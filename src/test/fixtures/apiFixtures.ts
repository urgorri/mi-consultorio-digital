export const doctorFixtures = [
  { id: "prof-1", name: "Dra. María Pérez", specialty: "Medicina General", location: "Consultorio Centro", address: "Av. Principal 123", whatsapp: "525512345678" },
  { id: "prof-2", name: "Dr. Julián Mendoza", specialty: "Pediatría", location: "Consultorio Norte", address: "Calle Secundaria 456" },
];

export const visitTypeFixtures = [
  { id: "type-1", name: "Seguimiento", duration: "20 min" },
  { id: "type-2", name: "Primera vez", duration: "45 min" },
];

export const slotFixtures = ["09:00", "09:30", "10:00", "10:30"];

export const appointmentFixtures = {
  id: "apt-123",
  patientId: "p-1",
  patientName: "Laura Martínez",
  professionalId: "prof-1",
  professionalName: "Dra. María Pérez",
  date: "2026-05-15",
  time: "10:00",
  type: "Seguimiento",
  status: "confirmada",
  cancellationDeadlineHours: 24,
};

export const notificationFixtures = [
  { id: "n-1", title: "Cita confirmada", message: "Tu cita ha sido confirmada", read: false, createdAt: new Date().toISOString() },
  { id: "n-2", title: "Nueva solicitud", message: "Tienes una nueva solicitud de acceso", read: true, createdAt: new Date().toISOString() },
];
