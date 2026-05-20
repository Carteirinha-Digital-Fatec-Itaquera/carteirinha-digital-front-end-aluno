import type { Auth } from '../../domains/Auth';
import type { ApiError } from '../../utils/Types';
import { apiClient, buildApiError } from '../config/apiClient';

export interface ResponseAuth {
  message: string;
  mustChangePassword: boolean;
  token?: string;
  accessToken?: string;
}

// 1. Criamos um tipo para o sucesso do login
export interface LoginSuccess {
  token: string;
  mustChangePassword: boolean;
}

// 2. Atualizamos o retorno para Promise<LoginSuccess | ApiError>
export async function login(auth: Auth): Promise<LoginSuccess | ApiError> {
  const response = await apiClient('/autenticacao/login', {
    method: 'POST',
    body: auth,
  });
  
  if (!response.ok) return buildApiError(response, '/autenticacao/login');
  
  try {
    const data: ResponseAuth = await response.json();
    const token = data.token ?? data.accessToken;
    console.log()
    if (!token) {
      return {
        code: 'INVALID_RESPONSE',
        status: '500',
        message: 'Token não retornado pela API',
        timestamp: new Date().toISOString(),
        path: '/autenticacao/login',
        errorFields: null,
      };
    }
    // console.log(`\n\n\n#{data.mustChangePassword}`)
    // console.log(!!data.mustChangePassword)
    return { 
      token, 
      mustChangePassword: !!data.mustChangePassword 
    };
  } catch (error: any) {
    return error;
  }
}