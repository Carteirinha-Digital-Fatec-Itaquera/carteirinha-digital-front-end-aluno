import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Student } from "../../domains/Student";

import { GLOBAL_VAR } from "../config/globalVar"

export async function findProfile(): Promise<Student | undefined> {
  const token = await AsyncStorage.getItem('token')
  const response = await fetch(`${GLOBAL_VAR.BASE_URL}/estudantes/buscar-carteirinha`, {
    headers: {
      Authorization: `Bearer ${token}`
    },
    method: 'GET',
  })

  if (!response.ok) {
    console.error(`Algo errado no response: ${response.status}`);
  }

  const data = await response.json();
  return data;
}
