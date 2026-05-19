import { http, HttpResponse } from 'msw'
import { mockUsers, mockProfessional, mockAppointmentTypes, mockAppointments } from '@/services/api/mockData'
import { decrypt } from "../../lib/crypto";
import { SECURITY_HEADERS } from "@/services/api/client";

const secureResponse = (data: any, options: any = {}) => {
  return HttpResponse.json(data, {
    ...options,
    headers: {
      ...options.headers,
      ...SECURITY_HEADERS,
    },
  });
};

export const handlers = [
  http.post('/auth/login', async ({ request }) => {
    const { email } = await request.json() as any
    const user = mockUsers.find(u => decrypt(u.email) === email);
    if (!user) return secureResponse({ success: false, message: "Credenciales inválidas" }, { status: 401 });
    const mfaRequired = user.role === "admin" || (user.role === "profesional" && email.includes("mfa"));
    return secureResponse({ success: true, data: { user, mfaRequired } })
  }),
  http.get('/auth/me', ({ request }) => {
    if (request.headers.get('x-msw-force-401') === 'true') {
      return secureResponse({ success: false, message: "No autenticado" }, { status: 401 });
    }
    return secureResponse({ success: true, data: mockProfessional })
  }),
  http.post('/auth/logout', () => {
    return secureResponse({ success: true, data: { message: "Sesión cerrada." } })
  }),
  http.post('/auth/refresh', () => {
    return secureResponse({ success: true, data: { user: mockProfessional } })
  }),
  http.get('/auth/sessions', () => {
    return secureResponse({ success: true, data: [] })
  }),
  http.post('/auth/register/patient', async ({ request }) => {
    const data = await request.json() as any
    const user = { ...data, id: `pat-${Date.now()}`, role: 'paciente', status: 'activo', createdAt: new Date().toISOString() }
    return secureResponse({ success: true, data: { user } })
  }),
  http.post('/auth/register/professional', async ({ request }) => {
    const data = await request.json() as any
    const user = { ...data, id: `prof-${Date.now()}`, role: 'profesional', status: 'activo', createdAt: new Date().toISOString() }
    return secureResponse({ success: true, data: { user } })
  }),
  http.post('/auth/email/verify', async ({ request }) => {
    const { code } = await request.json() as any
    if (code === '123456') {
      return secureResponse({
        success: true,
        data: { user: { ...mockProfessional, emailVerifiedAt: new Date().toISOString() } }
      })
    }
    return secureResponse({ success: false, message: 'Código inválido' }, { status: 400 })
  }),
  http.post('/auth/email/resend', async () => {
    return secureResponse({ success: true, data: { message: 'Código reenviado' } })
  }),
  http.post('/auth/recover-password', async () => {
    return secureResponse({ success: true, data: { message: "Si el correo existe, recibirá instrucciones pronto." } });
  }),
  http.post('/auth/reset-password', async ({ request }) => {
    const { token } = await request.json() as any;
    if (token === 'expired-token') return secureResponse({ success: false, message: "Token expirado" }, { status: 400 });
    if (token === 'invalid-token') return secureResponse({ success: false, message: "Token inválido" }, { status: 400 });
    return secureResponse({ success: true, data: { message: "Contraseña actualizada correctamente." } });
  }),
  http.post('/auth/mfa/verify', async ({ request }) => {
    const { code } = await request.json() as any;
    if (code === '123456') return secureResponse({ success: true, data: { user: mockUsers[0] } });
    return secureResponse({ success: false, message: "Código MFA incorrecto" }, { status: 400 });
  }),
  http.post('/auth/mfa/toggle', async () => {
    return secureResponse({ success: true, data: { secret: "JBSWY3DPEHPK3PXP", qrCode: "data:image/png;base64,..." } });
  }),

  // Appointments API v1 Handlers
  http.get('/api/appointments/v1', () => {
    return secureResponse({ success: true, data: [] });
  }),
  http.get('/api/appointments/v1/:id', ({ params }) => {
    const { id } = params;
    const appointment = mockAppointments.find(a => a.id === id);
    if (!appointment) return secureResponse({ success: false, message: "Cita no encontrada" }, { status: 404 });
    return secureResponse({ success: true, data: appointment });
  }),
  http.post('/api/appointments/v1', async ({ request }) => {
    const data = await request.json() as any;
    const id = data.id || `apt-${Date.now()}`;
    return secureResponse({ success: true, data: { ...data, id, correlationId: `corr-${id}` } });
  }),
  http.patch('/api/appointments/v1/:id', async ({ request, params }) => {
    const data = await request.json() as any;
    return secureResponse({ success: true, data: { id: params.id, ...data, correlationId: `corr-patch-${params.id}` } });
  }),
  http.get('/api/appointments/v1/:id/history', ({ params }) => {
    return secureResponse({ success: true, data: [
      {
        id: 'hist-1',
        appointmentId: params.id,
        timestamp: new Date().toISOString(),
        previousStatus: null,
        newStatus: 'scheduled',
        actor: { id: 'prof-1', name: 'Dr. Test', role: 'profesional' },
        reason: 'Cita agendada',
        correlationId: `corr-${params.id}`
      }
    ] });
  }),
  http.get('/api/appointments/v1/availability', () => {
    return secureResponse({ success: true, data: ["09:00", "10:00"] });
  }),
  http.post('/api/appointments/v1/:id/signed-url', ({ params }) => {
    return secureResponse({ success: true, data: { url: `http://localhost:3000/citas/v/token-${params.id}` } });
  }),

  // Public Appointments API v1 Handlers
  http.get('/api/appointments-public/v1/availability', () => {
    return secureResponse({ success: true, data: ["09:00", "10:00"] });
  }),
  http.post('/api/appointments-public/v1/reservations', async ({ request }) => {
    const data = await request.json() as any;
    return secureResponse({ success: true, data: { id: `apt-${Date.now()}`, status: 'pending' } });
  }),
  http.get('/api/appointments-public/v1/reservations/token/:token', ({ params }) => {
    if (params.token === 'invalid-token') {
      return secureResponse({ success: false, error: { code: 'TOKEN_EXPIRED', message: 'Token no válido' } }, { status: 404 });
    }
    return secureResponse({ success: true, data: { id: 'apt-1', status: 'pending' } });
  }),
  http.post('/api/appointments-public/v1/reservations/token/:token/confirm', () => {
    return secureResponse({ success: true, data: { id: 'apt-1', status: 'confirmed' } });
  }),
  http.post('/api/appointments-public/v1/reservations/token/:token/cancel', () => {
    return secureResponse({ success: true, data: { id: 'apt-1', status: 'cancelled' } });
  }),

  // Booking API Handlers
  http.get('/api/booking/v1/doctors', () => {
    return secureResponse({ success: true, data: [mockProfessional] });
  }),
  http.get('/api/booking/v1/visit-types', () => {
    return secureResponse({ success: true, data: mockAppointmentTypes });
  }),
  http.post('/api/booking/v1/create', async ({ request }) => {
     return secureResponse({ success: true, data: { id: 'apt-public', status: 'pending' } });
  }),
  http.get('/api/booking/v1/availability', () => {
    return secureResponse({ success: true, data: ["09:00", "10:00", "11:00"] });
  }),
]
