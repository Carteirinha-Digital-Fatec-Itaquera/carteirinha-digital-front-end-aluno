import type { FirstAccess } from '../../domains/FirstAccess';
import type { ApiError, Ok } from '../../utils/Types';
import { apiClient, buildApiError } from '../config/apiClient';

export async function sendCode(firstAccess: FirstAccess): Promise<Ok | ApiError> {
  const response = await apiClient('/autenticacao/verificar-codigo', {
    method: 'POST',
    body: firstAccess,
  });

  if (!response.ok) return buildApiError(response, '/autenticacao/verificar-codigo');

  return { ok: '' };
}
