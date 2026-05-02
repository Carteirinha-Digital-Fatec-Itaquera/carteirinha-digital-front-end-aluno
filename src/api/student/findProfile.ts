import type { Student } from '../../domains/Student';
import type { ApiError } from '../../utils/Types';
import { apiClient, buildApiError } from '../config/apiClient';

export async function findProfile(): Promise<Student | ApiError> {
  const token = localStorage.getItem('token');

  if (!token) {
    return {
      code: 'NO_TOKEN',
      status: '401',
      message: 'Usuário não autenticado',
      timestamp: new Date().toISOString(),
      path: '/estudantes/encontrar-por-ra',
      errorFields: null,
    };
  }

  const payloadBase64 = token.split('.')[1];
  const payload = JSON.parse(atob(payloadBase64));
  const ra = payload.sub;

  const response = await apiClient(`/estudantes/encontrar-por-ra/${ra}`, {
    method: 'GET',
    authenticated: true,
  });

  if (!response.ok) return buildApiError(response, `/estudantes/encontrar-por-ra/${ra}`);

  const data = await response.json();
  return data;
}