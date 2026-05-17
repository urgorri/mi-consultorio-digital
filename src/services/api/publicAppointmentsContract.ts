import { z } from "zod";
import type { ApiResponse, Appointment } from "./types";
import { APPOINTMENT_STATUS } from "@/features/appointments/domain/appointmentStatus";

export const API_SEMVER = "1.1.0";
export const API_DEPRECATION_POLICY = {
  majorVersion: 1,
  deprecated: false,
  sunsetDate: null as string | null,
  minimumNoticeDays: 180,
};

const isoDate = z.string().datetime({ offset: true });
const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const timeOnly = z.string().regex(/^\d{2}:\d{2}$/);

export const publicErrorCodes = [
  "TOKEN_EXPIRED",
  "TOKEN_INVALID",
  "VALIDATION_ERROR",
  "RATE_LIMITED",
] as const;

export const publicErrorSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.enum(publicErrorCodes),
    message: z.string().min(1),
    details: z.object({ correlationId: z.string().min(1) }).passthrough(),
  }),
});

export const availabilityQuerySchema = z.object({
  professionalId: z.string().min(1),
  date: dateOnly,
});

export const availabilityResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(timeOnly),
});

export const patientDataSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  documentNumber: z.string().min(1),
  documentType: z.enum(["dni", "pasaporte", "cedula", "otro"]),
});

export const reservationsRequestSchema = z.object({
  patientId: z.string().min(1).optional(),
  patientData: patientDataSchema.optional(),
  professionalId: z.string().min(1),
  date: dateOnly,
  time: timeOnly,
  endTime: timeOnly,
  clinicId: z.string().nullable().optional(),
}).refine((data) => data.patientId || data.patientData, {
  message: "Debe proporcionar patientId o patientData",
  path: ["patientId"],
});

const appointmentStatusSchema = z.string().min(1);

export const tokenStatusResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    id: z.string(),
    tokenExpiresAt: isoDate.optional(),
    status: appointmentStatusSchema,
  }).passthrough(),
});

export const tokenActionResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    id: z.string(),
    status: appointmentStatusSchema,
  }).passthrough(),
});

export const reservationResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    id: z.string(),
    status: appointmentStatusSchema,
  }).passthrough(),
});

export function validateRequest<T>(schema: z.ZodSchema<T>, payload: unknown): T {
  return schema.parse(payload);
}

export function validateResponse<T>(schema: z.ZodSchema<T>, payload: unknown): T {
  return schema.parse(payload);
}

export function toPublicTokenError(correlationId: string, code: "TOKEN_EXPIRED" | "TOKEN_INVALID") {
  return {
    success: false as const,
    error: {
      code,
      message: "No fue posible operar la reserva.",
      details: { correlationId },
    },
  };
}

export type PublicSuccessResponse<T> = ApiResponse<T>;
export type PublicAppointment = Appointment;
