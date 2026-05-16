import { DatabaseSync } from "node:sqlite";
import type { Appointment, AppointmentAccessToken } from "@/services/api/types";
import type { AppointmentRepository } from "../domain/appointmentsRepository";

const MIGRATIONS = [
  `CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL);`,
  `CREATE TABLE IF NOT EXISTS appointments (
    id TEXT PRIMARY KEY,
    payload TEXT NOT NULL,
    patient_id TEXT NOT NULL,
    professional_id TEXT NOT NULL,
    status TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_appointments_professional ON appointments(professional_id);
  CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);`,
  `CREATE TABLE IF NOT EXISTS appointment_tokens (
    token TEXT PRIMARY KEY,
    appointment_id TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    permissions TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_appointment_tokens_appointment ON appointment_tokens(appointment_id);`,
];

export class SqliteAppointmentsRepository implements AppointmentRepository {
  private db: DatabaseSync;
  constructor(filename = ":memory:") { this.db = new DatabaseSync(filename); this.migrate(); }

  private migrate() {
    this.db.exec(MIGRATIONS[0]);
    const row = this.db.prepare("SELECT MAX(version) AS version FROM schema_migrations").get() as { version: number | null };
    const current = row.version ?? 0;
    for (let i = current + 1; i < MIGRATIONS.length; i++) {
      this.db.exec("BEGIN");
      this.db.exec(MIGRATIONS[i]);
      this.db.prepare("INSERT INTO schema_migrations(version, applied_at) VALUES (?, ?)").run(i, new Date().toISOString());
      this.db.exec("COMMIT");
    }
  }

  async createAppointment(data: Appointment) {
    this.db.prepare(`INSERT INTO appointments(id,payload,patient_id,professional_id,status,date,time) VALUES (?,?,?,?,?,?,?)`)
      .run(data.id, JSON.stringify(data), data.patientId, data.professionalId, data.status, data.date, data.time);
    return data;
  }
  async updateAppointmentStatus(id: string, status: Appointment["status"], metadata?: Partial<Appointment>) {
    const current = this.getAppointmentById(id);
    const updated = { ...current, ...metadata, status } as Appointment;
    this.updateStoredAppointment(updated);
    return updated;
  }
  async rescheduleAppointment(id: string, data: Pick<Appointment, "date" | "time" | "endTime">) {
    const current = this.getAppointmentById(id);
    const updated = { ...current, ...data, rescheduledAt: new Date().toISOString() } as Appointment;
    this.updateStoredAppointment(updated);
    return updated;
  }
  async cancelAppointment(id: string, cancelledAt = new Date().toISOString()) {
    return this.updateAppointmentStatus(id, "cancelada", { cancelledAt });
  }
  async listAppointmentsByProfessional(professionalId: string) {
    const rows = this.db.prepare("SELECT payload FROM appointments WHERE professional_id = ?").all(professionalId) as Array<{ payload: string }>;
    return rows.map(r => JSON.parse(r.payload) as Appointment);
  }
  async listAppointmentsByPatient(patientId: string) {
    const rows = this.db.prepare("SELECT payload FROM appointments WHERE patient_id = ?").all(patientId) as Array<{ payload: string }>;
    return rows.map(r => JSON.parse(r.payload) as Appointment);
  }
  async findAppointmentByToken(token: string) {
    const row = this.db.prepare("SELECT appointment_id, expires_at FROM appointment_tokens WHERE token = ?").get(token) as { appointment_id: string; expires_at: string } | undefined;
    if (!row || new Date(row.expires_at) < new Date()) return null;
    return this.getAppointmentById(row.appointment_id);
  }
  async saveAccessToken(token: AppointmentAccessToken) {
    this.db.prepare(`INSERT INTO appointment_tokens(token,appointment_id,expires_at,permissions)
      VALUES (?,?,?,?)
      ON CONFLICT(token) DO UPDATE SET appointment_id=excluded.appointment_id, expires_at=excluded.expires_at, permissions=excluded.permissions`)
      .run(token.token, token.appointmentId, token.expiresAt, JSON.stringify(token.permissions));
  }
  async findTokenByAppointmentId(appointmentId: string) {
    const row = this.db.prepare("SELECT token, appointment_id, expires_at, permissions FROM appointment_tokens WHERE appointment_id = ?").get(appointmentId) as { token: string; appointment_id: string; expires_at: string; permissions: string } | undefined;
    if (!row) return null;
    return { token: row.token, appointmentId: row.appointment_id, expiresAt: row.expires_at, permissions: JSON.parse(row.permissions) };
  }

  private getAppointmentById(id: string): Appointment {
    const row = this.db.prepare("SELECT payload FROM appointments WHERE id = ?").get(id) as { payload: string } | undefined;
    if (!row) throw new Error("Cita no encontrada");
    return JSON.parse(row.payload) as Appointment;
  }
  private updateStoredAppointment(appointment: Appointment) {
    this.db.prepare("UPDATE appointments SET payload=?, patient_id=?, professional_id=?, status=?, date=?, time=? WHERE id=?")
      .run(JSON.stringify(appointment), appointment.patientId, appointment.professionalId, appointment.status, appointment.date, appointment.time, appointment.id);
  }
}
