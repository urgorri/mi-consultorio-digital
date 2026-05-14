import { http, HttpResponse } from 'msw'
import { mockUsers, mockProfessional } from '@/services/api/mockData'
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
  http.get('/auth/me', () => {
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
]
