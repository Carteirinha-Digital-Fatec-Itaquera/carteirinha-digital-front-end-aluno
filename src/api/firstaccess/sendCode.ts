import type { FirstAccess } from '../../domains/FirstAccess';
import type { ApiError, Ok } from '../../utils/Types'

import { GLOBAL_VAR } from '../config/globalVar'

export async function sendCode(firstAccess: FirstAccess): Promise<Ok | ApiError> {
  const response = await fetch(`${GLOBAL_VAR.BASE_URL}/primeiro-acesso/validar-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(firstAccess)
  })

  if (!response.ok) {
    const data = await response.json()

    return {
      code: data.code ?? 'UNKNOWN_ERROR',
      status: data.status ?? response.status.toString(),
      message: data.message ?? 'Erro inesperado',
      timestamp: data.timestamp ?? new Date().toISOString(),
      path: data.path ?? '/primeiro-acesso/validar-token',
      errorFields: data.errorFields ?? null
    };
  }

  return { ok: '' }
}
