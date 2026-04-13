import type { Email } from '../../domains/Email';
import type { ApiError, Ok } from '../../utils/Types';
import { apiClient, buildApiError } from '../config/apiClient';

export async function sendEmail(email: Email): Promise<Ok | ApiError> {
  const response = await apiClient('/redefinirsenha/estudante/solicitarcodigo', {
    method: 'POST',
    body: email,
  });

  if (!response.ok) return buildApiError(response, '/redefinirsenha/estudante/solicitarcodigo');

  return { ok: '' };
}
