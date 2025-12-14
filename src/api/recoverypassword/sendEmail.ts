import type { Email } from '../../domains/Email'

import type { ApiError, Ok } from '../../utils/Types'

import { GLOBAL_VAR } from '../config/globalVar'

export async function sendEmail(email: Email): Promise<Ok | ApiError> {
  const response = await fetch(`${GLOBAL_VAR.BASE_URL}/redefinirsenha/secretaria/solicitarcodigo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(email)
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
