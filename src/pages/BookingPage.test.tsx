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
      <button onClick={() => onDateSelect("15")}>Select Date 15</button>
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

  it("should complete the booking flow", async () => {
    render(
      <BrowserRouter>
        <BookingPage />
      </BrowserRouter>
    );

    await waitFor(() => expect(screen.getByText(doctorFixtures[0].name)).toBeInTheDocument());
    fireEvent.click(screen.getByText(doctorFixtures[0].name));

    await waitFor(() => expect(screen.getByText(visitTypeFixtures[0].name)).toBeInTheDocument());
    fireEvent.click(screen.getByText(visitTypeFixtures[0].name));

    await waitFor(() => expect(screen.getByText("Select Date 15")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Select Date 15"));
    await waitFor(() => expect(screen.getByText(slotFixtures[0])).toBeInTheDocument());
    fireEvent.click(screen.getByText(slotFixtures[0]));

    await waitFor(() => expect(screen.getByText("Submit Booking")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Submit Booking"));

    await waitFor(() => expect(screen.getByText(/¡Cita confirmada!/i)).toBeInTheDocument());
    expect(appointmentsAdapter.createBooking).toHaveBeenCalled();
  });
});
