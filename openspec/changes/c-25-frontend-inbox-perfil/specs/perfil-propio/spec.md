# Delta Spec: perfil-propio — Frontend (C-25)

> Este delta spec extiende `openspec/specs/perfil-propio/spec.md` con los escenarios de aceptación **frontend**. No repite los requisitos de backend; agrega los escenarios de interfaz de usuario que el C-20 no cubrió.

---

## Escenarios de Aceptación Frontend

### Visualización del perfil

#### Scenario: Página de perfil carga y muestra los datos del usuario
- **GIVEN** un usuario autenticado navega a `/perfil`
- **WHEN** la página se monta
- **THEN** se dispara `GET /api/perfil` y se muestran los campos: nombre completo, email enmascarado, CUIL enmascarado, CBU enmascarado, alias CBU enmascarado, regional, banco, legajo profesional, modalidad de cobro (facturador)

#### Scenario: Estado de carga mientras llega la respuesta
- **GIVEN** la petición a `/api/perfil` está en vuelo
- **THEN** la página muestra un `LoadingSpinner`; los campos no aparecen con valores vacíos ni undefined

#### Scenario: Estado de error si el endpoint falla
- **GIVEN** `GET /api/perfil` devuelve un error HTTP
- **THEN** la página muestra el componente `ErrorMessage` con un mensaje descriptivo

#### Scenario: Campos PII enmascarados se muestran como texto no editable
- **GIVEN** la respuesta incluye CUIL, CBU y alias CBU enmascarados (formato `*****XXXX`)
- **THEN** esos campos se renderizan como texto de solo lectura (no inputs editables)

---

### Formulario de edición

#### Scenario: Botón "Editar perfil" abre el formulario con valores precargados
- **GIVEN** la página de perfil está mostrando los datos
- **WHEN** el usuario hace clic en "Editar perfil"
- **THEN** se muestra el formulario con los campos editables precargados con los valores actuales: nombre, apellidos, email, dni, banco, cbu, alias_cbu, regional, facturador, legajo_profesional

#### Scenario: CUIL no aparece como campo editable en el formulario
- **GIVEN** el formulario de edición está abierto
- **THEN** no existe ningún input de texto ni campo editable con la etiqueta "CUIL" o el campo `cuil`

#### Scenario: Envío exitoso actualiza los datos en pantalla
- **GIVEN** el usuario modifica uno o más campos editables y hace clic en "Guardar"
- **WHEN** `PATCH /api/perfil` responde con 200 y los datos actualizados
- **THEN** el formulario se cierra, la vista de perfil refleja los nuevos valores y se muestra un mensaje de confirmación (toast o similar)

#### Scenario: Validación de campos en el formulario (Zod)
- **GIVEN** el formulario de edición está abierto
- **WHEN** el usuario intenta enviar con el campo `email` vacío o con formato inválido
- **THEN** se muestra un mensaje de error de validación inline; el `PATCH` no se dispara

#### Scenario: Edición parcial — solo se envían los campos modificados
- **GIVEN** el usuario modifica solo `regional`
- **WHEN** se envía el formulario
- **THEN** el body del `PATCH` contiene únicamente el campo `regional`; los demás campos no se incluyen (o se omiten si son undefined)

#### Scenario: Estado de carga durante el envío
- **GIVEN** el usuario envió el formulario y la petición está en vuelo
- **THEN** el botón "Guardar" está deshabilitado y muestra indicador de carga; no se puede re-enviar el formulario

#### Scenario: Error del backend al intentar editar
- **GIVEN** `PATCH /api/perfil` devuelve un error HTTP (ej. 422)
- **THEN** el formulario permanece abierto y se muestra el mensaje de error devuelto por el backend

---

### Cierre de sesión desde el perfil

#### Scenario: El perfil ofrece un enlace o botón de cierre de sesión
- **GIVEN** el usuario está en la página de perfil
- **THEN** existe un botón o enlace "Cerrar sesión"
- **WHEN** el usuario lo activa
- **THEN** se invoca el logout del contexto `useAuth` (que llama a `POST /api/auth/logout` internamente) y se redirige a `/login`

---

### Navegación

#### Scenario: Entrada en el menú lateral visible para todos los usuarios autenticados
- **GIVEN** cualquier usuario autenticado está usando la aplicación
- **THEN** el menú lateral muestra una entrada "Mi Perfil" (o equivalente) que navega a `/perfil`; no requiere permiso especial (todos los usuarios pueden ver su propio perfil)
