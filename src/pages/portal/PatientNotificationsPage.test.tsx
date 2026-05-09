import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import PatientNotificationsPage from "./PatientNotificationsPage";
import { BrowserRouter } from "react-router-dom";
import { patientPortalApi } from "@/services/api/client";
import { notificationFixtures } from "@/test/fixtures/apiFixtures";

vi.mock("@/services/api/client", () => ({
  patientPortalApi: {
    getNotifications: vi.fn(),
  },
  notificationsApi: {
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
  }
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "p-1", role: "paciente", firstName: "Test", lastName: "User" },
    isLoading: false,
  }),
}));

describe("PatientNotificationsPage Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (patientPortalApi.getNotifications as any).mockResolvedValue({ success: true, data: notificationFixtures });
  });

  it("should load and display notifications", async () => {
    render(
      <BrowserRouter>
        <PatientNotificationsPage />
      </BrowserRouter>
    );

    await waitFor(() => expect(screen.getByText(notificationFixtures[0].title)).toBeInTheDocument());
    expect(screen.getByText(notificationFixtures[1].title)).toBeInTheDocument();
  });

  it("should show unread count", async () => {
    render(
      <BrowserRouter>
        <PatientNotificationsPage />
      </BrowserRouter>
    );

    const unreadCount = notificationFixtures.filter(n => !n.read).length;
    await waitFor(() => expect(screen.getByText(new RegExp(`${unreadCount} sin leer`, "i"))).toBeInTheDocument());
  });
});
