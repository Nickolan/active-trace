# Design: c-25-frontend-inbox-perfil

## Arquitectura

### Patrón General

Cada feature sigue el patrón establecido en C-22/C-23/C-24:

```
features/{nombre}/
├── components/     ← Componentes de presentación (sub-vistas, ítems de lista, burbujas, etc.)
├── hooks/          ← TanStack Query hooks (useQuery / useMutation)
├── services/       ← Llamadas HTTP via api client (Axios)
├── types/          ← Schemas Zod + tipos inferidos (siempre con .strict())
└── pages/          ← Páginas container que componen la vista
```

Shared components reutilizables en `frontend/src/shared/components/`: `FilterableTable`, `ConfirmDialog`, `FormField`, `Input`, `Button`, `ErrorMessage`, `LoadingSpinner`. Este change los **reutiliza** — no crea nuevos shared.

---

## Módulo `perfil`

### Estructura de carpetas

```
features/perfil/
├── types/
│   └── perfil.ts              ← PerfilResponse, PerfilUpdateSchema (Zod .strict())
├── services/
│   └── perfil.ts              ← fetchPerfil(), updatePerfil()
├── hooks/
│   └── usePerfil.ts           ← usePerfil(), useUpdatePerfil()
└── pages/
    └── PerfilPage.tsx         ← Vista + formulario de edición (todo en una sola página)
```

No hay componentes separados: la página es suficientemente compacta para contener la vista y el formulario de edición (modo toggle en la misma pantalla con un estado `editando: boolean`).

### Tipos TypeScript (Zod)

```ts
// PerfilResponse — refleja el DTO que devuelve GET /api/perfil
// Campos PII enmascarados llegan como string con formato "*****XXXX"
// Todos los campos se marcan como opcional para permitir passthrough

// PerfilUpdateSchema — campos editables para PATCH /api/perfil
// nombre, apellidos, email, dni, banco, cbu, alias_cbu, regional,
// facturador, legajo_profesional
// Todos opcionales (edición parcial); cuil EXCLUIDO
// Schema con .strict() — rechaza campos extra en tiempo de compilación
```

### Endpoints consumidos

| Acción | Endpoint |
|--------|----------|
| Obtener perfil propio | `GET /api/perfil` |
| Editar perfil propio | `PATCH /api/perfil` |
| Cerrar sesión | `POST /api/auth/logout` (vía `useAuth().logout()`) |

### UX del formulario de edición

- Estado `editando` local en `PerfilPage` (no es necesario una ruta separada).
- Cuando `editando = false`: se muestran los datos en vista de solo lectura con un botón "Editar perfil".
- Cuando `editando = true`: el mismo espacio muestra el formulario precargado con RHF + Zod.
- Al guardar exitosamente: `editando = false` + `queryClient.invalidateQueries(["perfil"])` + toast de confirmación.
- Al cancelar: `editando = false` sin guardar cambios.
- Los campos PII enmascarados (CUIL, CBU, alias) se muestran siempre como texto estático, incluso en modo edición CBU y alias_cbu son editables (el usuario los puede cambiar), pero CUIL no aparece nunca como campo editable.

### Validación Zod (campos con restricciones)

- `email`: `z.string().email()` o vacío permitido (depende del DTO)
- `cbu`: `z.string().length(22)` o regex básico de CBU argentino
- `alias_cbu`: `z.string().min(6).max(20)` (alias CBU tiene reglas de formato)
- `legajo_profesional`: `z.string().optional()`
- `facturador`: `z.boolean()` (toggle de modalidad de cobro)
- Todos opcionales con `.optional()` para respetar edición parcial

### Navegación y rutas

| Ruta | Componente | Permiso |
|------|-----------|---------|
| `/perfil` | `PerfilPage` | ninguno (todo usuario autenticado) |

Entrada en `AppLayout` (sección `"principal"`):

```ts
{
  label: "Mi Perfil",
  path: "/perfil",
  section: "principal",
  // sin permissions — visible para todos los autenticados
  icon: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0..."
}
```

---

## Módulo `inbox`

### Estructura de carpetas

