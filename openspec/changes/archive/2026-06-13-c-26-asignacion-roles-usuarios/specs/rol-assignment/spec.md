## ADDED Requirements

### Requirement: Listar Roles del Tenant

El sistema SHALL exponer `GET /api/admin/roles` que retorna todos los roles activos (`deleted_at IS NULL`) del tenant del usuario autenticado. El endpoint SHALL requerir el permiso `admin:gestionar-usuarios`. La respuesta SHALL incluir `id`, `codigo` y `nombre` de cada rol.

#### Scenario: ADMIN lista roles del tenant

- **WHEN** un usuario con permiso `admin:gestionar-usuarios` llama `GET /api/admin/roles`
- **THEN** el sistema retorna `200 OK` con la lista de roles activos del tenant (array con `id`, `codigo`, `nombre`)

#### Scenario: Roles de otro tenant no se exponen

- **WHEN** el ADMIN del tenant A llama `GET /api/admin/roles`
- **THEN** la respuesta contiene SOLO los roles del tenant A, nunca roles de otros tenants

#### Scenario: Sin permiso devuelve 403

- **WHEN** un usuario sin permiso `admin:gestionar-usuarios` llama `GET /api/admin/roles`
- **THEN** el sistema responde `403 Forbidden`

### Requirement: Listar Roles Asignados a un Usuario

El sistema SHALL exponer `GET /api/admin/usuarios/{id}/roles` que retorna los roles actualmente asignados al usuario indicado dentro del tenant. El endpoint SHALL requerir el permiso `admin:gestionar-usuarios`. Si el usuario no existe en el tenant SHALL responder `404 Not Found`.

#### Scenario: ADMIN consulta roles de un usuario

- **WHEN** el ADMIN llama `GET /api/admin/usuarios/{id}/roles` para un usuario existente
- **THEN** el sistema retorna `200 OK` con la lista de roles asignados (puede ser vacía)

#### Scenario: Usuario sin roles retorna lista vacía

- **WHEN** el usuario no tiene ningún rol asignado
- **THEN** el sistema retorna `200 OK` con `[]`

#### Scenario: Usuario no encontrado devuelve 404

- **WHEN** el ADMIN llama `GET /api/admin/usuarios/{id}/roles` con un UUID que no existe en el tenant
- **THEN** el sistema responde `404 Not Found`

### Requirement: Asignar Rol a Usuario

El sistema SHALL exponer `POST /api/admin/usuarios/{id}/roles` que asigna el rol indicado en el body (`{ "rol_id": "<uuid>" }`) al usuario. El endpoint SHALL requerir el permiso `admin:gestionar-usuarios`. La operación SHALL ser idempotente: si el rol ya está asignado SHALL retornar `200 OK` sin error. Si el `rol_id` no existe o no pertenece al tenant SHALL responder `404 Not Found`. Si el usuario no existe SHALL responder `404 Not Found`.

#### Scenario: Asignación exitosa

- **WHEN** el ADMIN envía `POST /api/admin/usuarios/{id}/roles` con un `rol_id` válido del mismo tenant
- **THEN** el sistema retorna `200 OK` y el rol queda asignado al usuario

#### Scenario: Asignación idempotente

- **WHEN** el ADMIN envía el mismo `rol_id` que ya estaba asignado al usuario
- **THEN** el sistema retorna `200 OK` sin crear una fila duplicada ni lanzar error

#### Scenario: Rol de otro tenant rechazado

- **WHEN** el ADMIN envía un `rol_id` que pertenece a otro tenant
- **THEN** el sistema responde `404 Not Found` (el rol no existe en el tenant del request)

#### Scenario: Usuario no encontrado devuelve 404

- **WHEN** el ADMIN envía `POST /api/admin/usuarios/{id}/roles` con un `id` de usuario que no existe en el tenant
- **THEN** el sistema responde `404 Not Found`

### Requirement: Remover Rol de Usuario

El sistema SHALL exponer `DELETE /api/admin/usuarios/{id}/roles/{rol_id}` que elimina la asignación del rol indicado para el usuario. El endpoint SHALL requerir el permiso `admin:gestionar-usuarios`. Si la asignación no existe SHALL responder `404 Not Found`. Si el usuario no existe SHALL responder `404 Not Found`.

#### Scenario: Remoción exitosa

- **WHEN** el ADMIN llama `DELETE /api/admin/usuarios/{id}/roles/{rol_id}` para una asignación existente
- **THEN** el sistema retorna `200 OK` y la fila en `user_rol` se elimina

#### Scenario: Asignación inexistente devuelve 404

- **WHEN** el ADMIN llama `DELETE /api/admin/usuarios/{id}/roles/{rol_id}` para un rol que no está asignado al usuario
- **THEN** el sistema responde `404 Not Found`

#### Scenario: Usuario no encontrado devuelve 404

- **WHEN** el ADMIN llama `DELETE /api/admin/usuarios/{id}/roles/{rol_id}` con un `id` de usuario que no existe en el tenant
- **THEN** el sistema responde `404 Not Found`
