import type { Auth } from '../../domains/Auth';
import type { ApiError, Token } from '../../utils/Types';
import { apiClient, buildApiError } from '../config/apiClient';

export async function login(auth: Auth): Promise<Token | ApiError> {
  const response = await apiClient('/autenticacao/login', {
    method: 'POST',
    body: auth,
  });

  if (!response.ok) return buildApiError(response, '/autenticacao/login');

  const data = await response.json();
  return { token: data.token };
}
