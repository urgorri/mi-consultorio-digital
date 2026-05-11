import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { mockUsers, mockProfessional } from '@/services/api/mockData'

export const handlers = [
  http.post('/auth/login', async ({ request }) => {
    const { email } = await request.json() as any
    const user = mockUsers.find(u => u.email === email) || mockUsers[0]
    return HttpResponse.json({ success: true, data: { user } })
  }),
  http.get('/auth/me', () => {
    return HttpResponse.json({ success: true, data: mockProfessional })
  }),
  http.post('/auth/logout', () => {
    return HttpResponse.json({ success: true, data: { message: "Sesión cerrada." } })
  }),
  http.post('/auth/refresh', () => {
    return HttpResponse.json({ success: true, data: { user: mockProfessional } })
  }),
  http.get('/auth/sessions', () => {
    return HttpResponse.json({ success: true, data: [] })
  }),
  http.post('/auth/register/patient', async ({ request }) => {
    const data = await request.json() as any
    const user = { ...data, id: `pat-${Date.now()}`, role: 'paciente', status: 'activo', createdAt: new Date().toISOString() }
    return HttpResponse.json({ success: true, data: { user } })
  }),
  http.post('/auth/register/professional', async ({ request }) => {
    const data = await request.json() as any
    const user = { ...data, id: `prof-${Date.now()}`, role: 'profesional', status: 'activo', createdAt: new Date().toISOString() }
    return HttpResponse.json({ success: true, data: { user } })
  }),
  http.post('/auth/email/verify', async ({ request }) => {
    const { code } = await request.json() as any
    if (code === '123456') {
      return HttpResponse.json({
        success: true,
        data: { user: { ...mockProfessional, emailVerifiedAt: new Date().toISOString() } }
      })
    }
    return HttpResponse.json({ success: false, message: 'Código inválido' }, { status: 400 })
  }),
  http.post('/auth/email/resend', async () => {
    return HttpResponse.json({ success: true, data: { message: 'Código reenviado' } })
  }),
]

export const server = setupServer(...handlers)
