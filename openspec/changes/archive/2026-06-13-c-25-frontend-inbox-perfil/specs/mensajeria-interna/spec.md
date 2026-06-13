# Delta Spec: mensajeria-interna — Frontend (C-25)

> Este delta spec extiende `openspec/specs/mensajeria-interna/spec.md` con los escenarios de aceptación **frontend**. No repite los requisitos de backend; agrega los escenarios de interfaz de usuario que el C-20 no cubrió.

---

## Escenarios de Aceptación Frontend

### Bandeja de hilos (Inbox)

#### Scenario: Página de inbox carga y muestra los hilos del usuario
- **GIVEN** un usuario autenticado navega a `/inbox`
- **WHEN** la página se monta
- **THEN** se dispara `GET /api/inbox` y se muestra la lista de hilos en los que el usuario es participante, ordenados por fecha del último mensaje (más reciente primero)

#### Scenario: Cada hilo en la lista muestra información suficiente
- **GIVEN** la bandeja cargó con hilos
- **THEN** cada ítem de la lista muestra: asunto del hilo, nombre del otro participante, fecha/hora del último mensaje, y un indicador visual (badge o ícono) si tiene mensajes no leídos

#### Scenario: Inbox vacío muestra estado vacío
- **GIVEN** el usuario no tiene ningún hilo
- **THEN** la bandeja muestra un estado vacío con texto descriptivo (ej. "No tenés mensajes todavía") y un botón para iniciar un nuevo hilo

#### Scenario: Estado de carga mientras llegan los hilos
- **GIVEN** la petición a `/api/inbox` está en vuelo
- **THEN** la página muestra `LoadingSpinner`; no se muestra contenido parcial

#### Scenario: Error al cargar el inbox
- **GIVEN** `GET /api/inbox` devuelve un error HTTP
- **THEN** se muestra `ErrorMessage` con mensaje descriptivo

#### Scenario: Indicador de mensajes no leídos
- **GIVEN** un hilo tiene mensajes no leídos para el usuario autenticado
- **THEN** el ítem del hilo muestra un badge o punto de color destacado; los hilos sin mensajes no leídos no tienen dicho indicador

---

### Vista de un hilo individual

#### Scenario: Clic en un hilo abre la conversación completa
- **GIVEN** el usuario hace clic en un hilo de la bandeja
- **THEN** se navega a `/inbox/:hilo_id` y se dispara `GET /api/inbox/:hilo_id`; se muestran el asunto, ambos participantes, y los mensajes en orden cronológico ascendente (el más antiguo arriba)

#### Scenario: Cada mensaje muestra autor, cuerpo y timestamp
- **GIVEN** el hilo cargó con mensajes
- **THEN** cada burbuja de mensaje indica: nombre del autor, cuerpo del mensaje, y fecha/hora de envío

#### Scenario: Los mensajes propios se diferencian visualmente
- **GIVEN** el usuario autenticado tiene mensajes enviados en el hilo
- **THEN** esos mensajes se muestran alineados o con estilo distinto al del otro participante (estilo chat)

#### Scenario: Estado de carga del hilo
- **GIVEN** la petición a `GET /api/inbox/:hilo_id` está en vuelo
- **THEN** se muestra `LoadingSpinner`

#### Scenario: Error 404 — hilo no existe o usuario no es participante
- **GIVEN** el backend retorna 404 para el `hilo_id` solicitado
- **THEN** se muestra una pantalla de error amigable (ej. "Este hilo no existe o no tenés acceso") con un botón de "Volver al inbox"

---

### Responder en un hilo

#### Scenario: Formulario de respuesta visible al fondo de la conversación
- **GIVEN** la vista del hilo cargó correctamente
- **THEN** hay un campo de texto y un botón "Enviar" al final de la lista de mensajes

#### Scenario: Envío exitoso de una respuesta
- **GIVEN** el usuario escribe un mensaje y hace clic en "Enviar"
- **WHEN** `POST /api/inbox/:hilo_id/mensajes` responde con 201
- **THEN** el campo de texto se vacía, el nuevo mensaje aparece al final del hilo, y la query del hilo se invalida para reflejar el estado actualizado

#### Scenario: No se puede enviar un mensaje vacío
- **GIVEN** el campo de texto está vacío
- **THEN** el botón "Enviar" está deshabilitado o se muestra un error de validación inline

#### Scenario: Estado de carga durante el envío de respuesta
- **GIVEN** el usuario envió el mensaje y la petición está en vuelo
- **THEN** el botón "Enviar" está deshabilitado con indicador de carga; el campo no acepta más edición

#### Scenario: Error al enviar respuesta
- **GIVEN** `POST /api/inbox/:hilo_id/mensajes` devuelve un error HTTP
- **THEN** el campo no se vacía y se muestra el error al usuario; puede reintentar

---

### Nuevo hilo

#### Scenario: Botón "Nuevo mensaje" abre el formulario de composición
- **GIVEN** el usuario está en la bandeja o en cualquier vista del inbox
- **THEN** existe un botón o control "Nuevo mensaje" / "Redactar"
- **WHEN** se activa
- **THEN** se muestra un formulario con: selector de destinatario (usuario del tenant), campo de asunto y campo de cuerpo del primer mensaje

#### Scenario: Envío exitoso crea el hilo y redirige
- **GIVEN** el usuario completó el formulario de nuevo hilo y hace clic en "Enviar"
- **WHEN** `POST /api/inbox` responde con 201 y el hilo creado
- **THEN** se redirige automáticamente a la vista del nuevo hilo (`/inbox/:hilo_id`) y el hilo aparece en la bandeja

#### Scenario: Validación del formulario de nuevo hilo
- **GIVEN** el formulario de nuevo hilo está abierto
- **WHEN** el usuario intenta enviar sin seleccionar destinatario, sin asunto o sin cuerpo
- **THEN** se muestran mensajes de error inline por campo; el POST no se dispara

#### Scenario: No se puede enviar un hilo a uno mismo
- **GIVEN** el selector de destinatario está activo
- **THEN** el usuario autenticado no aparece como opción seleccionable

---

### Navegación

#### Scenario: Entrada "Mensajes" visible en el menú lateral para todos los usuarios autenticados
- **GIVEN** cualquier usuario autenticado está usando la aplicación
- **THEN** el menú lateral muestra una entrada "Mensajes" que navega a `/inbox`; no requiere permiso especial

#### Scenario: Badge de no leídos en la entrada del menú (deseable)
- **GIVEN** el usuario tiene hilos con mensajes no leídos
- **THEN** la entrada "Mensajes" en el menú muestra un indicador numérico o visual de mensajes no leídos
