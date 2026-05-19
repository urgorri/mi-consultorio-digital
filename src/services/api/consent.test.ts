import { describe, it, expect } from "vitest";
import { patientsApi, consultationsApi, patientPortalApi, appointmentsApi } from "./index";
import {
  mockPatients,
  mockAccessGrants,
  mockCareAuthorizations,
  mockProfessional,
  mockConsentDocuments
} from "./mockData";

describe("Consent and Authorization Logic", () => {
  const patientId = "p-1";
  const professionalId = "prof-1";

  it("should deny access if no active access grant exists", async () => {
    // p-2 initially has no active grant for prof-1 in private scope
    const patientId2 = "p-2";

    await expect(patientsApi.getById(patientId2))
      .rejects.toThrow("No existe una autorización vigente");
  });

  it("should allow access if active access grant exists", async () => {
    // p-1 has active grants for prof-1 (grant-1, grant-2)
    const response = await patientsApi.getById(patientId);
    expect(response.success).toBe(true);
    expect(response.data.id).toBe(patientId);
  });

  it("should create access grant and acceptance when accepting a request", async () => {
    const requestId = "req-1"; // prof-2 to p-1 for clinic-2
    const acceptanceData = {
      method: "panel" as const,
      ipAddress: "1.2.3.4",
      userAgent: "Test Agent"
    };

    const initialGrants = mockAccessGrants.length;

    const response = await patientPortalApi.acceptRequest(requestId, acceptanceData);
    expect(response.success).toBe(true);

    expect(mockAccessGrants.length).toBe(initialGrants + 1);
    const newGrant = mockAccessGrants[mockAccessGrants.length - 1];
    expect(newGrant.patientId).toBe("p-1");
    expect(newGrant.professionalId).toBe("prof-2");
    expect(newGrant.status).toBe("active");
  });

  it("should revoke access and deny subsequent requests", async () => {
    // grant-1 is p-1 for prof-1 (private)
    const grantId = "grant-1";

    await patientPortalApi.revokeAccessGrant(grantId);

    // Now trying to get patient p-1 as prof-1 in private scope should fail
    // IF we are strict. Note that enrichPatient uses ALL active grants.
    // p-1 also has grant-2 (clinic-1) active.

    // Let's revoke all grants for p-1 / prof-1
    const grant2 = mockAccessGrants.find(g => g.patientId === "p-1" && g.professionalId === "prof-1" && g.status === "active");
    if (grant2) await patientPortalApi.revokeAccessGrant(grant2.id);

    await expect(patientsApi.getById("p-1"))
      .rejects.toThrow("No existe una autorización vigente");
  });

  it("should prevent creating appointments without active access grant", async () => {
    // p-2 has no grant for prof-1
    const aptData = {
      patientId: "p-2",
      professionalId: "prof-1",
      date: "2026-05-01",
      time: "10:00",
      endTime: "10:30",
      clinicId: null
    };

    await expect(appointmentsApi.create(aptData))
      .rejects.toThrow("No existe una autorización vigente");
  });
});
