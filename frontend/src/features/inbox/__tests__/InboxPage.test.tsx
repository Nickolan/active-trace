import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
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

import { useInbox } from "@/features/inbox/hooks/useInbox";
import { useAuth } from "@/shared/hooks/useAuth";
import { InboxPage } from "@/features/inbox/pages/InboxPage";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <InboxPage />
      </BrowserRouter>
    </QueryClientProvider>,
  );
}

const USER_ID = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";

const mockHilos = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    tenant_id: "t1",
    asunto: "Consulta sobre guardia",
    usuario_a_id: USER_ID,
    usuario_b_id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    tiene_no_leidos: true,
    created_at: "2026-06-01T10:00:00Z",
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    tenant_id: "t1",
    asunto: "Reunión de equipo",
    usuario_a_id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
    usuario_b_id: USER_ID,
    tiene_no_leidos: false,
    created_at: "2026-06-02T10:00:00Z",
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  (useAuth as unknown as Mock).mockReturnValue({
    user: { id: USER_ID, nombre: "Test User" },
    logout: vi.fn(),
  });
});

afterEach(cleanup);

describe("InboxPage", () => {
  it("muestra LoadingSpinner cuando isLoading = true", () => {
    (useInbox as unknown as Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    });
    renderPage();
    expect(screen.queryByText("Mensajes")).not.toBeInTheDocument();
  });

  it("renderiza la lista de hilos cuando hay datos", () => {
    (useInbox as unknown as Mock).mockReturnValue({
      data: mockHilos,
      isLoading: false,
      isError: false,
      error: null,
    });
    renderPage();
    expect(screen.getByText("Consulta sobre guardia")).toBeInTheDocument();
    expect(screen.getByText("Reunión de equipo")).toBeInTheDocument();
  });

  it("muestra estado vacío cuando data = []", () => {
    (useInbox as unknown as Mock).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    });
    renderPage();
    expect(screen.getByText("No tenés mensajes todavía.")).toBeInTheDocument();
  });

  it("hilos con tiene_no_leidos = true muestran badge de no leídos", () => {
    (useInbox as unknown as Mock).mockReturnValue({
      data: mockHilos,
      isLoading: false,
      isError: false,
      error: null,
    });
    renderPage();
    const badges = screen.getAllByTestId("badge-no-leidos");
    expect(badges).toHaveLength(1); // Solo el primer hilo tiene no leídos
  });

  it("triangulate — hilos sin no leídos NO muestran badge", () => {
    (useInbox as unknown as Mock).mockReturnValue({
      data: [mockHilos[1]], // Solo el segundo (tiene_no_leidos = false)
      isLoading: false,
      isError: false,
      error: null,
    });
    renderPage();
    expect(screen.queryByTestId("badge-no-leidos")).not.toBeInTheDocument();
    expect(screen.getByText("Reunión de equipo")).toBeInTheDocument();
  });
});
