import { api } from "@/shared/services/api";
import type { RolRead } from "@/features/usuarios-tenant/types/roles";

/** Obtiene todos los roles activos del tenant. */
export async function fetchRoles(): Promise<RolRead[]> {
  const { data } = await api.get<RolRead[]>("/admin/roles");
  return data;
}

/** Obtiene los roles asignados a un usuario. */
export async function fetchRolesUsuario(userId: string): Promise<RolRead[]> {
  const { data } = await api.get<RolRead[]>(`/admin/usuarios/${userId}/roles`);
  return data;
}

/** Asigna un rol a un usuario. */
export async function asignarRol(userId: string, rolId: string): Promise<void> {
  await api.post(`/admin/usuarios/${userId}/roles`, { rol_id: rolId });
}

/** Remueve un rol de un usuario. */
export async function removerRol(userId: string, rolId: string): Promise<void> {
  await api.delete(`/admin/usuarios/${userId}/roles/${rolId}`);
}
