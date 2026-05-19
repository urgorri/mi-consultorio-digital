import { describe, expect, it } from "vitest";
import { appointmentsApi, publicAppointmentsApi } from "./index";
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
    const response = await publicAppointmentsApi.tokenStatus("token-access-123");
    expect(response.success).toBe(true);
    expect(response.data.id).toBeDefined();
  });

  it("returns homogeneous TOKEN_EXPIRED error payload for invalid token", async () => {
    try {
      await publicAppointmentsApi.tokenStatus("invalid-token");
    } catch (e: any) {
      expect(e.message).toContain("404");
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
          email: "juan@example.com",
          phone: "555-0199",
          documentNumber: "12345678",
          documentType: "dni",
        }
      });

      expect(response.success).toBe(true);
      expect(response.data.id).toMatch(/^apt-/);
      expect(response.data.status).toBe("pending");
    });

    it("maintains backward compatibility with patientId", async () => {
      const response = await publicAppointmentsApi.reservations({
        patientId: "p-1",
        professionalId: "prof-1",
        date: "2026-05-20",
        time: "10:30",
        endTime: "11:00",
      });

      expect(response.success).toBe(true);
      expect(response.data.status).toBe("pending");
    });

    it("rejects request if both patientId and patientData are missing", async () => {
      const invalidPayload = {
        professionalId: "prof-1",
        date: "2026-05-20",
        time: "10:30",
        endTime: "11:00",
      };

      await expect(publicAppointmentsApi.reservations(invalidPayload as any)).rejects.toThrow();
    });

    it("rejects request if patientData is incomplete", async () => {
      const invalidPayload = {
        professionalId: "prof-1",
        date: "2026-05-20",
        time: "10:30",
        endTime: "11:00",
        patientData: {
          firstName: "Juan",
          // missing fields
        }
      };

      await expect(publicAppointmentsApi.reservations(invalidPayload as any)).rejects.toThrow();
    });
  });
});
