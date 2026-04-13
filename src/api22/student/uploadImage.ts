import { GLOBAL_VAR } from '../config/globalVar';
import { ApiError, Ok } from '../../utils/Types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function uploadImage(image: string | null): Promise<Ok | ApiError> {
    const token = await AsyncStorage.getItem('token')

    if (image == null || !image) {
        return {
            code: 'IMAGE_NOT_FOUND',
            status: '404',
            message: 'Você precisa enviar uma imagem.',
            timestamp: new Date().toISOString(),
            path: `/estudantes/enviar-imagem`,
            errorFields: null
        };
    }

    const formData = new FormData();

    formData.append('file', {
        uri: image,
        name: 'image.jpg',
        type: 'image/jpeg'
    } as any);

    const response = await fetch(`${GLOBAL_VAR.BASE_URL}/estudantes/enviar-imagem`, {
        headers: {
            Authorization: `Bearer ${token}`
        },
        method: 'PATCH',
        body: formData
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
            path: data.path ?? `/estudantes/enviar-imagem`,
            errorFields: data.errorFields ?? null
        };
    }
}