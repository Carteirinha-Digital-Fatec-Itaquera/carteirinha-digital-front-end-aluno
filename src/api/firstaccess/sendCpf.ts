import type { FirstAccess } from '../../domains/FirstAccess';
import type { ApiError } from '../../utils/Types';
import { Email } from '../../domains/Email';
import { apiClient, buildApiError } from '../config/apiClient';

export async function sendCpf(firstAccess: FirstAccess): Promise<Email | ApiError> {
  const response = await apiClient('/primeiro-acesso/solicitar-codigo', {
    method: 'POST',
    body: firstAccess,
  });

  if (!response.ok) return buildApiError(response, '/primeiro-acesso/solicitar-codigo');

  const data = await response.json();
  return { email: data.email };
}
