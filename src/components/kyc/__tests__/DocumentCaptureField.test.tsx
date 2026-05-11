import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DocumentCaptureField } from "../DocumentCaptureField";
import { kycApi } from "@/services/api";

// Mock kycApi
vi.mock("@/services/api", () => ({
  kycApi: {
    verifyIdentityDocument: vi.fn(),
    uploadDocument: vi.fn().mockResolvedValue({ success: true, data: { url: "ref" } }),
  },
}));

// Mock useIsMobile
vi.mock("@/hooks/use-mobile", () => ({
  useIsMobile: vi.fn(() => false),
}));

// Mock URL methods
global.URL.createObjectURL = vi.fn(() => "mock-url");
global.URL.revokeObjectURL = vi.fn();

describe("DocumentCaptureField", () => {
  const mockFormData = {
    firstName: "John",
    lastName: "Doe",
    documentType: "dni" as const,
    documentNumber: "12345678",
  };
  const mockOnVerified = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders guided steps", () => {
    render(<DocumentCaptureField formData={mockFormData} onVerified={mockOnVerified} />);
    expect(screen.getByText("Frente del Documento")).toBeDefined();
    expect(screen.getByText("Captura la parte frontal de tu identificación oficial.")).toBeDefined();
  });

  it("navigates through steps and calls verifyIdentityDocument", async () => {
    const mockResponse = {
      success: true,
      data: {
        status: "approved",
        confidenceScore: 0.95,
      },
    };
    (kycApi.verifyIdentityDocument as any).mockResolvedValue(mockResponse);

    const { container } = render(<DocumentCaptureField formData={mockFormData} onVerified={mockOnVerified} />);

    const frontFile = new File(["front"], "front.png", { type: "image/png" });
    const backFile = new File(["back"], "back.png", { type: "image/png" });
    const selfieFile = new File(["selfie"], "selfie.png", { type: "image/png" });

    // Step 1: Front
    const fileInput = container.querySelector("input[type='file']") as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [frontFile] } });
    fireEvent.click(screen.getByText("Siguiente"));

    // Step 2: Back
    await waitFor(() => expect(screen.getByText("Dorso del Documento")).toBeDefined());
    fireEvent.change(fileInput, { target: { files: [backFile] } });
    fireEvent.click(screen.getByText("Siguiente"));

    // Step 3: Selfie
    await waitFor(() => expect(screen.getByText("Selfie de Verificación")).toBeDefined());
    fireEvent.change(fileInput, { target: { files: [selfieFile] } });
    fireEvent.click(screen.getByText("Siguiente"));

    // Step 4: Review
    await waitFor(() => expect(screen.getByText("Revisar y Enviar")).toBeDefined());
    fireEvent.click(screen.getByText("Finalizar Verificación"));

    await waitFor(() => {
      expect(kycApi.verifyIdentityDocument).toHaveBeenCalledWith(
        [expect.any(File), expect.any(File)],
        mockFormData,
        expect.any(File)
      );
    }, { timeout: 5000 });

    await waitFor(() => {
      expect(screen.getByText("¡KYC Aprobado!")).toBeDefined();
    });

    expect(mockOnVerified).toHaveBeenCalledWith(mockResponse.data);
  });

  it("shows error message when verification fails", async () => {
    const mockResponse = {
      success: true,
      data: {
        status: "rejected",
        confidenceScore: 0.4,
        error: "La foto está borrosa.",
      },
    };
    (kycApi.verifyIdentityDocument as any).mockResolvedValue(mockResponse);

    const { container } = render(<DocumentCaptureField formData={mockFormData} onVerified={mockOnVerified} />);

    const frontFile = new File(["front"], "front.png", { type: "image/png" });
    const backFile = new File(["back"], "back.png", { type: "image/png" });
    const selfieFile = new File(["selfie"], "selfie.png", { type: "image/png" });

    // Navigate to review step
    const fileInput = container.querySelector("input[type='file']") as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [frontFile] } });
    fireEvent.click(screen.getByText("Siguiente"));

    await waitFor(() => expect(screen.getByText("Dorso del Documento")).toBeDefined());
    fireEvent.change(fileInput, { target: { files: [backFile] } });
    fireEvent.click(screen.getByText("Siguiente"));

    await waitFor(() => expect(screen.getByText("Selfie de Verificación")).toBeDefined());
    fireEvent.change(fileInput, { target: { files: [selfieFile] } });
    fireEvent.click(screen.getByText("Siguiente"));

    await waitFor(() => expect(screen.getByText("Revisar y Enviar")).toBeDefined());
    fireEvent.click(screen.getByText("Finalizar Verificación"));

    await waitFor(() => {
      expect(screen.getByText("La foto está borrosa.")).toBeDefined();
    }, { timeout: 5000 });
  });
});
