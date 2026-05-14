import { describe, expect, it } from "vitest";
import { canPerformAction } from "./permissionMatrix";

describe("permission matrix", () => {
  it("permite a admin invalidar licencias", () => {
    expect(canPerformAction("admin", "active", "professionals.license.invalidate")).toBe(true);
  });

  it("impide a profesional suspendido acceder a historial clínico", () => {
    expect(canPerformAction("profesional", "suspended", "clinical-records.consultation.read")).toBe(false);
  });

  it("permite al paciente revocar su consentimiento", () => {
    expect(canPerformAction("paciente", "active", "consents.consent.revoke")).toBe(true);
  });

  it("impide a paciente leer auditoría", () => {
    expect(canPerformAction("paciente", "active", "audit.event.read")).toBe(false);
  });
});
