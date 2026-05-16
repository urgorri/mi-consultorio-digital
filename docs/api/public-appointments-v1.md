# API pública de citas (`appointments-public` v1)

## Objetivo y alcance
Contrato público versionado para:
- consultar disponibilidad,
- reservar turno,
- consultar estado de reserva,
- confirmar/cancelar turno por token público.

Este contrato se alinea con:
- la estrategia de versionado modular (`/api/{module}/v{major}`),
- RF-03, RF-05 y RF-06 del flujo de citas,
- operaciones existentes de `appointmentsApi`/`bookingApi` en `src/services/api/client.ts`.

Base path (v1): `/api/appointments-public/v1`

## Reglas generales del contrato
- **Versionado**: breaking changes solo en `v2+`.
- **Formato**: `Content-Type: application/json; charset=utf-8`.
- **Timestamps**: ISO-8601 UTC (`2026-05-15T13:00:00.000Z`).
- **Idempotencia**:
  - requerido en creación de reserva (`Idempotency-Key`).
  - recomendado en confirmación/cancelación por token.
- **Correlación**: `X-Correlation-Id` opcional de cliente; servidor lo retorna siempre.

## Seguridad para uso público

### Controles obligatorios
1. **TLS 1.2+** en todo el tráfico.
2. **Token público opaco y de un solo recurso** (1 token = 1 cita).
3. **TTL de token**: 48h por defecto (alineado al mock actual).
4. **Permisos por token**: scope mínimo (`confirm`, `cancel`, `read_status`).
5. **Rate limiting** por IP + fingerprint:
   - `GET /availability`: 60 req/min
   - `POST /reservations`: 10 req/min
   - `GET /reservations/token/{token}`: 30 req/min
   - `POST /reservations/token/{token}/confirm|cancel`: 10 req/min
6. **Protección anti-bot** en reserva: CAPTCHA/reto de riesgo cuando se supere umbral.
7. **No enumeración**: respuestas de token inválido/expirado con mensajes homogéneos.
8. **PII mínima en respuestas públicas**: no exponer historia clínica ni datos sensibles.

### Headers de respuesta recomendados
- `Strict-Transport-Security`
- `Content-Security-Policy`
- `X-Content-Type-Options`
- `X-Frame-Options`
- `Referrer-Policy`

## Trazabilidad mínima por solicitud (auditoría y soporte)
Registrar por cada request:
- `requestId` (interno),
- `correlationId` (cliente o generado),
- `timestamp` inicio/fin,
- endpoint + método + versión,
- resultado HTTP + código de negocio,
- hash del token (nunca token plano),
- `appointmentId` (si aplica),
- IP origen truncada/anónima,
- user-agent,
- motivo de rechazo (rate limit, token expirado, validación, etc.).

Retención sugerida: 90 días operativos + política extendida en bitácora de seguridad.

## Modelo de errores
```json
{
  "success": false,
  "error": {
    "code": "TOKEN_EXPIRED",
    "message": "No fue posible operar la reserva.",
    "details": {
      "correlationId": "corr-123"
    }
  }
}
```

## Endpoints v1
### 1) Consultar disponibilidad
`GET /api/appointments-public/v1/availability`

### 2) Crear reserva
`POST /api/appointments-public/v1/reservations`

### 3) Consultar estado por token
`GET /api/appointments-public/v1/reservations/token/{token}`

### 4) Confirmar por token
`POST /api/appointments-public/v1/reservations/token/{token}/confirm`

### 5) Cancelar por token
`POST /api/appointments-public/v1/reservations/token/{token}/cancel`

## Matriz de mapeo a capa actual (`client.ts`)
- `GET /availability` -> `appointmentsApi.getAvailableSlots` + `bookingApi.getAvailableSlots`
- `POST /reservations` -> `bookingApi.createBooking`
- `GET /reservations/token/{token}` -> `appointmentsApi.getByToken`
- `POST /reservations/token/{token}/confirm` -> `appointmentsApi.update(id, { status: "confirmada" })`
- `POST /reservations/token/{token}/cancel` -> `appointmentsApi.cancel(id)`
- Emisión enlace/token -> `appointmentsApi.generateSignedUrl`
