import type { Student } from '../../domains/Student';
import type { ApiError } from '../../utils/Types';
import { apiClient, buildApiError } from '../config/apiClient';

export async function findProfile(): Promise<Student | ApiError> {
  const response = await apiClient('/estudantes/encontrar-por-ra/:ra', {
    method: 'GET',
    authenticated: true,
  });

  if (!response.ok) return buildApiError(response, '/estudantes/encontrar-por-ra/:ra');

  const data = await response.json();
  return data;
}
