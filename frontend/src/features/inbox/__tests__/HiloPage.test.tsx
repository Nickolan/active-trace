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

import { useHilo, useResponderHilo } from "@/features/inbox/hooks/useInbox";
import { useAuth } from "@/shared/hooks/useAuth";
import { HiloPage } from "@/features/inbox/pages/HiloPage";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const USER_ID = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
const OTHER_ID = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";
const HILO_ID = "11111111-1111-1111-1111-111111111111";

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[`/inbox/${HILO_ID}`]}>
        <Routes>
          <Route path="/inbox/:hiloId" element={<HiloPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const mockHilo = {
  id: HILO_ID,
  tenant_id: "t1",
  asunto: "Consulta sobre guardia",
  usuario_a_id: USER_ID,
  usuario_b_id: OTHER_ID,
  mensajes: [
    {
      id: "msg-1",
      hilo_id: HILO_ID,
      autor_id: USER_ID,
      cuerpo: "Hola, ¿podés cubrir mi guardia?",
      creado_at: "2026-06-01T10:00:00Z",
    },
    {
      id: "msg-2",
      hilo_id: HILO_ID,
      autor_id: OTHER_ID,
      cuerpo: "Sí, sin problema.",
      creado_at: "2026-06-01T10:05:00Z",
    },
  ],
  created_at: "2026-06-01T10:00:00Z",
};

beforeEach(() => {
  vi.clearAllMocks();
  (useAuth as unknown as Mock).mockReturnValue({
    user: { id: USER_ID, nombre: "Test User" },
    logout: vi.fn(),
  });
  (useResponderHilo as unknown as Mock).mockReturnValue({
    mutateAsync: vi.fn().mockResolvedValue({}),
    isPending: false,
    isError: false,
    error: null,
  });
});

afterEach(cleanup);

describe("HiloPage", () => {
  it("muestra LoadingSpinner cuando isLoading = true", () => {
    (useHilo as unknown as Mock).mockReturnValue({
      data: null,
      isLoading: true,
      isError: false,
      error: null,
    });
    renderPage();
    // No hay asunto visible
    expect(screen.queryByText("Consulta sobre guardia")).not.toBeInTheDocument();
  });

  it("renderiza los mensajes del hilo cuando hay datos", () => {
    (useHilo as unknown as Mock).mockReturnValue({
      data: mockHilo,
      isLoading: false,
      isError: false,
      error: null,
    });
    renderPage();
    expect(screen.getByText("Hola, ¿podés cubrir mi guardia?")).toBeInTheDocument();
    expect(screen.getByText("Sí, sin problema.")).toBeInTheDocument();
  });

  it("mensajes propios tienen data-testid 'burbuja-propia'", () => {
    (useHilo as unknown as Mock).mockReturnValue({
      data: mockHilo,
      isLoading: false,
      isError: false,
      error: null,
    });
    renderPage();
    const propias = screen.getAllByTestId("burbuja-propia");
    expect(propias).toHaveLength(1);
    expect(propias[0]).toHaveTextContent("Hola, ¿podés cubrir mi guardia?");
  });

  it("mensajes ajenos tienen data-testid 'burbuja-ajena'", () => {
    (useHilo as unknown as Mock).mockReturnValue({
      data: mockHilo,
      isLoading: false,
      isError: false,
      error: null,
    });
    renderPage();
    const ajenas = screen.getAllByTestId("burbuja-ajena");
    expect(ajenas).toHaveLength(1);
    expect(ajenas[0]).toHaveTextContent("Sí, sin problema.");
  });

  it("botón 'Enviar' está deshabilitado cuando el textarea está vacío", () => {
    (useHilo as unknown as Mock).mockReturnValue({
      data: mockHilo,
      isLoading: false,
      isError: false,
      error: null,
    });
    renderPage();
    const enviar = screen.getByRole("button", { name: /enviar/i });
    expect(enviar).toBeDisabled();
  });

  it("triangulate — envío exitoso vacía el textarea", async () => {
    const mockMutate = vi.fn().mockResolvedValue({});
    (useResponderHilo as unknown as Mock).mockReturnValue({
      mutateAsync: mockMutate,
      isPending: false,
      isError: false,
      error: null,
    });
    (useHilo as unknown as Mock).mockReturnValue({
      data: mockHilo,
      isLoading: false,
      isError: false,
      error: null,
    });

    const user = userEvent.setup();
    renderPage();

    const textarea = screen.getByPlaceholderText("Escribí tu respuesta…");
    await user.type(textarea, "Mi respuesta de prueba");
    expect(textarea).toHaveValue("Mi respuesta de prueba");

    await user.click(screen.getByRole("button", { name: /enviar/i }));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({ cuerpo: "Mi respuesta de prueba" });
    });

    await waitFor(() => {
      expect(textarea).toHaveValue("");
    });
  });
});
