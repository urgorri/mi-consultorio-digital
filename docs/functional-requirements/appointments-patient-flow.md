# Flujo de Citas del Paciente - Requerimientos Funcionales

## Descripción General
Este documento detalla los requerimientos para el flujo de agendamiento de citas por parte de los pacientes, tanto autenticados como invitados (públicos), y su gestión posterior mediante tokens de acceso sin necesidad de inicio de sesión.

## Requerimientos Funcionales

| ID | Descripción Funcional | Prioridad | Estado | Criterios de Aceptación | Módulos Afectados |
|:---|:---|:---:|:---:|:---|:---|
| RF-01 | Selección de profesional | Alta | Hecho | El usuario debe poder ver una lista de profesionales con su especialidad y ubicación. | Frontend, API Mock |
| RF-02 | Selección de tipo de consulta | Alta | Hecho | El usuario debe elegir entre "Seguimiento" o "Primera vez", visualizando la duración estimada. | Frontend, API Mock |
| RF-03 | Calendario de disponibilidad | Alta | Hecho | El sistema debe mostrar días con horarios disponibles basados en la configuración del profesional. | Frontend, API Mock, Agenda |
| RF-04 | Recolección de datos del paciente | Alta | Hecho | Permite ingresar nombre, apellido, correo, teléfono y motivo. Autocompleta si hay sesión activa. | Frontend |
| RF-05 | Confirmación y resumen | Alta | Hecho | Muestra un resumen de la cita antes de confirmar y un mensaje de éxito tras el proceso. | Frontend, API Mock, Agenda |
| RF-06 | Gestión vía Token Público | Alta | Hecho | Permite confirmar o cancelar la cita mediante un enlace único enviado al correo, sin login. | Frontend, API Mock, Ficha Paciente |
| RF-07 | Contacto vía WhatsApp | Media | Hecho | El flujo debe mostrar botones de contacto directo por WhatsApp con el profesional elegido. | Frontend |

## Módulos Afectados
- **Frontend**: `BookingPage.tsx` (flujo de reserva), `PatientAppointmentDetailPage.tsx` (gestión pública/privada).
- **API Mock**: `bookingApi` y `appointmentsApi` en `client.ts` para persistencia simulada y validación de tokens.
- **Agenda**: Visualización de las citas creadas por pacientes en el calendario del profesional.
- **Ficha Paciente**: Vinculación de nuevas citas con la historia clínica del paciente existente o creación de registro temporal.

## Dependencias
- **AuthContext**: Necesario para el autocompletado de datos en usuarios registrados.
- **date-fns**: Utilizado para cálculos de fechas, ventanas de cancelación y visualización de horarios.
- **Servicio de Notificaciones**: Dependencia teórica para el envío del token de acceso (mockeado en el flujo).

## Riesgos y Mitigación
- **Seguridad de Token Público**:
  - *Riesgo*: Acceso no autorizado a datos de la cita si el enlace se filtra.
  - *Mitigación*: Los tokens tienen fecha de expiración y permisos limitados (solo ver/confirmar/cancelar una cita específica).
- **Compliance y Privacidad**:
  - *Riesgo*: Exposición de datos de salud sin autenticación fuerte.
  - *Mitigación*: El detalle público solo muestra información esencial de la cita, no la historia clínica completa.
- **Spam / Reservas Falsas**:
  - *Riesgo*: Creación masiva de citas por bots al ser un flujo público.
  - *Mitigación*: Implementación futura de CAPTCHA o verificación de teléfono/correo.

## Contrato API pública versionada
- Especificación técnica: `docs/api/public-appointments-v1.md`.
- Cubre disponibilidad, reserva, estado y gestión por token sin login (RF-03, RF-05, RF-06).
- Define controles de seguridad, límites operativos y trazabilidad mínima por solicitud para auditoría/soporte.
