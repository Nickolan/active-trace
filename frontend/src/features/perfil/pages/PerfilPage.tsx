import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePerfil, useUpdatePerfil } from "@/features/perfil/hooks/usePerfil";
import { PerfilUpdateSchema } from "@/features/perfil/types/perfil";
import type { PerfilUpdate } from "@/features/perfil/types/perfil";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";
import { ErrorMessage } from "@/shared/components/ErrorMessage";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";
import { FormField } from "@/shared/components/FormField";
import { useAuth } from "@/shared/hooks/useAuth";

// ─── Read-only field ──────────────────────────────────────────────────────────

function ReadField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-0.5 text-sm text-gray-900">{value ?? "—"}</p>
    </div>
  );
}

// ─── PerfilPage ───────────────────────────────────────────────────────────────

export function PerfilPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [editando, setEditando] = useState(false);

  const { data, isLoading, isError, error } = usePerfil();
  const updatePerfil = useUpdatePerfil();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PerfilUpdate>({
    resolver: zodResolver(PerfilUpdateSchema),
    defaultValues: {
      nombre: "",
      apellidos: "",
      email: "",
      dni: "",
      banco: "",
      cbu: "",
      alias_cbu: "",
      regional: "",
      legajo_profesional: "",
      facturador: "",
    },
  });

  const handleEdit = () => {
    // PII fields (email, cbu, alias_cbu) receive masked values from backend
    // — do NOT pre-populate them so the user can type a new value intentionally;
    // leaving them blank means "don't update this field"
    reset({
      nombre: data?.nombre ?? "",
      apellidos: data?.apellidos ?? "",
      email: "",
      dni: data?.dni ?? "",
      banco: data?.banco ?? "",
      cbu: "",
      alias_cbu: "",
      regional: data?.regional ?? "",
      legajo_profesional: data?.legajo_profesional ?? "",
      facturador: data?.facturador ?? "",
    });
    setEditando(true);
  };

  const handleCancel = () => {
    reset();
    setEditando(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const onSubmit = async (values: PerfilUpdate) => {
    // Strip empty strings so backend receives only set values
    const payload: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(values)) {
      if (value !== undefined && value !== "") {
        payload[key] = value;
      }
    }
    await updatePerfil.mutateAsync(payload as PerfilUpdate);
    setEditando(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <LoadingSpinner size="h-8 w-8" />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorMessage
        message={
          error instanceof Error ? error.message : "Error al cargar el perfil"
        }
      />
    );
  }

  if (!data) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Mi Perfil</h1>
        {!editando && (
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={handleEdit}>
              Editar perfil
            </Button>
            <Button variant="ghost" onClick={handleLogout}>
              Cerrar sesión
            </Button>
          </div>
        )}
      </div>

      {!editando ? (
        // ── Vista de solo lectura ──────────────────────────────────────────
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ReadField label="Nombre" value={data.nombre} />
            <ReadField label="Apellidos" value={data.apellidos} />
            <ReadField label="Email (enmascarado)" value={data.email} />
            <ReadField label="DNI (enmascarado)" value={data.dni} />
            <ReadField label="CUIL (enmascarado)" value={data.cuil} />
            <ReadField label="Banco" value={data.banco} />
            <ReadField label="CBU (enmascarado)" value={data.cbu} />
            <ReadField label="Alias CBU (enmascarado)" value={data.alias_cbu} />
            <ReadField label="Regional" value={data.regional} />
            <ReadField label="Legajo profesional" value={data.legajo_profesional} />
            <ReadField label="Facturador" value={data.facturador} />
            <ReadField label="Estado" value={data.estado} />
          </div>
        </div>
      ) : (
        // ── Formulario de edición ─────────────────────────────────────────
        <form onSubmit={handleSubmit(onSubmit)} className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Nombre" html_for="nombre" error={errors.nombre?.message}>
              <Input id="nombre" has_error={!!errors.nombre} {...register("nombre")} />
            </FormField>

            <FormField label="Apellidos" html_for="apellidos" error={errors.apellidos?.message}>
              <Input id="apellidos" has_error={!!errors.apellidos} {...register("apellidos")} />
            </FormField>

            <FormField label="Email" html_for="email" error={errors.email?.message}>
              <Input id="email" type="email" has_error={!!errors.email} {...register("email")} />
            </FormField>

            <FormField label="DNI" html_for="dni" error={errors.dni?.message}>
              <Input id="dni" has_error={!!errors.dni} {...register("dni")} />
            </FormField>

            {/* CUIL is always read-only — never editable */}
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">CUIL (enmascarado)</p>
              <p className="mt-0.5 text-sm text-gray-900">{data.cuil ?? "—"}</p>
            </div>

            <FormField label="Banco" html_for="banco" error={errors.banco?.message}>
              <Input id="banco" has_error={!!errors.banco} {...register("banco")} />
            </FormField>

            <FormField label="CBU" html_for="cbu" error={errors.cbu?.message}>
              <Input id="cbu" has_error={!!errors.cbu} {...register("cbu")} />
            </FormField>

            <FormField label="Alias CBU" html_for="alias_cbu" error={errors.alias_cbu?.message}>
              <Input id="alias_cbu" has_error={!!errors.alias_cbu} {...register("alias_cbu")} />
            </FormField>

            <FormField label="Regional" html_for="regional" error={errors.regional?.message}>
              <Input id="regional" has_error={!!errors.regional} {...register("regional")} />
            </FormField>

            <FormField label="Legajo profesional" html_for="legajo_profesional" error={errors.legajo_profesional?.message}>
              <Input id="legajo_profesional" has_error={!!errors.legajo_profesional} {...register("legajo_profesional")} />
            </FormField>

            <FormField label="Facturador" html_for="facturador" error={errors.facturador?.message}>
              <Input id="facturador" has_error={!!errors.facturador} {...register("facturador")} />
            </FormField>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <Button type="submit" is_loading={updatePerfil.isPending}>
              Guardar
            </Button>
            <Button type="button" variant="secondary" onClick={handleCancel}>
              Cancelar
            </Button>
          </div>

          {updatePerfil.isError && (
            <div className="mt-4">
              <ErrorMessage
                message={
                  updatePerfil.error instanceof Error
                    ? updatePerfil.error.message
                    : "Error al guardar los cambios"
                }
              />
            </div>
          )}
        </form>
      )}
    </div>
  );
}
