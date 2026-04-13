import type { FirstAccess } from '../../domains/FirstAccess';
import type { ApiError, Ok } from '../../utils/Types';
import { apiClient, buildApiError } from '../config/apiClient';

export async function sendCode(firstAccess: FirstAccess): Promise<Ok | ApiError> {
  const response = await apiClient('/primeiro-acesso/validar-token', {
    method: 'POST',
    body: firstAccess,
  });

  if (!response.ok) return buildApiError(response, '/primeiro-acesso/validar-token');

  return { ok: '' };
}
