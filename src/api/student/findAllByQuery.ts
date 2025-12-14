import type { Student } from "../../domains/Student";

import { GLOBAL_VAR } from "../config/globalVar"

export async function findAllByQuery(query: string): Promise<Student[] | undefined> {
  const response = await fetch(`${GLOBAL_VAR.BASE_URL}/estudantes/encontrar-todos?query=${query}`, {
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem('token')}`
    },
    method: 'GET',
  })

  if (!response.ok) {
    console.error(`Algo errado na requisição: ${response.status}`);
  }

  const data = await response.json();
  return data;
}