import { describe, expect, it } from "vitest";
import { appointmentsApi, publicAppointmentsApi } from "./client";
import { API_DEPRECATION_POLICY, API_SEMVER, publicErrorSchema } from "./publicAppointmentsContract";

describe("publicAppointmentsApi v1 contract", () => {
  it("validates availability request/response", async () => {
    const response = await publicAppointmentsApi.availability({
      professionalId: "prof-1",
      date: "2026-05-16",
    });

    expect(response.success).toBe(true);
    expect(Array.isArray(response.data)).toBe(true);
  });

  it("supports backward compatible token status via appointmentsApi token", async () => {
    const response = await publicAppointmentsApi.tokenStatus("token-active-123");
    expect(response.success).toBe(true);
    expect(response.data.id).toMatch(/^apt-/);
  });

  it("returns homogeneous TOKEN_EXPIRED error payload for invalid token", async () => {
    await expect(publicAppointmentsApi.tokenStatus("invalid-token")).rejects.toMatchObject({
      success: false,
      error: {
        code: "TOKEN_EXPIRED",
        message: "No fue posible operar la reserva.",
      },
    });

    try {
      await publicAppointmentsApi.tokenStatus("invalid-token");
    } catch (error) {
      expect(publicErrorSchema.safeParse(error).success).toBe(true);
    }
  });

  it("exposes semantic versioning and explicit deprecation policy", () => {
    expect(publicAppointmentsApi.meta.semver).toBe(API_SEMVER);
    expect(publicAppointmentsApi.meta.deprecation).toEqual(API_DEPRECATION_POLICY);
  });

  describe("reservations", () => {
    it("creates a reservation with valid patientData (landing pública flow)", async () => {
      const response = await publicAppointmentsApi.reservations({
        professionalId: "prof-1",
        date: "2026-05-20",
        time: "10:00",
        endTime: "10:30",
        patientData: {
          firstName: "Juan",
          lastName: "Pérez",
          email: "juan.perez@example.com",
          phone: "+541122334455",
          documentNumber: "20123456",
          documentType: "dni",
        },
      });

      expect(response.success).toBe(true);
      expect(response.data.id).toMatch(/^apt-/);
      expect(response.data.status).toBe("pendiente");
    });

    it("maintains backward compatibility with patientId", async () => {
      const response = await publicAppointmentsApi.reservations({
        patientId: "p-1",
        professionalId: "prof-1",
        date: "2026-05-21",
        time: "11:00",
        endTime: "11:30",
      });

      expect(response.success).toBe(true);
      expect(response.data.id).toMatch(/^apt-/);
      // internal appointmentsApi.create defaults to scheduled (or confirmada if professional creates it, but here it's public)
      // client.ts: response = await appointmentsApi.create({ ... createdByRole: "paciente" });
      // appointmentsApi.create defaults to scheduled if not provided
      expect(response.data.status).toBe("scheduled");
    });

    it("rejects request if both patientId and patientData are missing", async () => {
      const invalidPayload = {
        professionalId: "prof-1",
        date: "2026-05-20",
        time: "10:00",
        endTime: "10:30",
      };

      await expect(publicAppointmentsApi.reservations(invalidPayload as any)).rejects.toThrow();
    });

    it("rejects request if patientData is incomplete", async () => {
      const invalidPayload = {
        professionalId: "prof-1",
        date: "2026-05-20",
        time: "10:00",
        endTime: "10:30",
        patientData: {
          firstName: "Juan",
          // missing lastName, email, etc.
        },
      };

      await expect(publicAppointmentsApi.reservations(invalidPayload as any)).rejects.toThrow();
    });
  });
});
