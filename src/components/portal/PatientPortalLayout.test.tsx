import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import PatientPortalLayout from "./PatientPortalLayout";
import { BrowserRouter } from "react-router-dom";
import * as router from "react-router";

import { useAuth } from "@/contexts/AuthContext";

// Mock useAuth to control user state
vi.mock("@/contexts/AuthContext", async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

const navigate = vi.fn();

describe("PatientPortalLayout Logout", () => {
  it("should redirect to /login/paciente on logout", async () => {
    (useAuth as any).mockReturnValue({
      user: { firstName: "John", lastName: "Doe", role: "paciente" },
      logout: vi.fn(),
      isLoading: false,
    });
    vi.spyOn(router, "useNavigate").mockImplementation(() => navigate);

    render(
      <BrowserRouter>
        <PatientPortalLayout>
          <div>Content</div>
        </PatientPortalLayout>
      </BrowserRouter>
    );

    // Desktop logout button is the one with LogOut icon
    const logoutButtons = screen.getAllByRole("button");
    const logoutButton = logoutButtons.find(b => b.querySelector("svg.lucide-log-out"));

    if (logoutButton) {
        fireEvent.click(logoutButton);
        expect(navigate).toHaveBeenCalledWith("/login/paciente");
    } else {
        const mobileLogout = screen.getByText(/Cerrar sesión/i);
        fireEvent.click(mobileLogout);
        expect(navigate).toHaveBeenCalledWith("/login/paciente");
    }
  });
});
