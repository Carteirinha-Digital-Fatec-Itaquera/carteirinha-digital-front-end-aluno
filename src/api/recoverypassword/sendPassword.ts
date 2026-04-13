import type { RecoveryPassword } from '../../domains/RecoveryPassword';
import type { ApiError, Ok } from '../../utils/Types';
import { apiClient, buildApiError } from '../config/apiClient';

export async function sendPassword(recovery: RecoveryPassword): Promise<Ok | ApiError> {
  const response = await apiClient('/redefinirsenha/estudante/criarnovasenha', {
    method: 'PATCH',
    body: recovery,
  });

  if (!response.ok) return buildApiError(response, '/redefinirsenha/estudante/criarnovasenha');

  return { ok: '' };
}
