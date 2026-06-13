# Tasks: c-25-frontend-inbox-perfil

## Implementation Checklist

> TDD activo: para cada página/componente con lógica, escribir primero el test (RED), luego la implementación mínima (GREEN), triangular y refactorizar. Schemas Zod con `.strict()` (regla dura). Archivos < 200 LOC; dividir si crecen. Reutilizar shared components existentes (`FilterableTable`, `ConfirmDialog`, `FormField`, `Input`, `Button`, `ErrorMessage`, `LoadingSpinner`, etc.). NO modificar backend. Prefijo de API real: `/api/...` (no `/api/v1/...`). Verificar los schemas Pydantic reales de `inbox.py` y `perfil.py` antes de escribir los tipos TypeScript.

---

### Fase 0: Preparación — leer los routers reales

- [x] 0.1 Leer `backend/app/api/v1/routers/inbox.py` (o la ruta real donde vive): mapear todos los endpoints, DTOs de request y response, y nombres de campo exactos
- [x] 0.2 Leer `backend/app/api/v1/routers/perfil.py`: mapear campos del `PerfilResponse` y `PerfilUpdate` Pydantic, incluyendo cuáles son enmascarados y cuáles son editables
- [x] 0.3 Confirmar si existe un endpoint para listar usuarios del tenant accesible sin permiso `admin:gestionar-usuarios` (para el selector de destinatario del nuevo hilo); documentar la decisión

---

### Fase 1: Módulo `perfil` — tipos, servicio y hook

- [x] 1.1 Crear `features/perfil/types/perfil.ts`:
  - `PerfilResponseSchema` (Zod `.passthrough()` para campos extras del backend)
  - `PerfilUpdateSchema` (Zod `.strict()` con campos editables + todos `.optional()`, cuil EXCLUIDO)
  - Exportar tipos inferidos `PerfilResponse` y `PerfilUpdate`

- [x] 1.2 Crear `features/perfil/services/perfil.ts`:
  - `fetchPerfil(): Promise<PerfilResponse>` → `GET /api/perfil`
  - `updatePerfil(payload: PerfilUpdate): Promise<PerfilResponse>` → `PATCH /api/perfil`

- [x] 1.3 Crear `features/perfil/hooks/usePerfil.ts`:
  - `usePerfil()` → `useQuery({ queryKey: ["perfil"], queryFn: fetchPerfil })`
  - `useUpdatePerfil()` → `useMutation` + `onSuccess` invalida `["perfil"]`

---

### Fase 2: Módulo `perfil` — página

- [x] 2.1 Crear `features/perfil/pages/PerfilPage.tsx`:
  - Vista de solo lectura: muestra todos los campos del `PerfilResponse`; PII enmascarados como texto estático
  - Botón "Editar perfil" alterna a modo edición (`editando` state local)
  - Estado de carga: `<LoadingSpinner />`
  - Estado de error: `<ErrorMessage />`

- [x] 2.2 Implementar el formulario de edición en `PerfilPage` (mismo componente, toggle de estado):
  - RHF + resolver Zod con `PerfilUpdateSchema`
  - Precarga los valores actuales en `defaultValues`
  - Campos: nombre, apellidos, email, dni, banco, cbu, alias_cbu, regional, facturador (checkbox/toggle), legajo_profesional
  - Botones: "Guardar" (dispara `useUpdatePerfil`) y "Cancelar" (resetea y cierra el formulario)
  - Solo envía los campos modificados (dirty fields de RHF o manualmente omitir undefined)

- [x] 2.3 Agregar botón/enlace "Cerrar sesión" en la página de perfil que llama a `useAuth().logout()` y redirige a `/login`

---

### Fase 3: Módulo `perfil` — navegación

- [x] 3.1 Agregar ruta `/perfil` en `App.tsx`:
  ```tsx
  <Route path="perfil" element={<PerfilPage />} />
  ```
  (dentro de `<Route element={<ProtectedRoute />}><Route element={<AppLayout />}>`)

- [x] 3.2 Agregar entrada "Mi Perfil" en `menu_entries` de `AppLayout.tsx`:
  - `section: "principal"`, sin `permissions` (visible para todos los autenticados)

---

### Fase 4: Módulo `inbox` — tipos, servicio y hooks

