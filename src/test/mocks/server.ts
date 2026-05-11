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
]

export const server = setupServer(...handlers)
