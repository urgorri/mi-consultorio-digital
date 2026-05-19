# Roadmap de Hardening: Módulo de Turnos

Este documento detalla el plan para la transición del módulo de turnos de una implementación mock/local a un backend real con persistencia en PostgreSQL (Neon).

## Fase 1: Extracción de Adapters y Desacoplamiento (Actual)
- **Objetivo**: Separar la lógica de negocio y llamadas a API de la UI.
- **Acciones**:
    - Crear `src/adapters/domains/appointments/`.
    - Mover `appointmentsApi` y `publicAppointmentsApi` desde `src/services/api/client.ts` al nuevo adapter.
    - Asegurar que la UI consuma el adapter y no el cliente monolítico directamente.
- **Criterio de Aceptación**: La aplicación funciona de manera idéntica usando el adapter.

## Fase 2: Backend Standalone (Node.js)
- **Objetivo**: Mover la lógica de los turnos a un servidor dedicado.
- **Acciones**:
    - Inicializar proyecto en `/server` (Node.js/Fastify/Express).
    - Implementar endpoints versionados: `/api/appointments/v1` y `/api/appointments-public/v1`.
    - Migrar `SqliteAppointmentsRepository` al backend para persistencia inicial.
- **Criterio de Aceptación**: El frontend consume el backend real (vía fetch) en lugar de lógica local.

## Fase 3: Persistencia Real (PostgreSQL + Neon)
- **Objetivo**: Reemplazar SQLite por una base de datos distribuida de producción.
- **Acciones**:
    - Configurar instancia de Neon.
    - Implementar `PostgresAppointmentsRepository` usando `pg` o un ORM ligero.
    - Definir migraciones versionadas en `server/migrations/`.
- **Criterio de Aceptación**: Datos persistentes en Neon con integridad referencial.

## Fase 4: Estabilización de Contrato y Testing
- **Objetivo**: Garantizar que el contrato v1 es inmutable y robusto.
- **Acciones**:
    - Implementar tests de contrato automatizados para el API Pública.
    - Añadir pruebas E2E críticas (Playwright):
        - Alta de profesional y configuración de agenda.
        - Reserva de turno desde el portal público.
        - Cancelación y consulta de disponibilidad.
- **Criterio de Aceptación**: Cobertura de tests del 100% en flujos críticos.

## Fase 5: Deprecación de Mocks
- **Objetivo**: Eliminar código de demo del frontend.
- **Acciones**:
    - Eliminar `MockAppointmentsRepository`.
    - Limpiar `mockData.ts` de entidades de turnos.
- **Criterio de Aceptación**: El build de producción no contiene lógica de mocks de turnos.
