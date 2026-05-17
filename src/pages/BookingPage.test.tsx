import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import BookingPage from "./BookingPage";
import { BrowserRouter } from "react-router-dom";
import { appointmentsAdapter } from "@/features/appointments/api/appointmentsAdapter";
import { doctorFixtures, visitTypeFixtures, slotFixtures } from "@/test/fixtures/apiFixtures";

vi.mock("@/features/appointments/api/appointmentsAdapter", () => ({
  appointmentsAdapter: {
    getDoctors: vi.fn(),
    getVisitTypes: vi.fn(),
    getAvailableSlots: vi.fn(),
    createBooking: vi.fn(),
  },
}));

vi.mock("@/contexts/AuthContext", async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    useAuth: () => ({
      user: null,
      isLoading: false,
    }),
  };
});

vi.mock("@/features/appointments/ui/DoctorSelector", () => ({
  DoctorSelector: ({ doctors, onSelect }: any) => (
    <div>
      {doctors.map((d: any) => (
        <button key={d.id} onClick={() => onSelect(d.id)}>{d.name}</button>
      ))}
    </div>
  )
}));

vi.mock("@/features/appointments/ui/VisitTypeSelector", () => ({
  VisitTypeSelector: ({ visitTypes, onSelect }: any) => (
    <div>
      {visitTypes.map((t: any) => (
        <button key={t.id} onClick={() => onSelect(t.id)}>{t.name}</button>
      ))}
    </div>
  )
}));

vi.mock("@/features/appointments/ui/SlotSelector", () => ({
  SlotSelector: ({ onDateSelect, onTimeSelect, availableSlots }: any) => (
    <div>
      <button onClick={() => onDateSelect("2024-12-15")}>Select Date 15</button>
      {availableSlots.map((s: any) => (
        <button key={s} onClick={() => onTimeSelect(s)}>{s}</button>
      ))}
    </div>
  )
}));

vi.mock("@/features/appointments/ui/PatientDataForm", () => ({
  PatientDataForm: ({ onSubmit }: any) => (
    <div>
      <button onClick={() => onSubmit({ firstName: "Test", lastName: "Patient" })}>Submit Booking</button>
    </div>
  )
}));

describe("BookingPage Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (appointmentsAdapter.getDoctors as any).mockResolvedValue(doctorFixtures);
    (appointmentsAdapter.getVisitTypes as any).mockResolvedValue(visitTypeFixtures);
    (appointmentsAdapter.getAvailableSlots as any).mockResolvedValue(slotFixtures);
    (appointmentsAdapter.createBooking as any).mockResolvedValue({ id: "apt-new" });
  });

  it("should complete the booking flow and show management link", async () => {
    const mockManagementUrl = "http://localhost:3000/citas/v/token-123";
    (appointmentsAdapter.createBooking as any).mockResolvedValue({
      id: "apt-new",
      type: "Primera vez",
      managementUrl: mockManagementUrl
    });

    render(
      <BrowserRouter>
        <BookingPage />
      </BrowserRouter>
    );

    await waitFor(() => expect(screen.getByText(doctorFixtures[0].name)).toBeInTheDocument());
    fireEvent.click(screen.getByText(doctorFixtures[0].name));

    await waitFor(() => expect(screen.getByText("Select Date 15")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Select Date 15"));
    await waitFor(() => expect(screen.getByText(slotFixtures[0])).toBeInTheDocument());
    fireEvent.click(screen.getByText(slotFixtures[0]));

    await waitFor(() => expect(screen.getByText("Submit Booking")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Submit Booking"));

    await waitFor(() => expect(screen.getByText(/¡Cita confirmada!/i)).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText("Primera vez")).toBeInTheDocument());

    // Verify management link
    expect(screen.getByText(mockManagementUrl)).toBeInTheDocument();
    expect(screen.getByText(mockManagementUrl).closest("a")).toHaveAttribute("href", mockManagementUrl);
    expect(screen.getByText(/Usa este enlace para gestionar tu cita/i)).toBeInTheDocument();
  });

  it("should complete the booking flow without visit type selection", async () => {
    (appointmentsAdapter.createBooking as any).mockResolvedValue({ id: "apt-new", type: "Primera vez" });

    render(
      <BrowserRouter>
        <BookingPage />
      </BrowserRouter>
    );

    await waitFor(() => expect(screen.getByText(doctorFixtures[0].name)).toBeInTheDocument());
    fireEvent.click(screen.getByText(doctorFixtures[0].name));

    // Should NOT show visit types, but go directly to slots
    await waitFor(() => expect(screen.getByText("Select Date 15")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Select Date 15"));
    await waitFor(() => expect(screen.getByText(slotFixtures[0])).toBeInTheDocument());
    fireEvent.click(screen.getByText(slotFixtures[0]));

    await waitFor(() => expect(screen.getByText("Submit Booking")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Submit Booking"));

    await waitFor(() => expect(screen.getByText(/¡Cita confirmada!/i)).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText("Primera vez")).toBeInTheDocument());
    expect(appointmentsAdapter.createBooking).toHaveBeenCalled();
  });

  it("should display 'Seguimiento' if returned by API for existing patient", async () => {
    (appointmentsAdapter.createBooking as any).mockResolvedValue({ id: "apt-new", type: "Seguimiento" });

    render(
      <BrowserRouter>
        <BookingPage />
      </BrowserRouter>
    );

    await waitFor(() => expect(screen.getByText(doctorFixtures[0].name)).toBeInTheDocument());
    fireEvent.click(screen.getByText(doctorFixtures[0].name));

    await waitFor(() => expect(screen.getByText("Select Date 15")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Select Date 15"));
    await waitFor(() => expect(screen.getByText(slotFixtures[0])).toBeInTheDocument());
    fireEvent.click(screen.getByText(slotFixtures[0]));

    await waitFor(() => expect(screen.getByText("Submit Booking")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Submit Booking"));

    await waitFor(() => expect(screen.getByText(/¡Cita confirmada!/i)).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText("Seguimiento")).toBeInTheDocument());
  });
});
