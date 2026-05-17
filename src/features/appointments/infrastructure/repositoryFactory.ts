import type { AppointmentRepository } from "../domain/appointmentsRepository";
import { MockAppointmentsRepository } from "./mockAppointmentsRepository";

let cached: AppointmentRepository | null = null;

export const getAppointmentsRepository = async (): Promise<AppointmentRepository> => {
  if (cached) return cached;

  if (import.meta.env.VITE_APPOINTMENTS_REPOSITORY === "sqlite") {
    const { SqliteAppointmentsRepository } = await import("./sqliteAppointmentsRepository");
    const dbPath = import.meta.env.VITE_APPOINTMENTS_DB_PATH || "./data/appointments.sqlite";
    cached = new SqliteAppointmentsRepository(dbPath);
  } else {
    cached = new MockAppointmentsRepository();
  }

  return cached;
};
