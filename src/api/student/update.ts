import { GLOBAL_VAR } from '../config/globalVar';

import { type ApiError, type Ok } from '../../utils/Types';

import type { Student } from '../../domains/Student';

export async function update(ra: string, student: Student): Promise<Ok | ApiError> {
  const token = sessionStorage.getItem('token')
  const response = await fetch(`${GLOBAL_VAR.BASE_URL}/estudantes/atualizar/${ra}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    method: 'PUT',
    body: JSON.stringify(student)
  });

  if (response.ok) {
    return { ok: '' };
  } else {
    const data = await response.json();
    return {
      code: data.code ?? 'UNKNOWN_ERROR',
      status: data.status ?? response.status.toString(),
      message: data.message ?? 'Erro inesperado',
      timestamp: data.timestamp ?? new Date().toISOString(),
      path: data.path ?? `/estudantes/atualizar/${ra}`,
      errorFields: data.errorFields ?? null
    };
  }
}
