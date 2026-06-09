import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import type { Mock } from "vitest";

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock("@/features/perfil/hooks/usePerfil", () => ({
  usePerfil: vi.fn(),
  useUpdatePerfil: vi.fn(),
}));

vi.mock("@/shared/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

import { usePerfil, useUpdatePerfil } from "@/features/perfil/hooks/usePerfil";
import { useAuth } from "@/shared/hooks/useAuth";
import { PerfilPage } from "@/features/perfil/pages/PerfilPage";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <PerfilPage />
      </BrowserRouter>
    </QueryClientProvider>,
  );
}

const mockPerfil = {
  id: "11111111-1111-1111-1111-111111111111",
  tenant_id: "22222222-2222-2222-2222-222222222222",
  nombre: "Juan",
  apellidos: "Pérez",
  email: "j***@example.com",
  dni: "**1234",
  cuil: "20-**1234-5",
  banco: "Santander",
  cbu: "***34567890",
  alias_cbu: "**ALIAS",
  regional: "Buenos Aires",
  legajo_profesional: "LP-001",
  facturador: "No",
  estado: "Activo",
};

beforeEach(() => {
  vi.clearAllMocks();
  (useAuth as unknown as Mock).mockReturnValue({
    user: { id: "user-1", nombre: "Juan" },
    logout: vi.fn().mockResolvedValue(undefined),
  });
  (useUpdatePerfil as unknown as Mock).mockReturnValue({
    mutateAsync: vi.fn().mockResolvedValue(mockPerfil),
    isPending: false,
    isError: false,
    error: null,
  });
});

afterEach(cleanup);

// ─── Tests: Vista de solo lectura (8.1) ───────────────────────────────────────

describe("PerfilPage — vista de solo lectura", () => {
  it("muestra LoadingSpinner cuando isLoading = true", () => {
    (usePerfil as unknown as Mock).mockReturnValue({
      data: null,
      isLoading: true,
      isError: false,
      error: null,
    });
    renderPage();
    // No hay contenido de perfil
    expect(screen.queryByText("Mi Perfil")).not.toBeInTheDocument();
  });

  it("muestra ErrorMessage cuando isError = true", () => {
    (usePerfil as unknown as Mock).mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
      error: new Error("Error de red"),
    });
    renderPage();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("renderiza los campos del perfil cuando hay datos", () => {
    (usePerfil as unknown as Mock).mockReturnValue({
      data: mockPerfil,
      isLoading: false,
      isError: false,
      error: null,
    });
    renderPage();
    expect(screen.getByText("Mi Perfil")).toBeInTheDocument();
    expect(screen.getByText("Juan")).toBeInTheDocument();
    expect(screen.getByText("Pérez")).toBeInTheDocument();
    expect(screen.getByText("Activo")).toBeInTheDocument();
  });

  it("los campos PII se muestran como texto estático, no como inputs editables", () => {
    (usePerfil as unknown as Mock).mockReturnValue({
      data: mockPerfil,
      isLoading: false,
      isError: false,
      error: null,
    });
    renderPage();
    // El CUIL aparece como texto
    expect(screen.getByText("20-**1234-5")).toBeInTheDocument();
    // No hay un input de cuil
    expect(screen.queryByLabelText(/cuil/i)).not.toBeInTheDocument();
  });

  it("triangulate — también renderiza con datos mínimos (nombre/apellidos/estado)", () => {
    (usePerfil as unknown as Mock).mockReturnValue({
      data: {
        id: "33333333-3333-3333-3333-333333333333",
        tenant_id: "44444444-4444-4444-4444-444444444444",
        nombre: "Ana",
        apellidos: "García",
        estado: "Inactivo",
      },
      isLoading: false,
      isError: false,
      error: null,
    });
    renderPage();
    expect(screen.getByText("Ana")).toBeInTheDocument();
    expect(screen.getByText("García")).toBeInTheDocument();
    expect(screen.getByText("Inactivo")).toBeInTheDocument();
  });
});

// ─── Tests: Formulario de edición (8.2) ──────────────────────────────────────

describe("PerfilPage — formulario de edición", () => {
  beforeEach(() => {
    (usePerfil as unknown as Mock).mockReturnValue({
      data: mockPerfil,
      isLoading: false,
      isError: false,
      error: null,
    });
  });

  it("clic en 'Editar perfil' muestra el formulario", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByText("Editar perfil"));
    expect(screen.getByLabelText("Nombre")).toBeInTheDocument();
    expect(screen.getByLabelText("Apellidos")).toBeInTheDocument();
  });

  it("el campo CUIL NO aparece como input en el formulario", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByText("Editar perfil"));
    // CUIL es texto estático, no input
    expect(screen.queryByLabelText(/^cuil/i)).not.toBeInTheDocument();
    // Pero sigue visible como texto
    expect(screen.getByText("20-**1234-5")).toBeInTheDocument();
  });

  it("botón 'Cancelar' cierra el formulario sin llamar a updatePerfil", async () => {
    const mockMutateAsync = vi.fn();
    (useUpdatePerfil as unknown as Mock).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
      isError: false,
      error: null,
    });

    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByText("Editar perfil"));
    expect(screen.getByLabelText("Nombre")).toBeInTheDocument();

    await user.click(screen.getByText("Cancelar"));
    expect(screen.queryByLabelText("Nombre")).not.toBeInTheDocument();
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it("envío exitoso cierra el formulario", async () => {
    const mockMutateAsync = vi.fn().mockResolvedValue(mockPerfil);
    // Set BEFORE render so the component picks it up from the start
    (useUpdatePerfil as unknown as Mock).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
      isError: false,
      error: null,
    });

    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByText("Editar perfil"));

    // Form is now open
    expect(screen.getByLabelText("Nombre")).toBeInTheDocument();

    // Submit without modifying any fields (nombre/apellidos are pre-populated)
    await user.click(screen.getByText("Guardar"));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalled();
    });
    // After success, form should be closed (edit mode off)
    await waitFor(() => {
      expect(screen.queryByLabelText("Nombre")).not.toBeInTheDocument();
    });
  });

  it("triangulate — nombre vacío muestra error inline y no llama a updatePerfil", async () => {
    const mockMutateAsync = vi.fn();
    // Set BEFORE render
    (useUpdatePerfil as unknown as Mock).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
      isError: false,
      error: null,
    });

    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByText("Editar perfil"));

    // Clear nombre (which was pre-populated with "Juan") to trigger min(1) error
    const nombreInput = screen.getByLabelText("Nombre");
    await user.clear(nombreInput);
    // nombre is now "" which should fail z.string().min(1) validation
    await user.click(screen.getByText("Guardar"));

    await waitFor(() => {
      // FormField renders error with role="alert"
      const alerts = screen.getAllByRole("alert");
      expect(alerts.length).toBeGreaterThan(0);
    });
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });
});
