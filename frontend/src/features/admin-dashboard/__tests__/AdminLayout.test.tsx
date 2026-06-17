/**
 * Task 7.4 — Guard de ruta: acceso directo con permisos insuficientes → 403
 * Task 7.5 — Redirects de compatibilidad: rutas planas → /panel/*
 * Task 7.6 — Smoke test: usuario sin permisos de panel en /panel → 403
 */
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route, Navigate } from "react-router-dom";
import { vi, describe, it, expect } from "vitest";

vi.mock("@/shared/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from "@/shared/hooks/useAuth";
import { AdminLayout } from "../components/AdminLayout";
import { AdminPanelIndex } from "../components/AdminPanelIndex";
import { RequirePermission } from "@/features/auth/components/RequirePermission";
import type { Mock } from "vitest";

// ── helpers ──────────────────────────────────────────────────────────────────

function makeAuthMock(permissions: string[]) {
  (useAuth as unknown as Mock).mockReturnValue({
    permissions,
    user: { id: "u1", nombre: "Test", email: "test@test.com", roles: [] },
    is_authenticated: true,
    is_loading: false,
    logout: vi.fn(),
  });
}

/**
 * Minimal router that reproduces the /panel route structure:
 *   /panel  → AdminLayout
 *     /     → AdminPanelIndex
 *     /usuarios → RequirePermission(admin:gestionar-usuarios) + placeholder
 *     /estructura/carreras → RequirePermission(estructura:gestionar) + placeholder
 *     /auditoria → RequirePermission(auditoria:ver) + placeholder
 *
 * Also includes legacy redirect routes for task 7.5.
 */
function TestPanelRoutes({ initialPath }: { initialPath: string }) {
  return (
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="panel" element={<AdminLayout />}>
          <Route index element={<AdminPanelIndex />} />
          <Route
            path="usuarios"
            element={
              <RequirePermission permission="admin:gestionar-usuarios">
                <div data-testid="usuarios-page">Usuarios</div>
              </RequirePermission>
            }
          />
          <Route
            path="estructura/carreras"
            element={
              <RequirePermission permission="estructura:gestionar">
                <div data-testid="carreras-page">Carreras</div>
              </RequirePermission>
            }
          />
          <Route
            path="auditoria"
            element={
              <RequirePermission permission="auditoria:ver">
                <div data-testid="auditoria-page">Auditoría</div>
              </RequirePermission>
            }
          />
          <Route
            path="finanzas/liquidaciones"
            element={
              <RequirePermission permission="liquidaciones:ver">
                <div data-testid="liquidaciones-page">Liquidaciones</div>
              </RequirePermission>
            }
          />
        </Route>

        {/* Legacy redirect routes — task 7.5 */}
        <Route
          path="liquidaciones"
          element={<Navigate to="/panel/finanzas/liquidaciones" replace />}
        />
        <Route
          path="estructura/carreras"
          element={<Navigate to="/panel/estructura/carreras" replace />}
        />
        <Route
          path="usuarios"
          element={<Navigate to="/panel/usuarios" replace />}
        />
        <Route
          path="auditoria"
          element={<Navigate to="/panel/auditoria" replace />}
        />
      </Routes>
    </MemoryRouter>
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("AdminLayout — entry guard (Task 7.6)", () => {
  it("user with NO panel permissions entering /panel sees 403", () => {
    makeAuthMock([]);
    render(<TestPanelRoutes initialPath="/panel" />);
    expect(screen.getByText("403")).toBeInTheDocument();
  });

  it("user with a panel permission entering /panel does NOT see 403 from AdminLayout", () => {
    makeAuthMock(["auditoria:ver"]);
    render(<TestPanelRoutes initialPath="/panel/auditoria" />);
    // AdminLayout renders — 403 NOT from layout (may come from RequirePermission for a
    // different route, but NOT from AdminLayout guard)
    expect(screen.queryByText("No tenés permisos para acceder al panel de administración.")).not.toBeInTheDocument();
  });
});

describe("AdminLayout — per-route guards (Task 7.4)", () => {
  it("user with only auditoria:ver accessing /panel/usuarios sees 403", () => {
    makeAuthMock(["auditoria:ver"]);
    render(<TestPanelRoutes initialPath="/panel/usuarios" />);
    // The RequirePermission for usuarios should show 403
    expect(screen.getByText("403")).toBeInTheDocument();
    expect(screen.queryByTestId("usuarios-page")).not.toBeInTheDocument();
  });

  it("user without estructura:gestionar accessing /panel/estructura/carreras sees 403", () => {
    makeAuthMock(["auditoria:ver"]);
    render(<TestPanelRoutes initialPath="/panel/estructura/carreras" />);
    expect(screen.getByText("403")).toBeInTheDocument();
    expect(screen.queryByTestId("carreras-page")).not.toBeInTheDocument();
  });

  it("user with estructura:gestionar can access /panel/estructura/carreras", () => {
    makeAuthMock(["estructura:gestionar"]);
    render(<TestPanelRoutes initialPath="/panel/estructura/carreras" />);
    expect(screen.getByTestId("carreras-page")).toBeInTheDocument();
  });
});

describe("AdminPanelIndex — redirect to first accessible section", () => {
  it("user with auditoria:ver is redirected to /panel/auditoria", () => {
    makeAuthMock(["auditoria:ver"]);
    render(<TestPanelRoutes initialPath="/panel" />);
    // The redirect lands on /panel/auditoria, which renders the auditoria page
    expect(screen.getByTestId("auditoria-page")).toBeInTheDocument();
  });

  it("user with only liquidaciones:ver is redirected to /panel/finanzas/liquidaciones", () => {
    makeAuthMock(["liquidaciones:ver"]);
    render(<TestPanelRoutes initialPath="/panel" />);
    expect(screen.getByTestId("liquidaciones-page")).toBeInTheDocument();
  });
});

describe("Legacy redirect routes (Task 7.5)", () => {
  it("/liquidaciones redirects to /panel/finanzas/liquidaciones", () => {
    makeAuthMock(["liquidaciones:ver"]);
    render(<TestPanelRoutes initialPath="/liquidaciones" />);
    expect(screen.getByTestId("liquidaciones-page")).toBeInTheDocument();
  });

  it("/estructura/carreras redirects to /panel/estructura/carreras", () => {
    makeAuthMock(["estructura:gestionar"]);
    render(<TestPanelRoutes initialPath="/estructura/carreras" />);
    expect(screen.getByTestId("carreras-page")).toBeInTheDocument();
  });

  it("/usuarios redirects to /panel/usuarios", () => {
    makeAuthMock(["admin:gestionar-usuarios"]);
    render(<TestPanelRoutes initialPath="/usuarios" />);
    expect(screen.getByTestId("usuarios-page")).toBeInTheDocument();
  });

  it("/auditoria redirects to /panel/auditoria", () => {
    makeAuthMock(["auditoria:ver"]);
    render(<TestPanelRoutes initialPath="/auditoria" />);
    expect(screen.getByTestId("auditoria-page")).toBeInTheDocument();
  });
});
