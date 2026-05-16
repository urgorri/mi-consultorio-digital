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
});
