import { api } from "@/shared/services/api";
import type { PerfilResponse, PerfilUpdate } from "@/features/perfil/types/perfil";

export async function fetchPerfil(): Promise<PerfilResponse> {
  const { data } = await api.get<PerfilResponse>("/perfil");
  return data;
}

export async function updatePerfil(payload: PerfilUpdate): Promise<PerfilResponse> {
  const { data } = await api.patch<PerfilResponse>("/perfil", payload);
  return data;
}
