import { Appointment, ApiResponse } from "@/services/api/types";
import {
  PUBLIC_APPOINTMENTS_API_V1,
  authorize
} from "@/services/api/client";
import { mockProfessional } from "@/services/api/mockData";
import {
  validateRequest,
  availabilityQuerySchema,
  validateResponse,
  availabilityResponseSchema,
  reservationsRequestSchema,
  reservationResponseSchema,
  tokenStatusResponseSchema,
  tokenActionResponseSchema,
  API_SEMVER,
  API_DEPRECATION_POLICY,
} from "@/services/api/publicAppointmentsContract";

const API_BASE_URL = import.meta.env.VITE_APPOINTMENTS_API_URL || '';

async function fetchApi<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  if (!API_BASE_URL && !import.meta.env.DEV) {
     throw new Error("VITE_APPOINTMENTS_API_URL is required for production hardening.");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || `API error: ${response.status}`);
  }
  return response.json();
}

// ===== APPOINTMENTS =====
export const appointmentsApi = {
  async list(params?: { date?: string; patientId?: string; status?: string; professionalId?: string }) {
    const queryParams = { ...params };
    if (!queryParams.professionalId) {
       queryParams.professionalId = mockProfessional.id;
    }
    const query = new URLSearchParams(queryParams as any).toString();
    return fetchApi<Appointment[]>(`/api/appointments/v1?${query}`);
  },
  async getById(id: string) {
    return fetchApi<Appointment>(`/api/appointments/v1/${id}`);
  },
  async getStatusHistory(id: string) {
    return fetchApi<any[]>(`/api/appointments/v1/${id}/history`);
  },
  async create(data: Partial<Appointment>) {
    await authorize(mockProfessional.id, data.patientId, data.clinicId || null, "profesional", "turnos", "turnos.manage");
    return fetchApi<Appointment>(`/api/appointments/v1`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async update(id: string, data: Partial<Appointment>) {
    return fetchApi<Appointment>(`/api/appointments/v1/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
  async cancel(id: string, reason: string, actor?: string, metadata?: any) {
     return this.update(id, { status: 'cancelled', notes: reason } as any);
  },
  async transitionStatus(id: string, status: string, reason: string, actor?: string, metadata?: any) {
     return this.update(id, { status, notes: reason } as any);
  },
  async getAvailableSlots(professionalId: string, date: string) {
    return fetchApi<string[]>(`/api/appointments/v1/availability?professionalId=${professionalId}&date=${date}`);
  },
  async generateSignedUrl(appointmentId: string) {
    return fetchApi<{ url: string }>(`/api/appointments/v1/${appointmentId}/signed-url`, { method: 'POST' });
  },
  async getByToken(token: string) {
    return fetchApi<Appointment>(PUBLIC_APPOINTMENTS_API_V1.reservationByToken(token));
  }
};

export const publicAppointmentsApi = {
  meta: {
    basePath: PUBLIC_APPOINTMENTS_API_V1.basePath,
    semver: API_SEMVER,
    deprecation: API_DEPRECATION_POLICY,
  },
  async availability(query: { professionalId: string; date: string }) {
    const input = validateRequest(availabilityQuerySchema, query);
    const response = await fetchApi<string[]>(`${PUBLIC_APPOINTMENTS_API_V1.availability}?professionalId=${input.professionalId}&date=${input.date}`);
    return validateResponse(availabilityResponseSchema, response);
  },
  async reservations(payload: any) {
    const input = validateRequest(reservationsRequestSchema, payload);
    const response = await fetchApi<any>(PUBLIC_APPOINTMENTS_API_V1.reservations, {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return validateResponse(reservationResponseSchema, response);
  },
  async tokenStatus(token: string) {
    const response = await fetchApi<any>(PUBLIC_APPOINTMENTS_API_V1.reservationByToken(token));
    return validateResponse(tokenStatusResponseSchema, response);
  },
  async confirm(token: string) {
    const response = await fetchApi<any>(PUBLIC_APPOINTMENTS_API_V1.confirmByToken(token), { method: 'POST' });
    return validateResponse(tokenActionResponseSchema, response);
  },
  async cancel(token: string) {
    const response = await fetchApi<any>(PUBLIC_APPOINTMENTS_API_V1.cancelByToken(token), { method: 'POST' });
    return validateResponse(tokenActionResponseSchema, response);
  },
};

// Re-export bookingApi for UI compatibility
export const bookingApi = {
  async getDoctors() {
    return fetchApi<any[]>(`/api/booking/v1/doctors`);
  },
  async getVisitTypes() {
    return fetchApi<any[]>(`/api/booking/v1/visit-types`);
  },
  async createBooking(data: any) {
    return fetchApi<any>(`/api/booking/v1/create`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async getAvailableSlots(professionalId: string, date: string) {
    return fetchApi<string[]>(`/api/booking/v1/availability?professionalId=${professionalId}&date=${date}`);
  }
};
