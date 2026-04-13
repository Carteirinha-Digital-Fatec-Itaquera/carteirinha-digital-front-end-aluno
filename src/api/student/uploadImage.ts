import type { ApiError, Ok } from '../../utils/Types';
import { apiClient, buildApiError } from '../config/apiClient';

export async function uploadImage(image: string | null): Promise<Ok | ApiError> {
  if (!image) {
    return {
      code: 'IMAGE_NOT_FOUND',
      status: '404',
      message: 'Você precisa enviar uma imagem.',
      timestamp: new Date().toISOString(),
      path: '/estudantes/enviar-imagem',
      errorFields: null,
    };
  }

  const formData = new FormData();
  formData.append('file', {
    uri: image,
    name: 'image.jpg',
    type: 'image/jpeg',
  } as any);

  const response = await apiClient('/estudantes/enviar-imagem', {
    method: 'PATCH',
    body: formData as any,
    authenticated: true,
    multipart: true,
  });

  if (!response.ok) return buildApiError(response, '/estudantes/enviar-imagem');

  return { ok: '' };
}
