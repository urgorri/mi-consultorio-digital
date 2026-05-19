import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import PatientNotificationsPage from "./PatientNotificationsPage";
import { BrowserRouter } from "react-router-dom";
import { patientPortalApi } from "@/services/api";
import { notificationFixtures } from "@/test/fixtures/apiFixtures";

vi.mock("@/services/api/client", async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    patientPortalApi: {
      ...actual.patientPortalApi,
      getNotifications: vi.fn(),
      markNotificationRead: vi.fn(),
      markAllNotificationsRead: vi.fn(),
    },
    notificationsApi: {
      ...actual.notificationsApi,
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
    },
    PUBLIC_APPOINTMENTS_API_V1: {
      basePath: "/api/appointments-public/v1",
      availability: "/api/appointments-public/v1/availability",
      reservations: "/api/appointments-public/v1/reservations",
      reservationByToken: (token: string) => `/api/appointments-public/v1/reservations/token/${token}`,
      confirmByToken: (token: string) => `/api/appointments-public/v1/reservations/token/${token}/confirm`,
      cancelByToken: (token: string) => `/api/appointments-public/v1/reservations/token/${token}/cancel`,
    }
  };
});

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

  it("should mark all as read", async () => {
    (patientPortalApi.markAllNotificationsRead as any).mockResolvedValue({ success: true });

    render(
      <BrowserRouter>
        <PatientNotificationsPage />
      </BrowserRouter>
    );

    await waitFor(() => expect(screen.getByText("Marcar todas")).toBeInTheDocument());

    const markAllButton = screen.getByText("Marcar todas");
    fireEvent.click(markAllButton);

    await waitFor(() => {
      expect(patientPortalApi.markAllNotificationsRead).toHaveBeenCalled();
      expect(screen.getByText(/0 sin leer/i)).toBeInTheDocument();
    });
  });

  it("should mark individual notification as read", async () => {
    (patientPortalApi.markNotificationRead as any).mockResolvedValue({ success: true });

    render(
      <BrowserRouter>
        <PatientNotificationsPage />
      </BrowserRouter>
    );

    await waitFor(() => expect(screen.getByText(notificationFixtures[0].title)).toBeInTheDocument());

    // Fixture 0 is unread
    const unreadCountBefore = notificationFixtures.filter(n => !n.read).length;
    expect(screen.getByText(new RegExp(`${unreadCountBefore} sin leer`, "i"))).toBeInTheDocument();

    const markAsReadButtons = screen.getAllByTitle("Marcar como leída");
    fireEvent.click(markAsReadButtons[0]);

    await waitFor(() => {
      expect(patientPortalApi.markNotificationRead).toHaveBeenCalledWith(notificationFixtures[0].id);
      expect(screen.getByText(new RegExp(`${unreadCountBefore - 1} sin leer`, "i"))).toBeInTheDocument();
    });
  });

  it("should revert optimistic update on failure", async () => {
    (patientPortalApi.markNotificationRead as any).mockResolvedValue({ success: false });

    render(
      <BrowserRouter>
        <PatientNotificationsPage />
      </BrowserRouter>
    );

    await waitFor(() => expect(screen.getByText(notificationFixtures[0].title)).toBeInTheDocument());

    const unreadCountBefore = notificationFixtures.filter(n => !n.read).length;

    const markAsReadButtons = screen.getAllByTitle("Marcar como leída");
    fireEvent.click(markAsReadButtons[0]);

    // Should briefly show updated count then revert
    await waitFor(() => {
      expect(screen.getByText(new RegExp(`${unreadCountBefore} sin leer`, "i"))).toBeInTheDocument();
    });
  });
});
