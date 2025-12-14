import { Email } from '../../domains/Email';
import type { FirstAccess } from '../../domains/FirstAccess';
import type { ApiError, Ok } from '../../utils/Types'

import { GLOBAL_VAR } from '../config/globalVar'

export async function sendCpf(firstAccess: FirstAccess): Promise<Email | ApiError> {
  const response = await fetch(`${GLOBAL_VAR.BASE_URL}/primeiro-acesso/solicitar-codigo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(firstAccess)
  })

  const data = await response.json()

  if (!response.ok) {

    return {
      code: data.code ?? 'UNKNOWN_ERROR',
      status: data.status ?? response.status.toString(),
      message: data.message ?? 'Erro inesperado',
      timestamp: data.timestamp ?? new Date().toISOString(),
      path: data.path ?? '/autenticacoes/secretaria/logar',
      errorFields: data.errorFields ?? null
    };
  }

  return { email: data.email }
}
