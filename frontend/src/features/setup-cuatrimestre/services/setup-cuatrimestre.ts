import { api } from "@/shared/services/api";

export interface CohorteInput {
  nombre: string;
  anio: number;
  fecha_inicio: string;
  fecha_fin: string;
  carrera_id: string;
}

/** Crea una cohorte (paso 1 del wizard) */
export async function crearCohorte(input: CohorteInput): Promise<{ id: string }> {
  const { data } = await api.post<{ id: string }>("/admin/cohortes", input);
  return data;
}

/** Clona todas las asignaciones de un cohorte origen a uno destino (paso 2) */
export async function clonarEquipo(
  origen_cohorte_id: string,
  destino_cohorte_id: string,
  destino_desde: string,
  destino_hasta?: string,
): Promise<void> {
  await api.post("/equipos/clonar-cohorte", {
    origen_cohorte_id,
    destino_cohorte_id,
    destino_desde,
    destino_hasta: destino_hasta ?? null,
  });
}
