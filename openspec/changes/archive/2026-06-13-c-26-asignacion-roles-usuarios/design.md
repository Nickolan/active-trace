## Context

El backend ya tiene `UserRolRepository` (con `assign_role` y `get_role_codigos_for_user`), el modelo `UserRol` (tabla `user_rol`, `UNIQUE(user_id, rol_id)`), y el modelo `Rol`. El router de usuarios (`backend/app/api/v1/routers/usuarios.py`) ya es el lugar correcto: usa el prefix `/api/admin`, las dependencias `require_permission`, `get_current_user` y `get_db` al mismo estilo.

El frontend sigue el patrón `hooks / services / types` dentro de `features/usuarios-tenant/`. El form de edición `UsuarioFormPage.tsx` ya resuelve el id por params y tiene secciones separadas.

## Goals / Non-Goals

**Goals:**
- Exponer 4 endpoints REST bajo `/api/admin/` para listar roles del tenant, listar/asignar/remover roles de usuario.
- Agregar sección de roles en `UsuarioFormPage` para el caso de edición (no aplica a creación nueva).
- Hooks React Query aislados en archivo propio para no contaminar `useUsuariosTenant.ts`.

**Non-Goals:**
- Crear/eliminar roles del catálogo (fuera de scope).
- Gestionar permisos de un rol.
- Mostrar sección de roles al crear un usuario nuevo (sólo aplica en edición, porque el user_id es necesario para las mutaciones).
- Agregar paginación al listado de roles (son como máximo 7 por tenant).

## Decisions

### D1 — Extender el router `usuarios.py` en lugar de crear `roles.py`

Los nuevos endpoints (`GET /roles`, `GET /usuarios/{id}/roles`, `POST /usuarios/{id}/roles`, `DELETE /usuarios/{id}/roles/{rol_id}`) viven todos bajo el mismo prefix `/api/admin` y comparten el mismo permiso `admin:gestionar-usuarios`. Crear un archivo separado solo agrega indirección. Se agregan al final del `usuarios.py` existente con un bloque de comentarios `# ══ Roles ══`.

Alternativa descartada: `roles.py` separado. No aporta cohesión; el router ya existe con el prefix correcto.

### D2 — Usar `UserRolRepository` directamente en el router, sin servicio nuevo

`assign_role` y `get_role_codigos_for_user` ya existen. La lógica de negocio es mínima: verificar que el usuario y el rol pertenecen al mismo tenant antes de asignar. Esta validación cabe en el handler. Crear `RolService` agrega una capa vacía.

Excepción: el check de pertenencia al tenant del rol se hace con `RolRepository.get_by_id` (existente o a crear inline con `select(Rol).where(Rol.id == rol_id, Rol.tenant_id == tenant_id, Rol.deleted_at.is_(None))`).

### D3 — Idempotencia en `POST /usuarios/{id}/roles`

La tabla `user_rol` tiene `UNIQUE(user_id, rol_id)`. En lugar de propagar la excepción de BD, el handler hace un `SELECT` previo y retorna `200 OK` si el rol ya está asignado. Esto evita errores en doble-click del usuario.

### D4 — Schemas Pydantic nuevos: `RolRead` y `RolAsignarRequest`

Se agregan al módulo `backend/app/schemas/`. `RolRead` expone `id`, `codigo`, `nombre`. `RolAsignarRequest` recibe `rol_id: UUID`.

### D5 — Frontend: hooks en archivo nuevo `useRoles.ts`

Se crea `frontend/src/features/usuarios-tenant/hooks/useRoles.ts` con `useRoles`, `useRolesUsuario`, `useAsignarRol`, `useRemoverRol`. Se crea el service `frontend/src/features/usuarios-tenant/services/roles.ts`. El componente de la sección de roles se escribe inline en `UsuarioFormPage.tsx` (es una sección simple, no justifica un componente separado).

### D6 — Optimistic UI vs invalidación de cache

Se usa `invalidateQueries` en `onSuccess` de `useAsignarRol` y `useRemoverRol` (para `["roles-usuario", id]`). No se implementa optimistic update: la operación es instantánea desde el backend y no hay latencia percibida que lo justifique.

## Risks / Trade-offs

- [Risk] El permiso `admin:gestionar-usuarios` podría no estar en la seed de `permiso`. → Verificar en `backend/app/db/seed.py` antes de implementar. Si falta, agregarlo al seed script.
- [Risk] El `UserRolRepository.assign_role` no verifica que `rol_id` pertenezca al tenant. → El handler debe validar explícitamente con un `SELECT` en la tabla `rol` antes de llamar `assign_role`.
- [Trade-off] No se cachea el listado de roles a nivel global (se refetch por usuario). Con 7 roles por tenant, el overhead es despreciable.

## Migration Plan

No hay migraciones de BD. Las tablas `rol` y `user_rol` existen. El deploy es una actualización normal del backend + frontend sin pasos manuales.

## Open Questions

- ¿El endpoint `GET /api/admin/roles` debe incluir solo roles activos (`deleted_at IS NULL`) o también los soft-deleted? → Asumir solo activos.
- ¿Se necesita invalidar `["usuarios-tenant", id]` al cambiar roles para refrescar algún dato del usuario en la UI? → Por ahora no, los roles no se incluyen en `UsuarioResponse`.
