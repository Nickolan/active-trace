import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";

/** Redirect helper that preserves the :id param for /usuarios/:id/editar */
function RedirectUsuarioEditar() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/panel/usuarios/${id}/editar`} replace />;
}
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import { AppLayout } from "@/features/auth/components/AppLayout";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { Verify2FAPage } from "@/features/auth/pages/Verify2FAPage";
import { Enroll2FAPage } from "@/features/auth/pages/Enroll2FAPage";
import { ForgotPasswordPage } from "@/features/auth/pages/ForgotPasswordPage";
import { ResetPasswordPage } from "@/features/auth/pages/ResetPasswordPage";
import { DashboardPage } from "@/features/auth/pages/DashboardPage";
import { NotFoundPage } from "@/features/auth/pages/NotFoundPage";

import { ComisionPage } from "@/features/comision/pages/ComisionPage";
import { ComisionLayout } from "@/features/comision/pages/ComisionLayout";
import { ImportarPage } from "@/features/comision/pages/ImportarPage";
import { UmbralPage } from "@/features/comision/pages/UmbralPage";
import { AtrasadosPage } from "@/features/comision/pages/AtrasadosPage";
import { RankingsPage } from "@/features/comision/pages/RankingsPage";
import { ReportesPage } from "@/features/comision/pages/ReportesPage";
import { ComunicacionesPage } from "@/features/comision/pages/ComunicacionesPage";

import { MonitoresPage } from "@/features/monitores/pages/MonitoresPage";
import { EquiposLayout } from "@/features/equipos/pages/EquiposLayout";
import { MisEquiposPage } from "@/features/equipos/pages/MisEquiposPage";
import { AsignacionesPage } from "@/features/equipos/pages/AsignacionesPage";
import { AsignacionMasivaPage } from "@/features/equipos/pages/AsignacionMasivaPage";
import { ClonarEquipoPage } from "@/features/equipos/pages/ClonarEquipoPage";
import { VigenciaEquipoPage } from "@/features/equipos/pages/VigenciaEquipoPage";
import { ExportarEquipoPage } from "@/features/equipos/pages/ExportarEquipoPage";
import { AvisosListPage } from "@/features/avisos/pages/AvisosListPage";
import { AvisoFormPage } from "@/features/avisos/pages/AvisoFormPage";
import { AvisoDetailPage } from "@/features/avisos/pages/AvisoDetailPage";
import { GuardiasPage } from "@/features/guardias/pages/GuardiasPage";
import { ProgramasPage } from "@/features/programas/pages/ProgramasPage";
import { FechasAcademicasPage } from "@/features/fechas-academicas/pages/FechasAcademicasPage";
import { SetupCuatrimestreWizard } from "@/features/setup-cuatrimestre/pages/SetupCuatrimestreWizard";

import { RequirePermission } from "@/features/auth/components/RequirePermission";

import { TareasLayout } from "@/features/tareas/pages/TareasLayout";
import { MisTareasPage } from "@/features/tareas/pages/MisTareasPage";
import { AsignarTareaPage } from "@/features/tareas/pages/AsignarTareaPage";
import { TareasAdminPage } from "@/features/tareas/pages/TareasAdminPage";

import { EncuentrosAdminPage } from "@/features/encuentros/pages/EncuentrosAdminPage";

// ── Liquidaciones ────────────────────────────────────────────────────────────
import { LiquidacionPeriodoPage } from "@/features/liquidaciones/pages/LiquidacionPeriodoPage";
import { HistorialLiquidacionesPage } from "@/features/liquidaciones/pages/HistorialLiquidacionesPage";
import { GrillaSalarialPage } from "@/features/liquidaciones/pages/GrillaSalarialPage";
import { FacturasPage } from "@/features/liquidaciones/pages/FacturasPage";

// ── Estructura Académica ──────────────────────────────────────────────────────
import { CarrerasPage } from "@/features/estructura-academica/pages/CarrerasPage";
import { CohortesPage } from "@/features/estructura-academica/pages/CohortesPage";
import { MateriasPage } from "@/features/estructura-academica/pages/MateriasPage";

// ── Usuarios Tenant ───────────────────────────────────────────────────────────
import { UsuariosListPage } from "@/features/usuarios-tenant/pages/UsuariosListPage";
import { UsuarioFormPage } from "@/features/usuarios-tenant/pages/UsuarioFormPage";

// ── Auditoría ─────────────────────────────────────────────────────────────────
import { AuditoriaPanelPage } from "@/features/auditoria/pages/AuditoriaPanelPage";
import { LogAuditoriaPage } from "@/features/auditoria/pages/LogAuditoriaPage";

// ── Perfil ────────────────────────────────────────────────────────────────────
import { PerfilPage } from "@/features/perfil/pages/PerfilPage";

// ── Inbox ─────────────────────────────────────────────────────────────────────
import { InboxPage } from "@/features/inbox/pages/InboxPage";
import { HiloPage } from "@/features/inbox/pages/HiloPage";
import { NuevoHiloPage } from "@/features/inbox/pages/NuevoHiloPage";

import { ColoquiosLayout } from "@/features/coloquios/pages/ColoquiosLayout";
import { ColoquiosPanelPage } from "@/features/coloquios/pages/ColoquiosPanelPage";
import { ConvocatoriaListPage } from "@/features/coloquios/pages/ConvocatoriaListPage";
import { ConvocatoriaFormPage } from "@/features/coloquios/pages/ConvocatoriaFormPage";
import { ColoquiosAdminPage } from "@/features/coloquios/pages/ColoquiosAdminPage";
import { MisReservasPage } from "@/features/coloquios/pages/MisReservasPage";

// ── Admin Dashboard ───────────────────────────────────────────────────────────
import { AdminLayout } from "@/features/admin-dashboard/components/AdminLayout";
import { AdminPanelIndex } from "@/features/admin-dashboard/components/AdminPanelIndex";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public routes ─────────────────────────────────────────── */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/2fa/verify" element={<Verify2FAPage />} />
        <Route path="/2fa/enroll" element={<Enroll2FAPage />} />
        <Route path="/forgot" element={<ForgotPasswordPage />} />
        <Route path="/reset" element={<ResetPasswordPage />} />

        {/* ── Protected routes ──────────────────────────────────────── */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<DashboardPage />} />

            {/* Comisión routes */}
            <Route
              path="comision"
              element={
                <RequirePermission permission="calificaciones:importar">
                  <ComisionPage />
                </RequirePermission>
              }
            />
            <Route
              path="comision/:materiaId"
              element={
                <RequirePermission permission="calificaciones:importar">
                  <ComisionLayout />
                </RequirePermission>
              }
            >
              <Route index element={<Navigate to="atrasados" replace />} />
              <Route path="importar" element={<ImportarPage />} />
              <Route path="umbral" element={<UmbralPage />} />
              <Route path="atrasados" element={<AtrasadosPage />} />
              <Route path="rankings" element={<RankingsPage />} />
              <Route path="reportes" element={<ReportesPage />} />
              <Route path="comunicaciones" element={<ComunicacionesPage />} />
            </Route>

            {/* Monitores route */}
            <Route
              path="monitores"
              element={
                <RequirePermission permission="atrasados:ver">
                  <MonitoresPage />
                </RequirePermission>
              }
            />

            {/* ── Equipos Docentes ────────────────────────────────────── */}
            <Route
              path="equipos"
              element={
                <RequirePermission permission="equipos:ver">
                  <EquiposLayout />
                </RequirePermission>
              }
            >
              <Route index element={<Navigate to="mis-equipos" replace />} />
              <Route path="mis-equipos" element={<MisEquiposPage />} />
              <Route
                path="asignaciones"
                element={
                  <RequirePermission permission="equipos:asignar">
                    <AsignacionesPage />
                  </RequirePermission>
                }
              />
              <Route
                path="asignacion-masiva"
                element={
                  <RequirePermission permission="equipos:asignar">
                    <AsignacionMasivaPage />
                  </RequirePermission>
                }
              />
              <Route
                path="clonar"
                element={
                  <RequirePermission permission="equipos:asignar">
                    <ClonarEquipoPage />
                  </RequirePermission>
                }
              />
              <Route
                path="vigencia"
                element={
                  <RequirePermission permission="equipos:asignar">
                    <VigenciaEquipoPage />
                  </RequirePermission>
                }
              />
              <Route
                path="exportar"
                element={
                  <RequirePermission permission="equipos:ver">
                    <ExportarEquipoPage />
                  </RequirePermission>
                }
              />
            </Route>

            {/* ── Avisos ──────────────────────────────────────────────── */}
            <Route
              path="avisos"
              element={
                <RequirePermission permission="avisos:ver">
                  <AvisosListPage />
                </RequirePermission>
              }
            />
            <Route
              path="avisos/nuevo"
              element={
                <RequirePermission permission="avisos:gestionar">
                  <AvisoFormPage />
                </RequirePermission>
              }
            />
            <Route
              path="avisos/:id"
              element={
                <RequirePermission permission="avisos:ver">
                  <AvisoDetailPage />
                </RequirePermission>
              }
            />
            <Route
              path="avisos/:id/editar"
              element={
                <RequirePermission permission="avisos:gestionar">
                  <AvisoFormPage />
                </RequirePermission>
              }
            />

            {/* ── Tareas ──────────────────────────────────────────────── */}
            <Route path="tareas" element={<TareasLayout />}>
              <Route index element={<Navigate to="mis-tareas" replace />} />
              <Route path="mis-tareas" element={<MisTareasPage />} />
              <Route
                path="asignar"
                element={
                  <RequirePermission permission="tareas:gestionar">
                    <AsignarTareaPage />
                  </RequirePermission>
                }
              />
              <Route
                path="admin"
                element={
                  <RequirePermission permission="tareas:gestionar">
                    <TareasAdminPage />
                  </RequirePermission>
                }
              />
            </Route>

            {/* ── Encuentros ──────────────────────────────────────────── */}
            <Route
              path="encuentros"
              element={
                <RequirePermission permission="encuentros:gestionar">
                  <EncuentrosAdminPage />
                </RequirePermission>
              }
            />

            {/* ── Coloquios ───────────────────────────────────────────── */}
            <Route
              path="coloquios"
              element={
                <RequirePermission permission={["coloquios:gestionar", "coloquios:reservar"]}>
                  <ColoquiosLayout />
                </RequirePermission>
              }
            >
              <Route index element={<Navigate to="mis-reservas" replace />} />
              <Route path="mis-reservas" element={<MisReservasPage />} />
              <Route path="panel" element={<ColoquiosPanelPage />} />
              <Route path="convocatorias" element={<ConvocatoriaListPage />} />
              <Route path="convocatorias/nueva" element={<ConvocatoriaFormPage />} />
              <Route path="admin" element={<ColoquiosAdminPage />} />
            </Route>

            {/* ── Guardias ────────────────────────────────────────────── */}
            <Route
              path="guardias"
              element={
                <RequirePermission permission="guardias:registrar">
                  <GuardiasPage />
                </RequirePermission>
              }
            />

            {/* ── Programas (Estructura) ──────────────────────────────── */}
            <Route
              path="programas"
              element={
                <RequirePermission permission="estructura:gestionar">
                  <ProgramasPage />
                </RequirePermission>
              }
            />

            {/* ── Fechas Académicas ────────────────────────────────────── */}
            <Route
              path="fechas-academicas"
              element={
                <RequirePermission permission="estructura:gestionar">
                  <FechasAcademicasPage />
                </RequirePermission>
              }
            />

            {/* ── Setup Cuatrimestre ──────────────────────────────────── */}
            <Route
              path="setup-cuatrimestre"
              element={
                <RequirePermission permission="equipos:asignar">
                  <SetupCuatrimestreWizard />
                </RequirePermission>
              }
            />

            {/* ── Perfil ───────────────────────────────────────────────── */}
            <Route path="perfil" element={<PerfilPage />} />

            {/* ── Inbox ────────────────────────────────────────────────── */}
            <Route path="inbox" element={<InboxPage />} />
            <Route path="inbox/nuevo" element={<NuevoHiloPage />} />
            <Route path="inbox/:hiloId" element={<HiloPage />} />

            {/* ── Admin Panel (/panel/*) ───────────────────────────────── */}
            {/* Task 4.1: AdminLayout mounted under /panel */}
            <Route path="panel" element={<AdminLayout />}>
              {/* Task 4.6: index → redirect to first accessible section */}
              <Route index element={<AdminPanelIndex />} />

              {/* Task 4.2: Estructura Académica */}
              <Route
                path="estructura"
                element={
                  <RequirePermission permission="estructura:gestionar">
                    <Navigate to="carreras" replace />
                  </RequirePermission>
                }
              />
              <Route
                path="estructura/carreras"
                element={
                  <RequirePermission permission="estructura:gestionar">
                    <CarrerasPage />
                  </RequirePermission>
                }
              />
              <Route
                path="estructura/cohortes"
                element={
                  <RequirePermission permission="estructura:gestionar">
                    <CohortesPage />
                  </RequirePermission>
                }
              />
              <Route
                path="estructura/materias"
                element={
                  <RequirePermission permission="estructura:gestionar">
                    <MateriasPage />
                  </RequirePermission>
                }
              />

              {/* Task 4.3: Usuarios */}
              <Route
                path="usuarios"
                element={
                  <RequirePermission permission="admin:gestionar-usuarios">
                    <UsuariosListPage />
                  </RequirePermission>
                }
              />
              <Route
                path="usuarios/nuevo"
                element={
                  <RequirePermission permission="admin:gestionar-usuarios">
                    <UsuarioFormPage />
                  </RequirePermission>
                }
              />
              <Route
                path="usuarios/:id/editar"
                element={
                  <RequirePermission permission="admin:gestionar-usuarios">
                    <UsuarioFormPage />
                  </RequirePermission>
                }
              />

              {/* Task 4.4: Auditoría */}
              <Route
                path="auditoria"
                element={
                  <RequirePermission permission="auditoria:ver">
                    <AuditoriaPanelPage />
                  </RequirePermission>
                }
              />
              <Route
                path="auditoria/log"
                element={
                  <RequirePermission permission="auditoria:ver">
                    <LogAuditoriaPage />
                  </RequirePermission>
                }
              />

              {/* Task 4.5: Liquidaciones */}
              <Route
                path="finanzas/liquidaciones"
                element={
                  <RequirePermission permission="liquidaciones:ver">
                    <LiquidacionPeriodoPage />
                  </RequirePermission>
                }
              />
              <Route
                path="finanzas/liquidaciones/historial"
                element={
                  <RequirePermission permission="liquidaciones:ver">
                    <HistorialLiquidacionesPage />
                  </RequirePermission>
                }
              />
              <Route
                path="finanzas/liquidaciones/grilla"
                element={
                  <RequirePermission permission="liquidaciones:ver">
                    <GrillaSalarialPage />
                  </RequirePermission>
                }
              />
              <Route
                path="finanzas/liquidaciones/facturas"
                element={
                  <RequirePermission permission="liquidaciones:ver">
                    <FacturasPage />
                  </RequirePermission>
                }
              />
            </Route>

            {/* ── Redirects de compatibilidad (rutas planas → /panel/*) ── */}
            {/* Task 5.1 + 5.2: Legacy flat routes preserved as redirects */}
            <Route
              path="estructura"
              element={<Navigate to="/panel/estructura" replace />}
            />
            <Route
              path="estructura/carreras"
              element={<Navigate to="/panel/estructura/carreras" replace />}
            />
            <Route
              path="estructura/cohortes"
              element={<Navigate to="/panel/estructura/cohortes" replace />}
            />
            <Route
              path="estructura/materias"
              element={<Navigate to="/panel/estructura/materias" replace />}
            />
            <Route
              path="usuarios"
              element={<Navigate to="/panel/usuarios" replace />}
            />
            <Route
              path="usuarios/nuevo"
              element={<Navigate to="/panel/usuarios/nuevo" replace />}
            />
            <Route
              path="usuarios/:id/editar"
              element={<RedirectUsuarioEditar />}
            />
            <Route
              path="auditoria"
              element={<Navigate to="/panel/auditoria" replace />}
            />
            <Route
              path="auditoria/log"
              element={<Navigate to="/panel/auditoria/log" replace />}
            />
            <Route
              path="liquidaciones"
              element={<Navigate to="/panel/finanzas/liquidaciones" replace />}
            />
            <Route
              path="liquidaciones/historial"
              element={<Navigate to="/panel/finanzas/liquidaciones/historial" replace />}
            />
            <Route
              path="liquidaciones/grilla"
              element={<Navigate to="/panel/finanzas/liquidaciones/grilla" replace />}
            />
            <Route
              path="liquidaciones/facturas"
              element={<Navigate to="/panel/finanzas/liquidaciones/facturas" replace />}
            />

            {/* Catch-all inside protected area — shows 404 with layout */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>

        {/* ── 404 for unauthenticated users ─────────────────────────── */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
