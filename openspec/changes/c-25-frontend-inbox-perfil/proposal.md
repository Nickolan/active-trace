# Proposal: c-25-frontend-inbox-perfil

## Why

El backend de **mensajería interna** (bandeja inbox — C-20) y **perfil propio** (C-20) está completamente implementado con sus routers operativos, pero no existe ninguna interfaz frontend para acceder a estas funcionalidades. Los usuarios no tienen forma de:

- Consultar ni enviar mensajes internos entre colegas del tenant
- Ver ni editar su propio perfil (nombre, datos bancarios, modalidad de cobro, etc.)

Este change cierra esas dos brechas completando el frontend que consume endpoints ya existentes.

## What Changes

Implementar los módulos frontend `perfil` e `inbox` reutilizando la arquitectura feature-based establecida en C-22/C-23/C-24: TanStack Query para data fetching, React Hook Form + Zod para formularios, Tailwind CSS + shadcn/ui para estilos, y los shared components ya existentes (`FilterableTable`, `ConfirmDialog`, `FormField`, `Input`, `Button`, `ErrorMessage`, `LoadingSpinner`).

El change es **puro frontend** — consume endpoints ya existentes; no se tocan modelos, servicios, repositorios ni routers del backend.

## Capabilities

### New Capabilities

_(ninguna — todo el comportamiento ya está especificado en las capabilities existentes del C-20)_

### Modified Capabilities

- **`perfil-propio`**: completar el frontend; implementar la página de visualización del perfil propio con los datos del usuario autenticado (incluyendo campos PII enmascarados), el formulario de edición parcial (campos editables según spec) y el enlace de cierre de sesión explícito que reutiliza `POST /api/auth/logout`.

- **`mensajeria-interna`**: completar el frontend; implementar la bandeja de hilos (inbox) con indicador de mensajes no leídos, la vista de un hilo individual con su lista de mensajes ordenados cronológicamente, el formulario de respuesta, y la pantalla de composición de un nuevo hilo hacia otro usuario del tenant.

## Impact

- **Frontend**: 2 nuevos feature modules (`perfil`, `inbox`) + entradas de navegación en el menú lateral (sección "Principal" para "Mi Perfil" y "Mensajes")
- **Backend**: Sin cambios — todos los endpoints ya existen (`/api/perfil`, `/api/inbox`)
- **Governance**: BAJO — frontend que consume endpoints existentes; el backend ya está implementado y archivado (C-20)
- **Riesgo**: Los schemas de respuesta deben coincidir con lo que devuelven realmente los endpoints
  - **Mitigación**: Leer los schemas Pydantic reales de `perfil.py` e `inbox.py` durante apply antes de escribir los tipos TypeScript/Zod
