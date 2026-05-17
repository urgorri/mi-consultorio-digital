import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

describe("repositoryFactory", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("should return MockAppointmentsRepository by default", async () => {
    const { getAppointmentsRepository } = await import("../repositoryFactory");
    const { MockAppointmentsRepository } = await import("../mockAppointmentsRepository");
    const repo = await getAppointmentsRepository();
    expect(repo).toBeInstanceOf(MockAppointmentsRepository);
  });

  it("should return SqliteAppointmentsRepository when VITE_APPOINTMENTS_REPOSITORY is 'sqlite'", async () => {
    vi.stubEnv("VITE_APPOINTMENTS_REPOSITORY", "sqlite");
    vi.stubEnv("VITE_APPOINTMENTS_DB_PATH", ":memory:");

    const { getAppointmentsRepository } = await import("../repositoryFactory");
    const { SqliteAppointmentsRepository } = await import("../sqliteAppointmentsRepository");
    const repo = await getAppointmentsRepository();
    expect(repo).toBeInstanceOf(SqliteAppointmentsRepository);
  });

  it("should return the same instance (singleton)", async () => {
    const { getAppointmentsRepository } = await import("../repositoryFactory");
    const repo1 = await getAppointmentsRepository();
    const repo2 = await getAppointmentsRepository();
    expect(repo1).toBe(repo2);
  });
});
