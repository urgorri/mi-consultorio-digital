import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DocumentCaptureField } from "../DocumentCaptureField";
import { kycApi } from "@/services/api";

// Mock kycApi
vi.mock("@/services/api", () => ({
  kycApi: {
    verifyIdentityDocument: vi.fn(),
  },
}));

// Mock useIsMobile
vi.mock("@/hooks/use-mobile", () => ({
  useIsMobile: vi.fn(() => false),
}));

describe("DocumentCaptureField", () => {
  const mockFormData = {
    firstName: "John",
    lastName: "Doe",
    documentType: "dni" as const,
    documentNumber: "12345678",
  };
  const mockOnVerified = vi.fn();

  it("renders upload buttons on desktop", () => {
    render(<DocumentCaptureField formData={mockFormData} onVerified={mockOnVerified} />);
    expect(screen.getByText("Frente")).toBeDefined();
    expect(screen.getByText("Dorso")).toBeDefined();
    expect(screen.getAllByText("Subir imagen")).toHaveLength(2);
  });

  it("calls verifyIdentityDocument when both files are uploaded and button is clicked", async () => {
    const mockResponse = {
      success: true,
      data: {
        status: "approved",
        confidenceScore: 0.95,
      },
    };
    (kycApi.verifyIdentityDocument as any).mockResolvedValue(mockResponse);

    render(<DocumentCaptureField formData={mockFormData} onVerified={mockOnVerified} />);

    // Mock file upload
    const frontFile = new File(["front"], "front.png", { type: "image/png" });
    const backFile = new File(["back"], "back.png", { type: "image/png" });

    const frontInput = screen.getByLabelText("Frente") as HTMLInputElement;
    const backInput = screen.getByLabelText("Dorso") as HTMLInputElement;
    fireEvent.change(frontInput, { target: { files: [frontFile] } });
    fireEvent.change(backInput, { target: { files: [backFile] } });

    const verifyButton = screen.getByText("Verificar Documento");
    fireEvent.click(verifyButton);

    await waitFor(() => {
      expect(kycApi.verifyIdentityDocument).toHaveBeenCalledWith(
        [expect.any(File), expect.any(File)],
        mockFormData
      );
    }, { timeout: 3000 });

    await waitFor(() => {
      expect(screen.getByText("Identidad Verificada")).toBeDefined();
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

    render(<DocumentCaptureField formData={mockFormData} onVerified={mockOnVerified} />);

    const frontFile = new File(["front"], "front.png", { type: "image/png" });
    const backFile = new File(["back"], "back.png", { type: "image/png" });

    const frontInput = screen.getByLabelText("Frente") as HTMLInputElement;
    const backInput = screen.getByLabelText("Dorso") as HTMLInputElement;
    fireEvent.change(frontInput, { target: { files: [frontFile] } });
    fireEvent.change(backInput, { target: { files: [backFile] } });

    fireEvent.click(screen.getByText("Verificar Documento"));

    await waitFor(() => {
      expect(screen.getByText("La foto está borrosa.")).toBeDefined();
    }, { timeout: 3000 });
  });
});
