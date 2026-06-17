## 1. Backend — Schemas Pydantic

- [x] 1.1 Crear `RolRead` en `backend/app/schemas/rol.py` con campos `id: UUID`, `codigo: str`, `nombre: str`
- [x] 1.2 Crear `RolAsignarRequest` en el mismo archivo con campo `rol_id: UUID`

## 2. Backend — Repositorio

- [x] 2.1 Agregar método `get_all_active(self) -> list[Rol]` en `UserRolRepository` (o crear `RolRepository` inline) que retorna todos los roles activos del tenant (`deleted_at IS NULL`)
- [x] 2.2 Agregar método `get_roles_for_user(self, user_id: UUID) -> list[UserRol]` en `UserRolRepository` que retorna las asignaciones activas del usuario con join a `Rol`
- [x] 2.3 Agregar método `remove_role(self, user_id: UUID, rol_id: UUID) -> bool` en `UserRolRepository` que elimina la fila `user_rol` y retorna `True` si existía, `False` si no existía
- [x] 2.4 Verificar que el permiso `admin:gestionar-usuarios` existe en la seed de permisos (`backend/app/db/seed.py` o equivalente); agregarlo si falta

## 3. Backend — Endpoints en router usuarios.py

- [x] 3.1 Agregar `GET /api/admin/roles` que llama al repositorio de roles y retorna `list[RolRead]` con roles activos del tenant
- [x] 3.2 Agregar `GET /api/admin/usuarios/{usuario_id}/roles` que verifica que el usuario existe en el tenant y retorna `list[RolRead]` con sus roles asignados; 404 si el usuario no existe
- [x] 3.3 Agregar `POST /api/admin/usuarios/{usuario_id}/roles` que: (a) verifica que el usuario existe, (b) verifica que el `rol_id` existe y pertenece al tenant, (c) verifica idempotencia con `SELECT` previo, (d) llama `assign_role` si no existe aún; retorna `200 OK`
- [x] 3.4 Agregar `DELETE /api/admin/usuarios/{usuario_id}/roles/{rol_id}` que llama `remove_role`; retorna `200 OK` si existía, `404` si no existía
- [x] 3.5 Registrar el router en `backend/app/api/v1/__init__.py` si aún no está incluido (verificar)

## 4. Tests Backend

- [x] 4.1 Test `GET /api/admin/roles`: verifica que retorna solo roles del tenant, 403 sin permiso
- [x] 4.2 Test `GET /api/admin/usuarios/{id}/roles`: retorna lista vacía si no tiene roles, 404 si usuario no existe
- [x] 4.3 Test `POST /api/admin/usuarios/{id}/roles`: asignación exitosa, idempotencia (no duplica fila), 404 por rol de otro tenant, 404 por usuario inexistente
- [x] 4.4 Test `DELETE /api/admin/usuarios/{id}/roles/{rol_id}`: remoción exitosa, 404 si asignación no existe

## 5. Frontend — Service y tipos

- [x] 5.1 Crear `frontend/src/features/usuarios-tenant/services/roles.ts` con funciones `fetchRoles()`, `fetchRolesUsuario(userId)`, `asignarRol(userId, rolId)`, `removerRol(userId, rolId)`
- [x] 5.2 Definir tipo `RolRead` en `frontend/src/features/usuarios-tenant/types/roles.ts` con campos `id`, `codigo`, `nombre`

## 6. Frontend — Hooks

- [x] 6.1 Crear `frontend/src/features/usuarios-tenant/hooks/useRoles.ts` con hook `useRoles()` (query key `["roles"]`)
- [x] 6.2 Agregar hook `useRolesUsuario(userId)` en el mismo archivo (query key `["roles-usuario", userId]`, enabled si userId definido)
- [x] 6.3 Agregar hook `useAsignarRol()` con `invalidateQueries(["roles-usuario", userId])` en `onSuccess`
- [x] 6.4 Agregar hook `useRemoverRol()` con `invalidateQueries(["roles-usuario", userId])` en `onSuccess`

## 7. Frontend — Sección Roles en UsuarioFormPage

- [x] 7.1 Importar `useRoles`, `useRolesUsuario`, `useAsignarRol`, `useRemoverRol` en `UsuarioFormPage.tsx`
- [x] 7.2 Agregar sección "Roles" al form, visible solo cuando `isEditing === true`
- [x] 7.3 Renderizar un checkbox por cada rol disponible; marcar los que aparecen en `rolesUsuario`
- [x] 7.4 Al marcar: llamar `asignarRolMutation.mutate({ userId: id, rolId })`; deshabilitar el checkbox durante la mutación
- [x] 7.5 Al desmarcar: llamar `removerRolMutation.mutate({ userId: id, rolId })`; deshabilitar el checkbox durante la mutación
