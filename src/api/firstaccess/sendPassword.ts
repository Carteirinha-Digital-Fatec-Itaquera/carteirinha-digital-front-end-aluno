import type { FirstAccess } from '../../domains/FirstAccess';
import type { ApiError, Ok } from '../../utils/Types';
import { apiClient, buildApiError } from '../config/apiClient';

export async function sendPassword(firstAccess: FirstAccess): Promise<Ok | ApiError> {
  const response = await apiClient('/autenticacao/reset-password', {
    method: 'PATCH',
    body: firstAccess,
  });

  if (!response.ok) return buildApiError(response, '/autenticacao/reset-password');

  return { ok: '' };
}
