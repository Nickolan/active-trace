import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchPerfil, updatePerfil } from "@/features/perfil/services/perfil";

export function usePerfil() {
  return useQuery({
    queryKey: ["perfil"],
    queryFn: fetchPerfil,
  });
}

export function useUpdatePerfil() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updatePerfil,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["perfil"] });
    },
  });
}