```
features/inbox/
├── types/
│   └── inbox.ts               ← HiloResumen, HiloDetalle, Mensaje, NuevoHilo, NuevaMensajeSchema (Zod .strict())
├── services/
│   └── inbox.ts               ← fetchInbox(), fetchHilo(), responderHilo(), crearHilo()
├── hooks/
│   └── useInbox.ts            ← useInbox(), useHilo(), useResponderHilo(), useCrearHilo()
├── components/
│   ├── HiloListItem.tsx       ← Ítem de bandeja: asunto, participante, timestamp, badge no leídos
│   ├── MensajeBurbuja.tsx     ← Burbuja de mensaje con estilo propio vs ajeno
│   └── NuevoHiloForm.tsx      ← Formulario de composición de nuevo hilo (selector destinatario + asunto + cuerpo)
└── pages/
    ├── InboxPage.tsx          ← Bandeja de hilos + botón "Nuevo mensaje"
    └── HiloPage.tsx           ← Vista del hilo individual + formulario de respuesta
```

### Tipos TypeScript (Zod)

```ts
// HiloResumen — DTO de GET /api/inbox (lista)
// id, asunto, usuario_a_id, usuario_b_id, ultimo_mensaje_at, tiene_no_leidos

// HiloDetalle — DTO de GET /api/inbox/:hilo_id
// id, asunto, participantes[], mensajes: Mensaje[]

// Mensaje
// id, hilo_id, autor_id, cuerpo, creado_at, leido (para el usuario actual)

// NuevoHiloSchema — payload de POST /api/inbox
// destinatario_id: z.string().uuid()
// asunto: z.string().min(1).max(200)
// cuerpo: z.string().min(1)

// NuevaMensajeSchema — payload de POST /api/inbox/:hilo_id/mensajes
// cuerpo: z.string().min(1)

// Todos los schemas con .strict()
```

> **Nota de apply**: los nombres exactos de los campos deben verificarse contra el schema Pydantic real de `inbox.py` antes de escribir los tipos. El campo `tiene_no_leidos` puede llamarse distinto en el DTO real.

### Endpoints consumidos

| Acción | Endpoint |
|--------|----------|
| Listar hilos del usuario | `GET /api/inbox` |
| Leer un hilo completo | `GET /api/inbox/:hilo_id` |
| Responder en un hilo | `POST /api/inbox/:hilo_id/mensajes` |
| Crear nuevo hilo | `POST /api/inbox` |

### UX de la bandeja (`InboxPage`)

- Lista de `HiloListItem` con los hilos del usuario, ordenados por `ultimo_mensaje_at` DESC.
- Badge de no leídos en cada ítem si `tiene_no_leidos = true`.
- Estado vacío con texto descriptivo y botón "Redactar" si `data.length === 0`.
- Botón "Nuevo mensaje" / "Redactar" siempre visible (esquina superior derecha o sobre la lista). Al hacer clic, navega a `/inbox/nuevo`.
- Clic en un ítem de la lista navega a `/inbox/:hilo_id`.

### UX del hilo individual (`HiloPage`)

- Cabecera: asunto, nombre del otro participante, botón "Volver al inbox".
- Lista vertical de `MensajeBurbuja`: mensajes propios a la derecha (fondo brand), ajenos a la izquierda (fondo gris). Cada burbuja muestra nombre del autor, cuerpo y timestamp.
- `useEffect` para hacer scroll al fondo al montar y al agregar nuevos mensajes.
- Formulario de respuesta al fondo: `<textarea>` + botón "Enviar". Deshabilitado cuando el cuerpo está vacío o la mutación está en vuelo.
- Tras envío exitoso: `queryClient.invalidateQueries(["hilo", hiloId])` + scroll al fondo.

### UX de nuevo hilo (`NuevoHiloForm` / ruta `/inbox/nuevo`)