- [x] 4.1 Crear `features/inbox/types/inbox.ts`:
  - `HiloResumenSchema` (Zod `.passthrough()`): campos de la lista del inbox (id, asunto, participantes, ultimo_mensaje_at, tiene_no_leidos o equivalente real)
  - `HiloDetalleSchema` (Zod `.passthrough()`): hilo completo con `mensajes[]`
  - `MensajeSchema` (Zod `.passthrough()`): id, hilo_id, autor_id, cuerpo, creado_at
  - `NuevoHiloSchema` (Zod `.strict()`): destinatario_id (uuid), asunto (string min 1), cuerpo (string min 1)
  - `NuevaMensajeSchema` (Zod `.strict()`): cuerpo (string min 1)
  - Exportar tipos inferidos

- [x] 4.2 Crear `features/inbox/services/inbox.ts`:
  - `fetchInbox(): Promise<HiloResumen[]>` → `GET /api/inbox`
  - `fetchHilo(hiloId: string): Promise<HiloDetalle>` → `GET /api/inbox/:hiloId`
  - `responderHilo(hiloId: string, payload: NuevaMensaje): Promise<Mensaje>` → `POST /api/inbox/:hiloId/mensajes`
  - `crearHilo(payload: NuevoHilo): Promise<HiloResumen>` → `POST /api/inbox`

- [x] 4.3 Crear `features/inbox/hooks/useInbox.ts`:
  - `useInbox()` → `useQuery({ queryKey: ["inbox"], queryFn: fetchInbox })`
  - `useHilo(hiloId: string | undefined)` → `useQuery({ queryKey: ["hilo", hiloId], enabled: !!hiloId })`
  - `useResponderHilo()` → `useMutation` + `onSuccess` invalida `["hilo", hiloId]`
  - `useCrearHilo()` → `useMutation` + `onSuccess` invalida `["inbox"]`

---

### Fase 5: Módulo `inbox` — componentes

- [x] 5.1 Crear `features/inbox/components/HiloListItem.tsx`:
  - Props: `hilo: HiloResumen`, `currentUserId: string`
  - Muestra: asunto, nombre del otro participante (derivado de `usuario_a_id` / `usuario_b_id` vs `currentUserId`), timestamp relativo del último mensaje
  - Badge de "no leídos" si `tiene_no_leidos` (o campo equivalente real)
  - Clickeable, delega navegación a la página padre

- [x] 5.2 Crear `features/inbox/components/MensajeBurbuja.tsx`:
  - Props: `mensaje: Mensaje`, `esPropio: boolean`, `nombreAutor: string`
  - Estilos: mensaje propio alineado a la derecha (fondo brand-100), ajeno a la izquierda (fondo gray-100)
  - Muestra: nombre del autor (si no es propio), cuerpo y timestamp formateado

- [x] 5.3 Crear `features/inbox/components/NuevoHiloForm.tsx`:
  - RHF + resolver Zod con `NuevoHiloSchema`
  - Campos: selector de destinatario (combobox/select de usuarios del tenant), asunto (Input), cuerpo (Textarea)
  - El usuario autenticado queda excluido del selector
  - Botones: "Enviar" (dispara `useCrearHilo`) y "Cancelar" (navega a `/inbox`)
  - Estado de carga y error

---

### Fase 6: Módulo `inbox` — páginas

- [x] 6.1 Crear `features/inbox/pages/InboxPage.tsx`:
  - Carga la lista de hilos con `useInbox()`
  - Lista de `HiloListItem`; cada ítem navega a `/inbox/:hiloId`
  - Estado vacío si `data.length === 0`
  - Botón "Nuevo mensaje" navega a `/inbox/nuevo`
  - `LoadingSpinner` y `ErrorMessage` para los estados correspondientes

- [x] 6.2 Crear `features/inbox/pages/HiloPage.tsx`:
  - Lee `hiloId` de `useParams()`
  - Carga el hilo con `useHilo(hiloId)`
  - Lista de `MensajeBurbuja` con `ScrollArea` — scroll automático al montar y al agregar mensajes (`useRef` + `scrollIntoView`)
  - Formulario de respuesta: Textarea + botón "Enviar" (deshabilitado si vacío o mutación en vuelo)
  - `useResponderHilo()` con invalidación del hilo tras envío
  - Error 404: pantalla amigable con botón "Volver al inbox"

