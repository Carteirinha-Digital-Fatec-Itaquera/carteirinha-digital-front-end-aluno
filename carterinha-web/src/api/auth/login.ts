import type { Auth } from '../../domains/Auth';
import type { ApiError, Token } from '../../utils/Types';
import { apiClient, buildApiError } from '../config/apiClient';

export interface ResponseAuth {
  message:string,
  mustChangePassword: boolean,
  token?: string
  accessToken?: string;
}



export async function login(auth: Auth): Promise<Token | ApiError> {
  console.log(`Segundo passo : \n\n${auth.email} \n\n${auth.password}`)
  const response = await apiClient('/autenticacao/login', {
    method: 'POST',
    body: auth,
  });
  console.log(response)
  // console.log(`\n ${response.message}\n ${response.mustChangePassword},  \n${response.token}`)
  
  if (!response.ok) return buildApiError(response, '/autenticacao/login');
  try {
    const data:ResponseAuth = await response.json();
    console.log(`\n ${data.message}\n ${data.mustChangePassword},  \n${data.token}`)
    
    const token = data.token ?? data.accessToken;

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

    return {token};
  } catch (error: any) {
    return error;
  }
}
