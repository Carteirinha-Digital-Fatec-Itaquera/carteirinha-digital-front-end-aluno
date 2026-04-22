import type { ApiError, Ok } from '../../utils/Types';
import { apiClient, buildApiError } from '../config/apiClient';

export async function sendCode(email: string, code: string): Promise<Ok | ApiError> {
  const path = `/redefinirsenha/estudante/validartoken/${email}/${code}`;

  const response = await apiClient(path, {
    method: 'GET',
  });

  if (!response.ok) return buildApiError(response, path);

  return { ok: '' };
}
