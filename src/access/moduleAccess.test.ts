import { describe, it, expect } from "vitest";
import { canAccessModule, canUseCapability } from "./moduleAccess";
import type { AppRole, PlanType, ModuleKey, Capability } from "./moduleAccess";

describe("moduleAccess", () => {
  describe("canAccessModule", () => {
    it("should allow core modules for correct roles", () => {
      expect(canAccessModule({ role: "profesional" }, "turnos")).toBe(true);
      expect(canAccessModule({ role: "profesional" }, "configuracion")).toBe(true);
      expect(canAccessModule({ role: "paciente" }, "portal")).toBe(true);
      expect(canAccessModule({ role: "paciente" }, "turnos")).toBe(true);
    });

    it("should deny core modules for incorrect roles", () => {
      expect(canAccessModule({ role: "paciente" }, "pacientes")).toBe(false);
      expect(canAccessModule({ role: "profesional" }, "portal")).toBe(false);
    });

    it("should allow optional modules if included in plan", () => {
      const user = { role: "profesional" as AppRole, plan: "professional" as PlanType };
      expect(canAccessModule(user, "pacientes")).toBe(true);
      expect(canAccessModule(user, "consultas")).toBe(true);
      expect(canAccessModule(user, "reportes")).toBe(false);
    });

    it("should allow optional modules if explicitly enabled in activeModules", () => {
      const user = {
        role: "profesional" as AppRole,
        plan: "basic" as PlanType,
        activeModules: ["reportes"] as ModuleKey[]
      };
      expect(canAccessModule(user, "reportes")).toBe(true);
      expect(canAccessModule(user, "pacientes")).toBe(false);
    });

    it("should deny access if module is disabled (not in plan or activeModules)", () => {
      const user = { role: "profesional" as AppRole, plan: "basic" as PlanType };
      expect(canAccessModule(user, "reportes")).toBe(false);
    });
  });

  describe("canUseCapability", () => {
    it("should allow capability if module is accessible", () => {
      const user = { role: "profesional" as AppRole, plan: "professional" as PlanType };
      expect(canUseCapability(user, "turnos.manage")).toBe(true);
      expect(canUseCapability(user, "pacientes.view")).toBe(true);
    });

    it("should deny capability if module is not accessible", () => {
      const user = { role: "profesional" as AppRole, plan: "basic" as PlanType };
      expect(canUseCapability(user, "reportes.view")).toBe(false);
    });

    it("should deny non-existent capabilities", () => {
      const user = { role: "profesional" as AppRole, plan: "premium" as PlanType };
      expect(canUseCapability(user, "non.existent" as Capability)).toBe(false);
    });
  });
});
