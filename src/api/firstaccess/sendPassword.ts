import type { FirstAccess } from '../../domains/FirstAccess';
import type { ApiError, Ok } from '../../utils/Types';
import { apiClient, buildApiError } from '../config/apiClient';

export async function sendPassword(firstAccess: FirstAccess): Promise<Ok | ApiError> {
  const response = await apiClient('/primeiro-acesso/criar-nova-senha', {
    method: 'PATCH',
    body: firstAccess,
  });

  if (!response.ok) return buildApiError(response, '/primeiro-acesso/criar-nova-senha');

  return { ok: '' };
}
