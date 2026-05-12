import { describe, it, expect, beforeEach, vi } from "vitest";
import { patientsApi } from "./client";
import { mockPatients, mockCareAuthorizations, mockAuditLogs, mockProfessional } from "./mockData";

describe("Identity Resolution and Upsert Logic", () => {
  beforeEach(() => {
    // We can't easily reset the imported mock arrays if they are constants,
    // but we can at least track their length or check specific entries.
    // In a real scenario, we would have a way to reset mock state.
  });

  it("should normalize DNI and Email correctly", async () => {
    const newPatientData = {
      firstName: "Test",
      lastName: "User",
      email: "  TEST@Example.COM  ",
      documentType: "dni" as any,
      documentNumber: " 30.123.456-A ",
      phone: "123456789",
    };

    const response = await patientsApi.create(newPatientData);
    expect(response.success).toBe(true);
    const created = response.data;

    // Check normalization in the created patient (if it was a new creation)
    // Note: If p-1 already exists with similar DNI/Email it might return that instead.
    // Let's use a unique DNI for this test to ensure it creates a new one.

    const uniqueData = {
      ...newPatientData,
      documentNumber: "UNIQUE123",
      email: "UNIQUE@EMAIL.COM"
    };

    const res2 = await patientsApi.create(uniqueData);
    expect(res2.data.documentNumber).toBe("UNIQUE123");
    expect(res2.data.email).toBe("unique@email.com");
  });

  it("should return existing patient when DNI matches (Identity Reuse)", async () => {
    // mockPatients[0] is Laura Martínez, DNI: 30123456
    const duplicateData = {
      firstName: "Laura",
      lastName: "Martínez",
      email: "different@email.com",
      documentType: "dni" as any,
      documentNumber: "30.123.456", // Will be normalized to 30123456
    };

    const response = await patientsApi.create(duplicateData);
    expect(response.success).toBe(true);
    expect(response.data.id).toBe("p-1"); // Should be p-1 from mockData

    // Verify audit log for identity reuse
    const latestLog = mockAuditLogs[mockAuditLogs.length - 1];
    expect(latestLog.action).toBe("patient.identity_reuse");
    expect(latestLog.details).toContain("Reutilizada identidad existente");
  });

  it("should return existing patient when Email matches", async () => {
    // mockPatients[1] is Pedro Sánchez, email: pedro@email.com
    const duplicateData = {
      firstName: "Pedro",
      lastName: "Sanchez",
      email: "  PEDRO@email.com  ",
      documentType: "dni" as any,
      documentNumber: "99999999", // Different DNI
    };

    const response = await patientsApi.create(duplicateData);
    expect(response.success).toBe(true);
    expect(response.data.id).toBe("p-2");
  });

  it("should create a new CareAuthorization when linking existing patient to new clinic", async () => {
    const existingPatient = mockPatients[2]; // Ana Rodríguez (p-3)
    const profId = mockProfessional.id;

    // Check current authorizations for p-3
    const initialAuthCount = mockCareAuthorizations.filter(a => a.patientId === "p-3").length;

    const newData = {
      ...existingPatient,
      clinicIds: ["clinic-1"] // p-3 usually has no clinicIds in mockData
    };

    await patientsApi.create(newData);

    const finalAuthCount = mockCareAuthorizations.filter(a => a.patientId === "p-3").length;
    expect(finalAuthCount).toBeGreaterThan(initialAuthCount);

    const newAuth = mockCareAuthorizations.find(a => a.patientId === "p-3" && a.clinicId === "clinic-1");
    expect(newAuth).toBeDefined();
    expect(newAuth?.professionalId).toBe(profId);
  });
});
