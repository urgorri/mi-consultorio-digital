import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import PatientAppointmentDetailPage from "./PatientAppointmentDetailPage";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { appointmentsApi } from "@/services/api/client";
import { appointmentFixtures } from "@/test/fixtures/apiFixtures";

vi.mock("@/services/api/client", () => ({
  appointmentsApi: {
    getByToken: vi.fn(),
    getById: vi.fn(),
    cancel: vi.fn(),
    update: vi.fn(),
    transitionStatus: vi.fn(),
  },
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "p-1", role: "paciente" },
    isLoading: false,
  }),
}));

vi.mock("@/features/appointments/domain/rules", () => ({
  canCancelAppointment: vi.fn(() => true),
  canRescheduleAppointment: vi.fn(() => true),
}));

const renderWithRouter = (ui: React.ReactElement, { route = "/" } = {}) => {
  window.history.pushState({}, "Test page", route);
  return render(
    <BrowserRouter>
      <Routes>
        <Route path="/citas/v/:token" element={ui} />
        <Route path="/portal/citas/:id" element={ui} />
        <Route path="*" element={<div>Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
};

describe("PatientAppointmentDetailPage Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should load and display appointment details via token", async () => {
    (appointmentsApi.getByToken as any).mockResolvedValue({ success: true, data: appointmentFixtures });

    renderWithRouter(<PatientAppointmentDetailPage isPublic={true} />, { route: "/citas/v/some-token" });

    await waitFor(() => expect(screen.getByText(appointmentFixtures.professionalName)).toBeInTheDocument());
    expect(screen.getByText(appointmentFixtures.type)).toBeInTheDocument();
  });

  it("should allow cancelling the appointment", async () => {
    (appointmentsApi.getByToken as any).mockResolvedValue({ success: true, data: appointmentFixtures });
    (appointmentsApi.cancel as any).mockResolvedValue({ success: true });

    const pendingApt = { ...appointmentFixtures, status: "pendiente" };
    (appointmentsApi.getByToken as any).mockResolvedValue({ success: true, data: pendingApt });

    renderWithRouter(<PatientAppointmentDetailPage isPublic={true} />, { route: "/citas/v/some-token" });

    await waitFor(() => expect(screen.getByText(/Cancelar cita/i)).toBeInTheDocument());
    const cancelBtn = screen.getByText(/Cancelar cita/i);
    fireEvent.click(cancelBtn);

    await waitFor(() => expect(appointmentsApi.cancel).toHaveBeenCalledWith(appointmentFixtures.id, "Cancelación desde portal paciente", "paciente"));
  });
});
