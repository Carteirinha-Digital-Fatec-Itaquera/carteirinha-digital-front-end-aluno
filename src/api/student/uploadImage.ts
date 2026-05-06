import type { ApiError, Ok } from '../../utils/Types';
import { apiClient, buildApiError } from '../config/apiClient';

export async function uploadImage(image: File | null, ra: string): Promise<Ok | ApiError> {
  if (!image) {
    return {
      code: 'IMAGE_NOT_FOUND',
      status: '404',
      message: 'Você precisa enviar uma imagem.',
      timestamp: new Date().toISOString(),
      path: '/estudantes/upload-foto', 
      errorFields: null,
    };
  }

  const formData = new FormData();
  formData.append('file', image); // Deve ser 'file' para bater com o FileInterceptor
  formData.append('ra', ra);      // O colega definiu que o RA vem no Body

  const response = await apiClient('/estudantes/upload-foto', { // Rota limpa, sem o /:ra
    method: 'POST', 
    body: formData as any,
    authenticated: true,
    multipart: true,
  });

  if (!response.ok) return buildApiError(response, '/estudantes/upload-foto');

  return { ok: '' };
}