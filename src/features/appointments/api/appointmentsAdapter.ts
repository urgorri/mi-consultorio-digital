import { bookingApi } from "@/services/api";

export const appointmentsAdapter = {
  getDoctors: async () => {
    const response = await bookingApi.getDoctors();
    return response.data;
  },

  getVisitTypes: async () => {
    const response = await bookingApi.getVisitTypes();
    return response.data.map(type => ({
      id: type.id,
      name: type.name,
      duration: `${type.duration} min`
    }));
  },

  getAvailableSlots: async (professionalId: string, date: string) => {
    const response = await bookingApi.getAvailableSlots(professionalId, date);
    return response.data;
  },

  createBooking: async (data: {
    professionalId: string;
    typeId: string;
    date: string;
    time: string;
    patientData: Record<string, unknown>;
  }) => {
    const response = await bookingApi.createBooking(data as any);
    return response.data;
  }
};
