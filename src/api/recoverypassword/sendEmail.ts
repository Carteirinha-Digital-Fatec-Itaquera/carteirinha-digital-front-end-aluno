import type { ApiError, Ok } from '../../utils/Types';
import { apiClient, buildApiError } from '../config/apiClient';

// 1. Criamos um tipo exato para o que o seu NestJS espera receber
export interface ForgotPasswordPayload {
  email: string;
  type: 'student' | 'secretary';
}

// 2. Trocamos o tipo "Email" pelo nosso novo payload
export async function sendEmail(data: ForgotPasswordPayload): Promise<Ok | ApiError> {
  
  // 3. Atualizamos a rota para o seu endpoint correto do NestJS (@Post('forgot-password'))
  const response = await apiClient('/autenticacao/forgot-password', {
    method: 'POST',
    body: data,
  });

  if (!response.ok) return buildApiError(response, '/autenticacao/forgot-password');

  return { ok: '' };
}