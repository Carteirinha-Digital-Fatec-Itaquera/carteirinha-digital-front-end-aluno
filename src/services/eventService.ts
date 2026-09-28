import { apiClient, buildApiError } from '../api/config/apiClient';
import type { Event } from '../domains/Event';
import type { Attendance } from '../domains/Attendance';
import type { Certificate } from '../domains/Certificate';

export const useMockEvents = import.meta.env.VITE_USE_MOCK === 'true';

async function get<T>(path: string): Promise<T> {
  const response = await apiClient(path, { authenticated: true });
  if (!response.ok) throw await buildApiError(response, path);
  return response.json() as Promise<T>;
}

export const eventService = {
  async getEvents(): Promise<Event[]> {
    if (useMockEvents) {
      const { eventsMock } = await import('../mocks/events.mock');
      return structuredClone(eventsMock);
    }
    return get<Event[]>('/events');
  },
  async getMyAttendances(): Promise<Attendance[]> {
    if (useMockEvents) {
      const { attendanceMock } = await import('../mocks/attendance.mock');
      return structuredClone(attendanceMock);
    }
    return get<Attendance[]>('/attendances/me');
  },
  async getMyCertificates(): Promise<Certificate[]> {
    if (useMockEvents) {
      const { certificatesMock } = await import('../mocks/certificates.mock');
      return structuredClone(certificatesMock);
    }
    return get<Certificate[]>('/certificates/me');
  },
};
