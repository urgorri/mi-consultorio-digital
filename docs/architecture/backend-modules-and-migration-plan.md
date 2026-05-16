# Backend modularization, API versioning and migration roadmap

## 1) Backend modules

Se define una arquitectura modular por bounded context:

- `auth`: login, MFA, sesiones, refresh/revoke de tokens, lockout policies.
- `identity`: onboarding KYC, verificación documental y estado de identidad.
- `patients`: datos demográficos, contacto y estado administrativo del paciente.
- `professionals`: perfiles profesionales, matrículas/licencias, disponibilidad.
- `appointments`: agenda clínica, disponibilidad y ciclo de vida de citas públicas/privadas.
- `consents`: consentimiento informado, autorizaciones de acceso y revocaciones.
- `clinical-records`: consultas, diagnósticos, evolución y adjuntos clínicos.
- `audit`: bitácora inmutable de eventos de seguridad y acceso.
- `billing`: planes, suscripciones, facturación y estado de cobro.

## 2) API versioning and integration events

### Versioning strategy

- Versionado por módulo con prefijo `v{major}` en path.
- Breaking changes solo en major; cambios aditivos en minor sin romper contrato.
- Header opcional `X-API-Version` para observabilidad/telemetría.

Ejemplos:

- `/api/auth/v1/login`
- `/api/identity/v1/verifications/{id}`
- `/api/patients/v1/patients/{patientId}`
- `/api/professionals/v1/licenses/{licenseId}`
- `/api/appointments/v1/appointments/{appointmentId}`
- `/api/appointments-public/v1/reservations/token/{token}`
- `/api/consents/v1/documents/{documentId}/acceptances`
- `/api/clinical-records/v1/consultations/{consultationId}`
- `/api/audit/v1/events`
- `/api/billing/v1/subscriptions/{subscriptionId}`

### Canonical integration events

- `auth.session.started`
- `auth.session.terminated`
- `identity.verification.completed`
- `identity.verification.failed`
- `patients.profile.updated`
- `professionals.license.invalidated`
- `consent.accepted`
- `consent.revoked`
- `clinical_record.created`
- `clinical_record.amended`
- `audit.event.recorded`
- `billing.subscription.updated`
- `billing.invoice.overdue`

Contrato base recomendado para eventos:

```json
{
  "eventId": "uuid",
  "eventType": "consent.revoked",
  "occurredAt": "2026-05-14T00:00:00.000Z",
  "aggregateId": "consent-123",
  "aggregateType": "consent",
  "version": 1,
  "payload": {},
  "metadata": {
    "correlationId": "req-123",
    "actorId": "user-123",
    "tenantId": "clinic-001"
  }
}
```

## 3) Frontend adapters by domain

Se migra consumo a adapters por dominio (`src/adapters/domains/*`) para desacoplar UI del cliente monolítico (`src/services/api/client.ts`).

- Beneficio: migración backend incremental sin refactor masivo de pantallas.
- Estrategia: cada adapter encapsula contrato de un módulo y expone funciones estables.

## 4) Authorization matrix and role/state checks

Matriz formal en `docs/architecture/authorization-matrix.md` y validación automatizada en `src/services/authorization/permissionMatrix.test.ts`.

## 5) Incremental migration roadmap

### Phase 0 (actual)

- Cliente monolítico + mocks con APIs mezcladas por dominio.

### Phase 1

- Introducir adapters de dominio que envuelvan endpoints actuales.
- No cambiar firmas consumidas por UI (compatibilidad total).

### Phase 2

- Exponer endpoints modulares versionados en backend (`/api/{module}/v1`).
- Activar feature flags para enrutar adapter por tenant/clinic.

### Phase 3

- Publicar eventos de integración y consumidores internos.
- Habilitar dual-write/dual-read temporal en módulos críticos (`consents`, `clinical-records`).

### Phase 4

- Ejecutar pruebas de regresión funcional por flujo crítico (login, agenda, historia clínica, consentimientos).
- Cortar tráfico legado por porcentaje hasta 100%.

### Phase 5

- Retirar cliente monolítico y contratos legacy.
- Congelar `v1`, planificar `v2` solo con ADR y changelog.


## 6) Data strategy for preproduction SQLite (`appointments` module)

Objetivo: usar SQLite en preproductivo con un esquema que ya sea compatible con el modelo final del módulo `appointments`, evitando refactors estructurales al pasar a proveedor cloud (PostgreSQL administrado u otro).

### Design principles (schema-stable first)

