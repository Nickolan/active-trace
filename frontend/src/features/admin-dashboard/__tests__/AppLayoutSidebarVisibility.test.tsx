/**
 * Task 7.3 — Test that ALUMNO / PROFESOR / TUTOR do NOT see "Panel de Administración"
 * or "Finanzas" in the AppLayout sidebar.
 */
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi, describe, it, expect } from "vitest";

vi.mock("@/shared/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from "@/shared/hooks/useAuth";
import { AppLayout } from "@/features/auth/components/AppLayout";
import type { Mock } from "vitest";

function makeAuthMock(permissions: string[], roles: string[] = []) {
  (useAuth as unknown as Mock).mockReturnValue({
    permissions,
    user: {
      id: "u1",
      nombre: "Test",
      email: "test@test.com",
      roles,
    },
    is_authenticated: true,
    is_loading: false,
    logout: vi.fn(),
  });
}

function renderAppLayout(permissions: string[], roles: string[] = []) {
  makeAuthMock(permissions, roles);
  return render(
    <MemoryRouter>
      <AppLayout />
    </MemoryRouter>,
  );
}

describe("AppLayout sidebar — panel entries visibility", () => {
  it("ALUMNO (no permissions) does NOT see Panel de Administración", () => {
    renderAppLayout([], ["ALUMNO"]);
    expect(screen.queryByText("Panel de Administración")).not.toBeInTheDocument();
    expect(screen.queryByText("Finanzas")).not.toBeInTheDocument();
  });

  it("PROFESOR (no panel permissions) does NOT see Panel entries", () => {
    renderAppLayout(["calificaciones:importar", "atrasados:ver"], ["PROFESOR"]);
    expect(screen.queryByText("Panel de Administración")).not.toBeInTheDocument();
    expect(screen.queryByText("Finanzas")).not.toBeInTheDocument();
  });

  it("TUTOR (no panel permissions) does NOT see Panel entries", () => {
    renderAppLayout([], ["TUTOR"]);
    expect(screen.queryByText("Panel de Administración")).not.toBeInTheDocument();
    expect(screen.queryByText("Finanzas")).not.toBeInTheDocument();
  });

  it("ADMIN (estructura:gestionar) SEES Panel de Administración", () => {
    renderAppLayout(["estructura:gestionar"], ["ADMIN"]);
    expect(screen.getByText("Panel de Administración")).toBeInTheDocument();
  });

  it("FINANZAS (liquidaciones:ver) SEES Finanzas but NOT Panel de Administración", () => {
    renderAppLayout(["liquidaciones:ver"], ["FINANZAS"]);
    expect(screen.getByText("Finanzas")).toBeInTheDocument();
    expect(screen.queryByText("Panel de Administración")).not.toBeInTheDocument();
  });

  it("COORDINADOR (auditoria:ver) SEES Panel de Administración", () => {
    renderAppLayout(["auditoria:ver"], ["COORDINADOR"]);
    expect(screen.getByText("Panel de Administración")).toBeInTheDocument();
  });
});
