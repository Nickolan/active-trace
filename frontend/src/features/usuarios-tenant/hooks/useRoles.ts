import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchRoles,
  fetchRolesUsuario,
  asignarRol,
  removerRol,
} from "@/features/usuarios-tenant/services/roles";

/** Hook para obtener todos los roles activos del tenant. */
export function useRoles() {
  return useQuery({
    queryKey: ["roles"],
    queryFn: fetchRoles,
  });
}

/** Hook para obtener los roles asignados a un usuario especifico. */
export function useRolesUsuario(userId: string | undefined) {
  return useQuery({
    queryKey: ["roles-usuario", userId],
    queryFn: () => fetchRolesUsuario(userId!),
    enabled: !!userId,
  });
}

/** Hook para asignar un rol a un usuario. Invalida ["roles-usuario", userId] al completar. */
export function useAsignarRol() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, rolId }: { userId: string; rolId: string }) =>
      asignarRol(userId, rolId),
    onSuccess: (_data, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["roles-usuario", userId] });
    },
  });
}

/** Hook para remover un rol de un usuario. Invalida ["roles-usuario", userId] al completar. */
export function useRemoverRol() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, rolId }: { userId: string; rolId: string }) =>
      removerRol(userId, rolId),
    onSuccess: (_data, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["roles-usuario", userId] });
    },
  });
}
