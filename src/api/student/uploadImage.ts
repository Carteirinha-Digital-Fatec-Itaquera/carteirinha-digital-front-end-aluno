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
  
  formData.append('file', image);
  
  // formData.append('ra', ra);

  const response = await apiClient(`/estudantes/upload-foto/${ra}`, {
    method: 'POST', 
    body: formData as any,
    authenticated: true,
    multipart: true,
  });

  if (!response.ok) return buildApiError(response, '/estudantes/upload-foto');

  return { ok: '' };
}