- Diseñar tablas con nombres, claves y relaciones definitivas desde ahora; evitar tablas temporales “de transición”.
- Incluir claves técnicas UUID (`TEXT`) y claves de negocio explícitas para facilitar migración y trazabilidad.
- Declarar `created_at`, `updated_at`, y `deleted_at` (soft delete) en entidades transaccionales que forman parte del ciclo de vida de turnos.
- Modelar estado con columnas validadas por `CHECK` y no por tablas auxiliares si el catálogo es finito y estable.
- Evitar features específicas de motor en la capa de dominio (SQL portable); reservar optimizaciones engine-specific para migraciones de infraestructura.

### Transactional data that MUST persist in DB

Persistir en SQLite (y luego cloud) únicamente datos operativos que cambian por interacción real del sistema:

- `appointments`: turno, paciente/profesional, inicio/fin, modalidad, estado, origen de reserva, timestamps de negocio.
- `appointment_status_history`: historial de cambios de estado (quién, cuándo, motivo) para auditoría funcional.
- `availability_blocks`: bloques de disponibilidad/indisponibilidad administrados por profesional/centro.
- `reschedule_requests` (si aplica al flujo): solicitud de cambio con estado y resolución.
- `appointment_notifications` (solo si hay idempotencia/reintento): registro de envíos para no duplicar recordatorios críticos.

Criterio: si el dato impacta trazabilidad, conciliación operativa o recuperación ante fallas, debe persistirse.

### Fixed catalogs that MUST live in code (not tables)

No crear tablas para catálogos de baja cardinalidad y alta estabilidad. Definirlos en código tipado (constantes/enums) y versionarlos con el backend:

- Estados de turno permitidos y transiciones válidas (`scheduled`, `confirmed`, `completed`, `cancelled`, `no_show`).
- Canales de origen (`web`, `staff`, `api_partner`) cuando el set esté cerrado.
- Motivos de cancelación internos predefinidos (si son taxonomía estable de producto).
- Modalidad (`in_person`, `telehealth`) si no depende de parametrización por tenant.

Regla práctica para minimizar tablas no esenciales:

- Si cambia por configuración frecuente de negocio por tenant => tabla.
- Si es semántica de dominio estable y compartida en todos los tenants => código.

### SQLite preproduction guardrails to match cloud target

- Activar `PRAGMA foreign_keys = ON` en todas las conexiones y tests.
- Usar índices equivalentes a los que existirán en cloud (`professional_id + starts_at`, `patient_id + starts_at`, `status + starts_at`).
- Guardar fechas en UTC ISO-8601 y normalizar en capa de aplicación; no depender de funciones de zona horaria del motor.
- Evitar JSON opaco para campos críticos de consulta; preferir columnas explícitas.
- Definir migraciones idempotentes y forward-only con versionado estricto.

## 7) Operational migration guide: SQLite preprod -> cloud provider

Objetivo operativo: ejecutar el pase a proveedor cloud sin cambios funcionales en frontend ni en contratos de adapters de dominio.

### Step-by-step playbook

1. **Schema parity freeze**
   - Congelar DDL del módulo `appointments` en SQLite y validar que refleja el contrato final.
   - Prohibir nuevas tablas de catálogo salvo excepción aprobada en ADR.

2. **Compatibility validation**
   - Ejecutar suite de migraciones sobre instancia limpia y snapshot realista de preprod.
   - Verificar constraints, índices y cardinalidades esperadas.

3. **Data classification check**
   - Confirmar que solo datos transaccionales están en DB.
   - Mover catálogos estables a código antes del corte si quedó alguno en tablas legacy.

4. **Cloud bootstrap**
   - Provisionar base cloud, aplicar mismas migraciones y crear observabilidad (latencia, locks, errores SQL).
   - Configurar backups, retención y política de restore testada.

5. **Controlled cutover (no frontend changes)**
   - Mantener mismos endpoints `/api/appointments/v1/*` y contratos de respuesta.
   - Cambiar únicamente configuración de conexión en backend (feature flag/env).
   - Ejecutar smoke/regresión de flujos críticos de agenda y cancelación/reprogramación.

6. **Post-cutover verification**
   - Monitorear errores, tiempos de respuesta y consistencia de estados por al menos 1 ciclo operativo completo.
   - Mantener rollback plan documentado (revert de connection target + replay de eventos pendientes).

### Non-functional acceptance criteria

- Cero cambios en componentes frontend para operar contra cloud.
- Cero cambios de contrato en adapters de dominio.
- Migraciones reproducibles en ambientes limpios (determinísticas).
- Integridad referencial y reglas de estado equivalentes entre SQLite y cloud.