- [x] 6.3 Crear la página contenedora del formulario de nuevo hilo en la ruta `/inbox/nuevo`:
  - Renderiza `NuevoHiloForm`
  - Tras creación exitosa: `navigate("/inbox/" + nuevoHilo.id)`

---

### Fase 7: Navegación

- [x] 7.1 Agregar rutas en `App.tsx`:
  ```tsx
  <Route path="inbox" element={<InboxPage />} />
  <Route path="inbox/nuevo" element={<NuevoHiloPage />} />
  <Route path="inbox/:hiloId" element={<HiloPage />} />
  ```
  (dentro del bloque protegido + AppLayout)

- [x] 7.2 Agregar entrada "Mensajes" en `menu_entries` de `AppLayout.tsx`:
  - `section: "principal"`, sin `permissions`
  - Ícono de sobre/bandeja de entrada (heroicons)

---

### Fase 8: Tests (TDD)

#### Perfil

- [x] 8.1 Test `PerfilPage` — vista de solo lectura:
  - Renderiza los campos del perfil cuando `usePerfil` devuelve datos
  - Muestra `LoadingSpinner` cuando `isLoading = true`
  - Muestra `ErrorMessage` cuando `error` está presente
  - Los campos PII (CUIL, CBU, alias) se muestran como texto, no como inputs editables

- [x] 8.2 Test `PerfilPage` — formulario de edición:
  - Clic en "Editar perfil" muestra el formulario con valores precargados
  - Intento de enviar con nombre vacío muestra error inline; PATCH no se dispara
  - Envío exitoso (mock de `useUpdatePerfil` resolviendo) regresa a vista de solo lectura
  - El campo CUIL no existe en el formulario (no se renderiza)
  - Botón "Cancelar" cierra el formulario sin hacer PATCH

#### Inbox

- [x] 8.3 Test `InboxPage`:
  - Renderiza la lista de hilos cuando `useInbox` devuelve datos con hilos
  - Muestra estado vacío cuando `data = []`
  - Hilos con `tiene_no_leidos = true` muestran badge de no leídos
  - Hilos sin no leídos no muestran badge
  - Muestra `LoadingSpinner` cuando `isLoading = true`

- [x] 8.4 Test `HiloPage`:
  - Renderiza los mensajes del hilo cuando `useHilo` devuelve datos
  - Mensajes propios (mismo `autor_id` que `currentUser.id`) tienen clase/estilo de burbuja propia
  - Mensajes ajenos tienen clase/estilo de burbuja ajena
  - Botón "Enviar" deshabilitado cuando el textarea está vacío
  - Envío exitoso (mock resolviendo) vacía el textarea

- [x] 8.5 Test `NuevoHiloForm`:
  - Intento de enviar sin destinatario, sin asunto o sin cuerpo muestra errores Zod inline; POST no se dispara
  - Envío exitoso navega a `/inbox/:nuevaId`

---

## Dependencias

- `C-21` — Frontend shell + auth (AppLayout, ProtectedRoute, useAuth)
- `C-20` — Backend perfil e inbox (routers ya implementados)
- `C-22` / `C-23` / `C-24` — Patrón de referencia + shared components reutilizables

## Notas de Implementación

- Seguir el patrón de C-22/C-23/C-24: `types/` → `services/` → `hooks/` → `pages/`
- Verificar los schemas Pydantic reales **antes** de escribir los tipos Zod (Fase 0 es bloqueante)
- Reutilizar shared components; NO recrear `FormField`, `Input`, `Button`, etc.
- Prefijo de API real: `/api/perfil` y `/api/inbox` (no `/api/v1/...`)
- El campo `cuil` NUNCA debe aparecer como input editable en ningún formulario
- El scroll automático en `HiloPage` se implementa con `useRef` + `useEffect`, no con librerías externas
- Para el selector de destinatario, confirmar durante Fase 0 qué endpoint es accesible según los permisos reales del usuario
- No modificar backend bajo ninguna circunstancia — si falta un endpoint de usuarios disponibles, documentar la restricción y proponer una solución alternativa al revisor