- Tres campos: destinatario (selector con search, carga la lista de usuarios del tenant vía `GET /api/admin/usuarios` o endpoint de usuarios que ya existe), asunto (text input), cuerpo (textarea).
- El usuario autenticado no aparece en el selector de destinatario (filtrar por `user.id !== currentUser.id`).
- Validación Zod antes de enviar. Todos los campos son requeridos.
- Tras creación exitosa: `queryClient.invalidateQueries(["inbox"])` + `navigate("/inbox/:nuevo_hilo_id")`.
- Botón "Cancelar" navega de vuelta a `/inbox`.

> **Decisión de diseño**: El formulario de nuevo hilo se implementa como página separada (`/inbox/nuevo`) en lugar de modal, para mantener consistencia con el patrón de rutas del proyecto (e.g., `/avisos/nuevo`).

### Selector de destinatario — fuente de datos

Para el selector de usuarios del formulario de nuevo hilo, se reutiliza el endpoint de usuarios que ya existe: `GET /api/admin/usuarios` (usado en C-24 por `usuarios-tenant`). Si ese endpoint requiere el permiso `admin:gestionar-usuarios` y el usuario actual no lo tiene, se puede usar `GET /api/inbox/usuarios-disponibles` si existe en `inbox.py` — verificar durante apply y ajustar según lo que el router real exponga.

### Navegación y rutas

| Ruta | Componente | Permiso |
|------|-----------|---------|
| `/inbox` | `InboxPage` | ninguno (todo usuario autenticado) |
| `/inbox/nuevo` | página con `NuevoHiloForm` | ninguno |
| `/inbox/:hiloId` | `HiloPage` | ninguno (el backend valida participación) |

Entrada en `AppLayout` (sección `"principal"`):

```ts
{
  label: "Mensajes",
  path: "/inbox",
  section: "principal",
  // sin permissions — visible para todos los autenticados
  icon: "M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
}
```

---

## Componentes shadcn/ui a utilizar

| Componente | Uso |
|-----------|-----|
| `Card` / `CardContent` | Contenedor de la vista de perfil y de cada hilo en la bandeja |
| `Badge` | Indicador de mensajes no leídos en la bandeja |
| `Separator` | División entre secciones del perfil |
| `Textarea` | Campo de cuerpo en formulario de respuesta y nuevo hilo |
| `Avatar` | Inicial del nombre del participante en la vista de hilo |
| `ScrollArea` | Área scrollable de mensajes en `HiloPage` |

Los formularios usan `FormField` + `Input` del shared (ya existentes), más `Textarea` de shadcn.

---

## Decisiones no obvias

1. **Perfil como página single con toggle**: en lugar de rutas separadas `/perfil` y `/perfil/editar`, se usa un estado local `editando` en la misma página. Razón: el perfil es una sola entidad, el formulario es compacto, y evita una entrada extra en el router. Precedente: `UsuarioFormPage` usa parámetro `:id` para alta/edición.

2. **Inbox en rutas planas**: `/inbox`, `/inbox/nuevo`, `/inbox/:hiloId` sin layout anidado. Razón: la bandeja y el hilo son vistas conceptualmente distintas y no necesitan un layout compartido con sub-navegación (no hay tabs ni sidebar secundario como en `comision` o `equipos`).

3. **QueryKeys consistentes**: `["inbox"]` para la lista, `["hilo", hiloId]` para el detalle. La mutación de respuesta invalida `["hilo", hiloId]`; la de nuevo hilo invalida `["inbox"]`.

4. **Scroll automático en HiloPage**: `useEffect` con `ref` al último mensaje para hacer scroll automático al montar y al agregar mensajes nuevos (similar a cualquier chat). Se implementa con `useRef` + `element.scrollIntoView({ behavior: "smooth" })`.

5. **Selector de destinatario en nuevo hilo**: Si el endpoint de usuarios del tenant requiere permisos de admin, se debe verificar durante apply qué endpoint expone `inbox.py` para listar usuarios disponibles. Si no existe un endpoint dedicado, se puede usar `GET /api/admin/usuarios` filtrado en el frontend por `id !== currentUser.id`, asumiendo que el usuario que crea hilos tiene acceso a ese endpoint (muchos usuarios del tenant con diferentes roles usan la mensajería interna). Alternativamente, se puede pedir a backend que exponga un endpoint ligero de usuarios. Esta decisión se confirma durante apply.
