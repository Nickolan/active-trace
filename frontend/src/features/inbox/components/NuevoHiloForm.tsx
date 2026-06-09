/**
 * NuevoHiloForm — formulario de composición de nuevo hilo.
 *
 * NOTA (Fase 0): El endpoint GET /api/admin/usuarios requiere el permiso
 * `admin:gestionar-usuarios`. No existe un endpoint de usuarios accesible
 * sin ese permiso (verificado en inbox.py — no expone ningún endpoint de
 * listado de usuarios). Por lo tanto, este componente usa GET /api/admin/usuarios
 * como fallback. Si el usuario no tiene ese permiso, el selector mostrará
 * un error de autorización. Una mejora futura sería que el backend exponga
 * GET /api/inbox/usuarios-disponibles sin restricción de permiso de admin.
 */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { NuevoHiloSchema } from "@/features/inbox/types/inbox";
import type { NuevoHilo } from "@/features/inbox/types/inbox";
import { useCrearHilo } from "@/features/inbox/hooks/useInbox";
import { FormField } from "@/shared/components/FormField";
import { Input } from "@/shared/components/Input";
import { Button } from "@/shared/components/Button";
import { ErrorMessage } from "@/shared/components/ErrorMessage";
import { useAuth } from "@/shared/hooks/useAuth";
import { api } from "@/shared/services/api";

interface UsuarioItem {
  id: string;
  nombre: string;
  apellidos: string;
}

async function fetchUsuariosDisponibles(): Promise<UsuarioItem[]> {
  const { data } = await api.get<{ items: UsuarioItem[] }>("/admin/usuarios");
  return data.items;
}

export function NuevoHiloForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const crearHilo = useCrearHilo();

  const { data: usuarios, isLoading: loadingUsuarios } = useQuery({
    queryKey: ["usuarios-disponibles"],
    queryFn: fetchUsuariosDisponibles,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NuevoHilo>({
    resolver: zodResolver(NuevoHiloSchema),
  });

  const otrosUsuarios = (usuarios ?? []).filter((u) => u.id !== user?.id);

  const onSubmit = async (values: NuevoHilo) => {
    const nuevoHilo = await crearHilo.mutateAsync(values);
    navigate(`/inbox/${nuevoHilo.id}`);
  };

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Nuevo mensaje</h1>
        <Button variant="ghost" type="button" onClick={() => navigate("/inbox")}>
          Cancelar
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
        <FormField
          label="Destinatario"
          html_for="destinatario_id"
          error={errors.destinatario_id?.message}
        >
          <select
            id="destinatario_id"
            {...register("destinatario_id")}
            disabled={loadingUsuarios}
            className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:cursor-not-allowed disabled:bg-gray-100"
          >
            <option value="">
              {loadingUsuarios ? "Cargando usuarios…" : "Seleccioná un destinatario"}
            </option>
            {otrosUsuarios.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nombre} {u.apellidos}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Asunto" html_for="asunto" error={errors.asunto?.message}>
          <Input
            id="asunto"
            has_error={!!errors.asunto}
            placeholder="Asunto del mensaje"
            {...register("asunto")}
          />
        </FormField>

        <FormField label="Mensaje" html_for="cuerpo" error={errors.cuerpo?.message}>
          <textarea
            id="cuerpo"
            rows={5}
            placeholder="Escribí tu mensaje…"
            {...register("cuerpo")}
            className={`block w-full rounded-md border px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
              errors.cuerpo
                ? "border-red-300 focus:border-red-400 focus:ring-red-500"
                : "border-gray-300 focus:border-brand-500 focus:ring-brand-500"
            }`}
          />
        </FormField>

        {crearHilo.isError && (
          <ErrorMessage
            message={
              crearHilo.error instanceof Error
                ? crearHilo.error.message
                : "Error al enviar el mensaje"
            }
          />
        )}

        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" is_loading={crearHilo.isPending}>
            Enviar
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate("/inbox")}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
