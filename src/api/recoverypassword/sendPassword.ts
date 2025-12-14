import type { RecoveryPassword } from '../../domains/RecoveryPassword'

import type { ApiError, Ok } from '../../utils/Types'

import { GLOBAL_VAR } from '../config/globalVar'

export async function sendPassword(recovery: RecoveryPassword): Promise<Ok | ApiError> {
  const response = await fetch(`${GLOBAL_VAR.BASE_URL}/redefinirsenha/secretaria/criarnovasenha`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(recovery)
  })

  if (!response.ok) {
    const data = await response.json()

    return {
      code: data.code ?? 'UNKNOWN_ERROR',
      status: data.status ?? response.status.toString(),
      message: data.message ?? 'Erro inesperado',
      timestamp: data.timestamp ?? new Date().toISOString(),
      path: data.path ?? '/autenticacoes/secretaria/logar',
      errorFields: data.errorFields ?? null
    };
  }

  return { ok: '' }
}
