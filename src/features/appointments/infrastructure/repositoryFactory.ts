import type { AppointmentRepository } from "../domain/appointmentsRepository";
import { MockAppointmentsRepository } from "./mockAppointmentsRepository";

let cached: AppointmentRepository | null = null;

export const getAppointmentsRepository = (): AppointmentRepository => {
  if (cached) return cached;
  const useMock = import.meta.env.VITE_APPOINTMENTS_REPOSITORY !== "sqlite";
  cached = useMock ? new MockAppointmentsRepository() : new MockAppointmentsRepository();
  return cached;
};
