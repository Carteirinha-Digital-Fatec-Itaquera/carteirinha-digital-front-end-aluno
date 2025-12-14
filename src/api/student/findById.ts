import type { Student } from "../../domains/Student";

import { GLOBAL_VAR } from "../config/globalVar"

export async function findById(id: string): Promise<Student | undefined> {
  const response = await fetch(`${GLOBAL_VAR.BASE_URL}/estudantes/encontrar-por-id/${id}`, {
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem('token')}`
    },
    method: 'GET',
  })

  if (!response.ok) {
    console.error(`Algo errado no response: ${response.status}`);
  }

  const data = await response.json();
  return data;
}