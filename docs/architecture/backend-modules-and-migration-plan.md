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
