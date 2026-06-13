## Why

No existe mecanismo en la UI para que un ADMIN asigne o remueva roles a usuarios del tenant. Los roles actualmente sólo se aplican mediante seed manual en base de datos, lo que hace imposible la administración operativa sin acceso directo a la BD. El backend ya tiene el repositorio `UserRolRepository` con métodos `assign_role` y `get_role_codigos_for_user`, y la tabla `user_rol` existe, pero no hay endpoints ni pantalla de administración.

## What Changes

- **Nuevo endpoint** `GET /api/admin/roles` — lista todos los roles activos del tenant (con `id`, `codigo`, `nombre`).
- **Nuevo endpoint** `GET /api/admin/usuarios/{id}/roles` — lista los roles actualmente asignados a un usuario.
- **Nuevo endpoint** `POST /api/admin/usuarios/{id}/roles` — asigna un rol a un usuario (body: `{ "rol_id": "<uuid>" }`). Idempotente si el rol ya está asignado.
- **Nuevo endpoint** `DELETE /api/admin/usuarios/{id}/roles/{rol_id}` — remueve un rol de un usuario.
- Todos los endpoints requieren el permiso `admin:gestionar-usuarios`.
- **Frontend — sección Roles en `UsuarioFormPage`**: al editar un usuario, se muestra una nueva sección con checkboxes para cada rol disponible en el tenant. El estado de los checks refleja los roles actualmente asignados. Marcar/desmarcar llama a las mutaciones correspondientes.
- **Nuevos React Query hooks**: `useRoles`, `useRolesUsuario`, `useAsignarRol`, `useRemoverRol`.
- **Nuevo servicio API frontend**: funciones `fetchRoles`, `fetchRolesUsuario`, `asignarRol`, `removerRol`.

## Capabilities

### New Capabilities

- `rol-assignment`: Gestión de la asignación de roles a usuarios vía API y UI. Cubre los endpoints CRUD de asignación, el listado de roles del tenant, y el componente frontend de selección de roles en el formulario de usuario.

### Modified Capabilities

- `user-management`: Se agrega la sección de roles al formulario de edición de usuario existente (`UsuarioFormPage`). No cambian los requirements de CRUD de usuario, pero la pantalla de edición ahora incluye administración de roles embebida.

## Impact

- **Backend**: Router nuevo `roles.py` o extensión del router de usuarios en `backend/app/api/admin/`. Servicio nuevo o uso directo del `UserRolRepository`. Schema Pydantic nuevos: `RolRead`, `RolAsignarRequest`, `RolAsignadoRead`.
- **Frontend**: Archivo `useRoles.ts` (hooks), `roles.ts` (service), sección nueva en `UsuarioFormPage.tsx`.
- **RBAC**: El permiso `admin:gestionar-usuarios` debe existir en la seed (verificar antes de implementar).
- **Sin migraciones**: Las tablas `rol` y `user_rol` ya existen.
- **Sin breaking changes**: Los endpoints existentes de `/api/admin/usuarios` no se modifican.
