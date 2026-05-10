import { describe, it, expect } from "vitest";
import { getLogoutRedirectPath } from "./auth-routing";

describe("auth-routing", () => {
  it("should return /login/paciente for role 'paciente'", () => {
    expect(getLogoutRedirectPath("paciente")).toBe("/login/paciente");
  });

  it("should return /login/profesional for role 'profesional'", () => {
    expect(getLogoutRedirectPath("profesional")).toBe("/login/profesional");
  });

  it("should return /login for role 'admin'", () => {
    expect(getLogoutRedirectPath("admin")).toBe("/login");
  });

  it("should return /login for undefined role", () => {
    expect(getLogoutRedirectPath(undefined)).toBe("/login");
  });
});
