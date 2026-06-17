import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi, describe, it, expect } from "vitest";

// Mock useAuth before importing AdminSidebar
vi.mock("@/shared/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from "@/shared/hooks/useAuth";
import { AdminSidebar } from "../components/AdminSidebar";
import type { Mock } from "vitest";

function makeAuthMock(permissions: string[]) {
  (useAuth as unknown as Mock).mockReturnValue({
    permissions,
    user: { id: "u1", nombre: "Test", email: "test@test.com", roles: [] },
    is_authenticated: true,
    is_loading: false,
    logout: vi.fn(),
  });
}

function renderSidebar() {
  return render(
    <MemoryRouter>
      <AdminSidebar />
    </MemoryRouter>,
  );
}

describe("AdminSidebar", () => {
  // Task 7.2 — ADMIN sees all 3 admin items
  it("ADMIN: renders Estructura, Usuarios, Auditoría in Admin section", () => {
    makeAuthMock([
      "estructura:gestionar",
      "admin:gestionar-usuarios",
      "auditoria:ver",
    ]);
    renderSidebar();

    expect(screen.getByText("Estructura")).toBeInTheDocument();
    expect(screen.getByText("Usuarios")).toBeInTheDocument();
    expect(screen.getByText("Auditoría")).toBeInTheDocument();
    // Should show the section heading
    expect(screen.getByText("Administración")).toBeInTheDocument();
  });

  // ADMIN also with liquidaciones sees both sections
  it("ADMIN+FINANZAS: renders both sections", () => {
    makeAuthMock([
      "estructura:gestionar",
      "admin:gestionar-usuarios",
      "auditoria:ver",
      "liquidaciones:ver",
    ]);
    renderSidebar();

    expect(screen.getByText("Administración")).toBeInTheDocument();
    expect(screen.getByText("Finanzas")).toBeInTheDocument();
    expect(screen.getByText("Liquidaciones")).toBeInTheDocument();
  });

  // Task 7.2 — FINANZAS sees only Finanzas section
  it("FINANZAS puro: renders only Finanzas section, not Admin", () => {
    makeAuthMock(["liquidaciones:ver"]);
    renderSidebar();

    expect(screen.queryByText("Administración")).not.toBeInTheDocument();
    expect(screen.queryByText("Estructura")).not.toBeInTheDocument();
    expect(screen.queryByText("Usuarios")).not.toBeInTheDocument();
    expect(screen.queryByText("Auditoría")).not.toBeInTheDocument();

    expect(screen.getByText("Finanzas")).toBeInTheDocument();
    expect(screen.getByText("Liquidaciones")).toBeInTheDocument();
  });

  // Task 7.2 — COORDINADOR (only auditoria:ver) sees only Auditoría in Admin
  it("COORDINADOR: renders only Auditoría in Admin section, no Estructura or Usuarios", () => {
    makeAuthMock(["auditoria:ver"]);
    renderSidebar();

    expect(screen.getByText("Administración")).toBeInTheDocument();
    expect(screen.getByText("Auditoría")).toBeInTheDocument();
    expect(screen.queryByText("Estructura")).not.toBeInTheDocument();
    expect(screen.queryByText("Usuarios")).not.toBeInTheDocument();
    // No finanzas section
    expect(screen.queryByText("Finanzas")).not.toBeInTheDocument();
  });

  // No permissions — renders nothing
  it("no permissions: renders no sections", () => {
    makeAuthMock([]);
    renderSidebar();

    expect(screen.queryByText("Administración")).not.toBeInTheDocument();
    expect(screen.queryByText("Finanzas")).not.toBeInTheDocument();
  });

  // NavLinks point to correct paths
  it("Estructura NavLink points to /panel/estructura", () => {
    makeAuthMock(["estructura:gestionar"]);
    renderSidebar();

    const link = screen.getByRole("link", { name: "Estructura" });
    expect(link).toHaveAttribute("href", "/panel/estructura");
  });

  it("Liquidaciones NavLink points to /panel/finanzas/liquidaciones", () => {
    makeAuthMock(["liquidaciones:ver"]);
    renderSidebar();

    const link = screen.getByRole("link", { name: "Liquidaciones" });
    expect(link).toHaveAttribute("href", "/panel/finanzas/liquidaciones");
  });
});
