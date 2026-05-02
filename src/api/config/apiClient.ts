// import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ApiError } from '../../utils/Types';
import { GLOBAL_VAR } from './globalVar';

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

interface RequestOptions {
  method?: HttpMethod;
  body?: object;
  authenticated?: boolean;
  multipart?: boolean;
}

export async function buildApiError(response: Response, path: string): Promise<ApiError> {
  try {
    const data = await response.json();
    return {
      code: data.code ?? 'UNKNOWN_ERROR',
      status: data.status ?? response.status.toString(),
      message: data.message ?? 'Erro inesperado',
      timestamp: data.timestamp ?? new Date().toISOString(),
      path: data.path ?? path,
      errorFields: data.errorFields ?? null,
    };
  } catch {
    return {
      code: 'UNKNOWN_ERROR',
      status: response.status.toString(),
      message: 'Erro inesperado',
      timestamp: new Date().toISOString(),
      path,
      errorFields: null,
    };
  }
}

export async function apiClient(
  path: string,
  { method = 'GET', body, authenticated = false, multipart = false }: RequestOptions = {}
): Promise<Response> {
  try {
  const headers: Record<string, string> = {};

  if (authenticated) {
    const token = localStorage.getItem('token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  // if (authenticated) {
  //   const token = await AsyncStorage.getItem('token');
  //   if (token) headers['Authorization'] = `Bearer ${token}`;
  // }

  if (body && !multipart) {
    headers['Content-Type'] = 'application/json';
  }
  console.log(`${GLOBAL_VAR.BASE_URL}\n ${path}`)

  
  return fetch(`${GLOBAL_VAR.BASE_URL}${path}`, {
    method,
    headers,
    body: multipart ? (body as any) : body ? JSON.stringify(body) : undefined,
  });

  } catch (error) {
    throw {
      code: 'NETWORK_ERROR',
      status: '0',
      message: 'Não foi possível conectar ao servidor',
      timestamp: new Date().toISOString(),
      path,
      errorFields: null,
    } as ApiError;
  }
}
