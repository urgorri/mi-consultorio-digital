# Healthcare Platform MVP

Sistema de gestión clínica modular con enfoque en seguridad, trazabilidad y experiencia del paciente.

## 🚀 Guía de Inicio Rápido (Local MVP)

### Requisitos
- **Node.js**: v22.5.0 o superior (necesario para el módulo nativo `node:sqlite`).
- **NPM**: v10+ (o Bun v1.1+).

### Instalación
```bash
npm install
```

### Configuración de Entorno
Crea o edita tu archivo `.env` (o usa variables de entorno):

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `VITE_APPOINTMENTS_REPOSITORY` | Motor de persistencia para turnos | `mock` (en memoria) |
| `VITE_APPOINTMENTS_DB_PATH` | Ruta del archivo SQLite (si se usa `sqlite`) | `./data/appointments.sqlite` |
| `VITE_ALLOW_PUBLIC_HOST` | Permitir acceso desde la red local | `false` |

### Ejecución con SQLite
Para persistencia local duradera durante el desarrollo:
1. Asegúrate de que el directorio `./data` exista.
2. Ejecuta:
```bash
VITE_APPOINTMENTS_REPOSITORY=sqlite npm run dev
```

---

## ✅ Validación Manual del MVP
Sigue estos pasos para validar el flujo completo:

1. **Registro Profesional**: Ve a `/registro/profesional` y crea una cuenta.
2. **Configurar Horarios**: Accede a **Configuración > Horarios** para definir tu disponibilidad semanal.
3. **Ver Agenda**: Revisa que los bloques horarios aparezcan en la sección **Agenda**.
4. **Gestión de Turnos**:
   - Crea un turno manualmente desde la agenda.
   - Cancela un turno y verifica el historial de estados.
5. **Reserva Pública**:
   - Ve a la página de reserva pública (`/agendar`).
   - Selecciona profesional, fecha y hora.
   - Completa los datos del paciente y confirma.
6. **Autogestión del Paciente**:
   - Copia el "Link de Autogestión" generado tras la reserva.
   - Abre el link en modo incógnito para confirmar o cancelar el turno como paciente sin login.

---

## 🔌 API Pública (v1)
Contrato para integraciones externas y landing pages.

**Base Path**: `/api/appointments-public/v1`

### Endpoints Principales
- `GET /availability`: Consultar slots disponibles por profesional y fecha.
- `POST /reservations`: Crear una reserva (soporta datos de paciente nuevo o ID existente).
- `GET /reservations/token/{token}`: Ver estado de una cita mediante token opaco.
- `POST /reservations/token/{token}/confirm`: Confirmar cita.
- `POST /reservations/token/{token}/cancel`: Cancelar cita.

### Ejemplos `curl`

**Consultar disponibilidad:**
```bash
curl -X GET "http://localhost:8080/api/appointments-public/v1/availability?professionalId=prof-1&date=2026-05-20"
```

**Crear reserva desde Landing:**
```bash
curl -X POST http://localhost:8080/api/appointments-public/v1/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "professionalId": "prof-1",
    "date": "2026-05-20",
    "time": "10:00",
    "endTime": "10:30",
    "patientData": {
      "firstName": "Juan",
      "lastName": "Perez",
      "email": "juan@example.com",
      "phone": "+541122334455",
      "documentNumber": "20123456",
      "documentType": "dni"
    }
  }'
```

---

## 🏗️ Plan de Producción

### Infraestructura y Persistencia
- **Base de Datos**: Migración de SQLite a **PostgreSQL administrado (Neon)**.
- **Backend**: Separación del frontend (Vite) y backend (Node/Express o similar) para escalabilidad independiente.
- **Secretos**: Uso de AWS Secrets Manager o Doppler para claves de API, hashes y credenciales.

### Seguridad y Escalabilidad
- **TLS**: Forzar TLS 1.2+ en todos los endpoints.
- **Rate Limiting**: Implementar límites por IP y fingerprint (60 req/min para lectura, 10 req/min para escritura en API pública).
- **Observabilidad**: Integración con Sentry (errores) y Grafana/Prometheus (métricas de negocio).
- **Backups**: Política de Point-in-Time Recovery (PITR) de 30 días en Neon.

---

## 📋 Checklist de Despliegue y Rollback

### Despliegue
- [ ] Ejecutar `npm run build` y validar bundles.
- [ ] Correr migraciones de base de datos (`forward-only`).
- [ ] Verificar variables de entorno de producción.
- [ ] Comprobar conectividad con servicios externos (Email, SMS, KYC).
- [ ] Ejecutar Smoke Tests en ambiente de Staging.

### Rollback
- [ ] Revertir versión de la imagen/bundle.
- [ ] Ejecutar script de compensación de datos si hubo cambios de esquema no-compatibles.
- [ ] Notificar a través de canales de incidentes si el downtime superó el SLA.

---

## 📖 Documentación Relacionada
- **Contrato API (Markdown)**: `docs/api/public-appointments-v1.md`
- **Especificación OpenAPI**: `docs/api/openapi-appointments-public-v1.yaml`
- **Estrategia de Migración**: `docs/architecture/backend-modules-and-migration-plan.md`
