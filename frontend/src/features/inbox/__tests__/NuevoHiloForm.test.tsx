import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import type { Mock } from "vitest";

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock("@/features/inbox/hooks/useInbox", () => ({
  useInbox: vi.fn(),
  useHilo: vi.fn(),
  useResponderHilo: vi.fn(),
  useCrearHilo: vi.fn(),
}));

vi.mock("@/shared/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

// Mock the api call for usuarios disponibles
vi.mock("@tanstack/react-query", async () => {
  const actual = await vi.importActual<typeof import("@tanstack/react-query")>(
    "@tanstack/react-query",
  );
  return {
    ...actual,
    useQuery: vi.fn(),
  };
});

import { useCrearHilo } from "@/features/inbox/hooks/useInbox";
import { useAuth } from "@/shared/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { NuevoHiloForm } from "@/features/inbox/components/NuevoHiloForm";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const USER_ID = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
const OTHER_ID = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";

const mockUsuarios = [
  { id: USER_ID, nombre: "Juan", apellidos: "Pérez" },
  { id: OTHER_ID, nombre: "Ana", apellidos: "García" },
];

function renderForm() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={["/inbox/nuevo"]}>
        <Routes>
          <Route path="/inbox/nuevo" element={<NuevoHiloForm />} />
          <Route path="/inbox/:id" element={<div>Hilo page</div>} />
          <Route path="/inbox" element={<div>Inbox page</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  (useAuth as unknown as Mock).mockReturnValue({
    user: { id: USER_ID, nombre: "Juan" },
    logout: vi.fn(),
  });
  (useCrearHilo as unknown as Mock).mockReturnValue({
    mutateAsync: vi.fn().mockResolvedValue({
      id: "new-hilo-id",
      asunto: "Test",
      usuario_a_id: USER_ID,
      usuario_b_id: OTHER_ID,
      mensajes: [],
    }),
    isPending: false,
    isError: false,
    error: null,
  });
  (useQuery as unknown as Mock).mockReturnValue({
    data: mockUsuarios,
    isLoading: false,
    isError: false,
    error: null,
  });
});

afterEach(cleanup);

describe("NuevoHiloForm", () => {
  it("intento de enviar sin destinatario muestra error Zod inline", async () => {
    const mockCrear = vi.fn();
    (useCrearHilo as unknown as Mock).mockReturnValue({
      mutateAsync: mockCrear,
      isPending: false,
      isError: false,
      error: null,
    });

    const user = userEvent.setup();
    renderForm();

    // Fill asunto and cuerpo but NOT destinatario
    await user.type(screen.getByLabelText("Asunto"), "Mi asunto");
    await user.type(screen.getByLabelText("Mensaje"), "Mi cuerpo");

    await user.click(screen.getByRole("button", { name: /enviar/i }));

    await waitFor(() => {
      const alerts = screen.getAllByRole("alert");
      expect(alerts.length).toBeGreaterThan(0);
    });
    expect(mockCrear).not.toHaveBeenCalled();
  });

  it("intento de enviar sin asunto muestra error Zod inline", async () => {
    const mockCrear = vi.fn();
    (useCrearHilo as unknown as Mock).mockReturnValue({
      mutateAsync: mockCrear,
      isPending: false,
      isError: false,
      error: null,
    });

    const user = userEvent.setup();
    renderForm();

    // Select destinatario (not self) and fill cuerpo but NOT asunto
    const select = screen.getByLabelText("Destinatario");
    await user.selectOptions(select, OTHER_ID);
    await user.type(screen.getByLabelText("Mensaje"), "Mi cuerpo");

    await user.click(screen.getByRole("button", { name: /enviar/i }));

    await waitFor(() => {
      const alerts = screen.getAllByRole("alert");
      expect(alerts.length).toBeGreaterThan(0);
    });
    expect(mockCrear).not.toHaveBeenCalled();
  });

  it("triangulate — envío exitoso navega a /inbox/:nuevaId", async () => {
    const mockCrear = vi.fn().mockResolvedValue({
      id: "new-hilo-id",
      asunto: "Test",
      usuario_a_id: USER_ID,
      usuario_b_id: OTHER_ID,
      mensajes: [],
    });
    (useCrearHilo as unknown as Mock).mockReturnValue({
      mutateAsync: mockCrear,
      isPending: false,
      isError: false,
      error: null,
    });

    const user = userEvent.setup();
    renderForm();

    const select = screen.getByLabelText("Destinatario");
    await user.selectOptions(select, OTHER_ID);
    await user.type(screen.getByLabelText("Asunto"), "Mi asunto de prueba");
    await user.type(screen.getByLabelText("Mensaje"), "Mi cuerpo de prueba");

    await user.click(screen.getByRole("button", { name: /enviar/i }));

    await waitFor(() => {
      expect(mockCrear).toHaveBeenCalledWith({
        destinatario_id: OTHER_ID,
        asunto: "Mi asunto de prueba",
        cuerpo: "Mi cuerpo de prueba",
      });
    });

    // After success, should navigate to hilo page
    await waitFor(() => {
      expect(screen.getByText("Hilo page")).toBeInTheDocument();
    });
  });
});
