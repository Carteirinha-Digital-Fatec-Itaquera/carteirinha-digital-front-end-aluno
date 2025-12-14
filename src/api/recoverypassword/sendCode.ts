import type { ApiError, Ok } from '../../utils/Types'

import { GLOBAL_VAR } from '../config/globalVar'

export async function sendCode(email: string, code: string): Promise<Ok | ApiError> {
  const response = await fetch(`${GLOBAL_VAR.BASE_URL}/redefinirsenha/secretaria/validartoken/${email}/${code}`, {
    method: 'GET',
  })

  if (!response.ok) {
    const data = await response.json()

    return {
      code: data.code ?? 'UNKNOWN_ERROR',
      status: data.status ?? response.status.toString(),
      message: data.message ?? 'Erro inesperado',
      timestamp: data.timestamp ?? new Date().toISOString(),
      path: data.path ?? `/redefinirsenha/secretaria/validartoken/${email}/${code}`,
      errorFields: data.errorFields ?? null
    };
  }

  return { ok: '' }
}
