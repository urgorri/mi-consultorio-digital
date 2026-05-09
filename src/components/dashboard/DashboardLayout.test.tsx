import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DashboardLayout from "./DashboardLayout";
import { BrowserRouter } from "react-router-dom";
import * as router from "react-router";

// Mock useAuth to control user state
vi.mock("@/contexts/AuthContext", async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    useAuth: () => ({
      user: { firstName: "Jane", lastName: "Smith", role: "profesional", email: "jane@example.com" },
      logout: vi.fn(),
      isLoading: false,
    }),
  };
});

// Mock child components
vi.mock("./NotificationsDropdown", () => ({
  default: () => <div data-testid="notifications-dropdown" />
}));
vi.mock("./ClinicFilterDropdown", () => ({
  default: () => <div data-testid="clinic-filter-dropdown" />
}));

// Mock Dropdown components
vi.mock("@/components/ui/dropdown-menu", async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    DropdownMenu: ({ children }: any) => <div>{children}</div>,
    DropdownMenuTrigger: ({ children }: any) => <div>{children}</div>,
    DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
    DropdownMenuItem: ({ children, onClick }: any) => (
      <div onClick={onClick}>{children}</div>
    ),
  };
});

const navigate = vi.fn();

describe("DashboardLayout Logout", () => {
  it("should redirect to /login/profesional on logout", async () => {
    vi.spyOn(router, "useNavigate").mockImplementation(() => navigate);

    render(
      <BrowserRouter>
        <DashboardLayout>
          <div>Content</div>
        </DashboardLayout>
      </BrowserRouter>
    );

    const logoutItem = screen.getByText(/Cerrar sesión/i);
    fireEvent.click(logoutItem);

    expect(navigate).toHaveBeenCalledWith("/login/profesional");
  });
});
