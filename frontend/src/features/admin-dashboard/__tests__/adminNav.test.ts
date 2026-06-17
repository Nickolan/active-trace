import { describe, it, expect } from "vitest";
import { getFirstAccessiblePanelPath } from "../config/adminNav";

describe("getFirstAccessiblePanelPath", () => {
  it("returns null when user has no panel permissions", () => {
    const result = getFirstAccessiblePanelPath([]);
    expect(result).toBeNull();
  });

  it("returns /panel/estructura when user has estructura:gestionar", () => {
    const result = getFirstAccessiblePanelPath(["estructura:gestionar"]);
    expect(result).toBe("/panel/estructura");
  });

  it("returns /panel/usuarios when user only has admin:gestionar-usuarios", () => {
    const result = getFirstAccessiblePanelPath(["admin:gestionar-usuarios"]);
    expect(result).toBe("/panel/usuarios");
  });

  it("returns /panel/auditoria when user only has auditoria:ver", () => {
    const result = getFirstAccessiblePanelPath(["auditoria:ver"]);
    expect(result).toBe("/panel/auditoria");
  });

  it("returns /panel/finanzas/liquidaciones when user only has liquidaciones:ver", () => {
    const result = getFirstAccessiblePanelPath(["liquidaciones:ver"]);
    expect(result).toBe("/panel/finanzas/liquidaciones");
  });

  it("returns estructura (first in order) when user has all admin permissions", () => {
    const result = getFirstAccessiblePanelPath([
      "estructura:gestionar",
      "admin:gestionar-usuarios",
      "auditoria:ver",
      "liquidaciones:ver",
    ]);
    expect(result).toBe("/panel/estructura");
  });

  it("returns /panel/auditoria (before finanzas) for COORDINADOR with auditoria:ver and liquidaciones:ver", () => {
    const result = getFirstAccessiblePanelPath([
      "auditoria:ver",
      "liquidaciones:ver",
    ]);
    expect(result).toBe("/panel/auditoria");
  });

  it("returns null for non-panel permissions", () => {
    const result = getFirstAccessiblePanelPath([
      "calificaciones:importar",
      "equipos:asignar",
    ]);
    expect(result).toBeNull();
  });
});
