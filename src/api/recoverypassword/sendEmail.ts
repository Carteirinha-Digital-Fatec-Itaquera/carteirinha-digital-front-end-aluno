import type { ApiError, Ok } from '../../utils/Types';
import { apiClient, buildApiError } from '../config/apiClient';

export interface ForgotPasswordPayload {
  email: string;
  type: 'student' | 'secretary';
}

export async function sendEmail(data: ForgotPasswordPayload): Promise<Ok | ApiError> {
  
  const response = await apiClient('/autenticacao/forgot-password', {
    method: 'POST',
    body: data,
  });

  if (!response.ok) return buildApiError(response, '/autenticacao/forgot-password');

  return { ok: '' };
}