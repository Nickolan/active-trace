## ADDED Requirements

### Requirement: Sección de Roles en Formulario de Edición de Usuario

El sistema SHALL mostrar una sección "Roles" en `UsuarioFormPage` ÚNICAMENTE cuando se está editando un usuario existente (modo `isEditing = true`). La sección SHALL listar todos los roles disponibles del tenant como checkboxes. Los checkboxes de los roles actualmente asignados al usuario SHALL estar marcados. Marcar un checkbox SHALL llamar al endpoint `POST /api/admin/usuarios/{id}/roles`. Desmarcar un checkbox SHALL llamar al endpoint `DELETE /api/admin/usuarios/{id}/roles/{rol_id}`. Los cambios de roles son inmediatos (no requieren guardar el formulario principal).

#### Scenario: Sección visible en modo edición

- **WHEN** el ADMIN navega a la pantalla de edición de un usuario existente
- **THEN** la sección "Roles" se muestra con checkboxes para cada rol del tenant

#### Scenario: Roles actuales aparecen marcados

- **WHEN** el usuario tiene los roles ADMIN y PROFESOR asignados
- **THEN** los checkboxes de ADMIN y PROFESOR aparecen marcados, el resto desmarcado

#### Scenario: Sección oculta en modo creación

- **WHEN** el ADMIN navega a la pantalla de creación de un nuevo usuario
- **THEN** la sección "Roles" NO se muestra (no hay user_id aún)

#### Scenario: Marcar checkbox asigna el rol

- **WHEN** el ADMIN marca el checkbox de un rol desmarcado
- **THEN** el sistema llama `POST /api/admin/usuarios/{id}/roles` con el `rol_id` correspondiente y el checkbox queda marcado

#### Scenario: Desmarcar checkbox remueve el rol

- **WHEN** el ADMIN desmarca el checkbox de un rol marcado
- **THEN** el sistema llama `DELETE /api/admin/usuarios/{id}/roles/{rol_id}` y el checkbox queda desmarcado

#### Scenario: Estado de loading durante la mutación

- **WHEN** una mutación de asignación o remoción está en vuelo
- **THEN** el checkbox afectado se deshabilita hasta que la mutación completa (evita doble-click)
