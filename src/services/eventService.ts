import { apiClient, buildApiError } from '../api/config/apiClient';
import type { Event } from '../domains/Event';
import type { Attendance } from '../domains/Attendance';
import type { Certificate } from '../domains/Certificate';

export const useMockEvents = import.meta.env.VITE_USE_MOCK === 'true';

async function get<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await apiClient(path, { authenticated: true, signal });
  if (!response.ok) throw await buildApiError(response, path);
  return response.json() as Promise<T>;
}

export const eventService = {
  async getEvents(signal?: AbortSignal): Promise<Event[]> {
    if (useMockEvents) {
      const { eventsMock } = await import('../mocks/events.mock');
      // Mesma visibilidade da listagem do aluno no backend.
      return structuredClone(eventsMock.filter(event => event.status === 'IN_PROGRESS' ||
        (event.status === 'SCHEDULED' && Date.parse(event.startsAt) > Date.now())));
    }
    return get<Event[]>('/events', signal);
  },
  async getEventById(id: string, signal?: AbortSignal): Promise<Event> {
    if (useMockEvents) {
      const { eventsMock } = await import('../mocks/events.mock');
      const event = eventsMock.find(item => item.id === id);
      if (!event) throw { status: '404', message: 'Evento não encontrado' };
      return structuredClone(event);
    }
    return get<Event>('/events/' + encodeURIComponent(id), signal);
  },
  async getMyAttendances(signal?: AbortSignal): Promise<Attendance[]> {
    if (useMockEvents) {
      const { attendanceMock } = await import('../mocks/attendance.mock');
      return structuredClone(attendanceMock);
    }
    return get<Attendance[]>('/attendances/me', signal);
  },
  async getMyCertificates(): Promise<Certificate[]> {
    if (useMockEvents) {
      const { certificatesMock } = await import('../mocks/certificates.mock');
      return structuredClone(certificatesMock);
    }
    return get<Certificate[]>('/certificates/me');
  },
};
