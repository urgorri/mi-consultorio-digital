import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SlotSelector } from "./SlotSelector";

describe("SlotSelector", () => {
  const onDateSelect = vi.fn();
  const onTimeSelect = vi.fn();
  const availableSlots = ["09:00", "10:00"];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    // Set fixed date to 2024-05-15
    vi.setSystemTime(new Date(2024, 4, 15));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should render current month by default", () => {
    render(
      <SlotSelector
        selectedDate=""
        selectedTime=""
        onDateSelect={onDateSelect}
        onTimeSelect={onTimeSelect}
        availableSlots={availableSlots}
      />
    );

    expect(screen.getByText(/mayo/i)).toBeInTheDocument();
    expect(screen.getByText(/2024/i)).toBeInTheDocument();
  });

  it("should navigate to next month", () => {
    render(
      <SlotSelector
        selectedDate=""
        selectedTime=""
        onDateSelect={onDateSelect}
        onTimeSelect={onTimeSelect}
        availableSlots={availableSlots}
      />
    );

    const nextButton = screen.getByTitle(/mes siguiente/i);
    fireEvent.click(nextButton);

    expect(screen.getByText(/junio/i)).toBeInTheDocument();
    expect(screen.getByText(/2024/i)).toBeInTheDocument();
  });

  it("should navigate back and forth and maintain year transitions", () => {
    // Start in December 2024
    vi.setSystemTime(new Date(2024, 11, 15));

    render(
      <SlotSelector
        selectedDate=""
        selectedTime=""
        onDateSelect={onDateSelect}
        onTimeSelect={onTimeSelect}
        availableSlots={availableSlots}
      />
    );

    expect(screen.getByText(/diciembre/i)).toBeInTheDocument();
    expect(screen.getByText(/2024/i)).toBeInTheDocument();

    const nextButton = screen.getByTitle(/mes siguiente/i);
    fireEvent.click(nextButton);

    expect(screen.getByText(/enero/i)).toBeInTheDocument();
    expect(screen.getByText(/2025/i)).toBeInTheDocument();

    const prevButton = screen.getByTitle(/mes anterior/i);
    fireEvent.click(prevButton);

    expect(screen.getByText(/diciembre/i)).toBeInTheDocument();
    expect(screen.getByText(/2024/i)).toBeInTheDocument();
  });

  it("should return correct ISO string on date selection", () => {
    render(
      <SlotSelector
        selectedDate=""
        selectedTime=""
        onDateSelect={onDateSelect}
        onTimeSelect={onTimeSelect}
        availableSlots={availableSlots}
      />
    );

    // May 20th 2024
    const day20 = screen.getByText("20");
    fireEvent.click(day20);

    expect(onDateSelect).toHaveBeenCalledWith("2024-05-20");
  });

  it("should disable previous month button if at current month", () => {
    render(
      <SlotSelector
        selectedDate=""
        selectedTime=""
        onDateSelect={onDateSelect}
        onTimeSelect={onTimeSelect}
        availableSlots={availableSlots}
      />
    );

    const prevButton = screen.getByTitle(/mes anterior/i);
    expect(prevButton).toBeDisabled();
  });

  it("should handle navigation to a different month and select a date there", () => {
    render(
      <SlotSelector
        selectedDate=""
        selectedTime=""
        onDateSelect={onDateSelect}
        onTimeSelect={onTimeSelect}
        availableSlots={availableSlots}
      />
    );

    const nextButton = screen.getByTitle(/mes siguiente/i);
    fireEvent.click(nextButton); // June 2024

    const day10 = screen.getByText("10");
    fireEvent.click(day10);

    expect(onDateSelect).toHaveBeenCalledWith("2024-06-10");
  });
});
