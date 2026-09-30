import { apiClient, buildApiError } from '../config/apiClient';
import type { Attendance } from '../../domains/Attendance';

export type ScanResponse = {
  success: true;
  type: 'CHECK_IN' | 'CHECK_OUT';
  eventTitle: string;
  timestamp: string;
  status: 'CHECKED_IN' | 'CONFIRMED';
  message: string;
} | {
  success: false;
  code: 'ALREADY_CHECKED_IN' | 'ALREADY_CHECKED_OUT';
  message: string;
  timestamp: string;
};

// Apenas formato: claims NÃO são autenticadas aqui. Validação é do servidor.
export function presenceEventId(token: string): string | null {
  try {
    if (token.length > 8192 || !/^[\w-]+\.[\w-]+\.[\w-]+$/.test(token)) return null;
    const segment = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const claims = JSON.parse(atob(segment.padEnd(Math.ceil(segment.length / 4) * 4, '=')));
    return typeof claims.eventId === 'string' &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(claims.eventId) &&
      ['CHECK_IN', 'CHECK_OUT'].includes(claims.checkpoint) &&
      Number.isInteger(claims.checkpointVersion) && claims.checkpointVersion > 0 &&
      typeof claims.jti === 'string' && claims.jti.length > 0 &&
      Number.isFinite(claims.iat) && Number.isFinite(claims.exp) ? claims.eventId : null;
  } catch { return null; }
}

export interface QrPreviewResponse {
  event: {
    id: string;
    title: string;
    speaker: string;
    location: string;
  };
  checkpoint: {
    type: 'CHECK_IN' | 'CHECK_OUT';
  };
  expiresAt: string;
  serverTime: string;
}

export function parsePresenceUrlOrToken(raw: string): { type: 'reference'; reference: string } | { type: 'jwt'; token: string } | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  try {
    if (trimmed.startsWith('/p/')) {
      const ref = trimmed.slice(3).split('?')[0].split('#')[0];
      if (/^[A-Za-z0-9_-]{10,64}$/.test(ref)) {
        return { type: 'reference', reference: ref };
      }
    }

    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      const url = new URL(trimmed);
      const isAllowedHost =
        url.hostname === 'carteirinha-digital-front-end-aluno.vercel.app' ||
        url.hostname === 'localhost' ||
        url.hostname === '127.0.0.1' ||
        (typeof window !== 'undefined' && url.hostname === window.location.hostname);

      if (isAllowedHost && url.pathname.startsWith('/p/')) {
        const ref = url.pathname.slice(3).split('/')[0];
        if (/^[A-Za-z0-9_-]{10,64}$/.test(ref)) {
          return { type: 'reference', reference: ref };
        }
      }
      return null;
    }
  } catch {
    // Não é URL válida, prossegue para checar JWT
  }

  if (presenceEventId(trimmed)) {
    return { type: 'jwt', token: trimmed };
  }

  return null;
}

export async function getAttendanceQrPreview(
  reference: string,
  signal?: AbortSignal,
): Promise<QrPreviewResponse> {
  if (!localStorage.getItem('token')) throw { status: '401' };
  const response = await apiClient(`/attendances/qr/${encodeURIComponent(reference)}`, {
    authenticated: true,
    signal,
  });
  if (!response.ok) {
    throw {
      ...(await buildApiError(response, `/attendances/qr/${reference}`)),
      status: String(response.status),
    };
  }
  const data: QrPreviewResponse = await response.json();
  return data;
}

export async function confirmAttendanceReference(
  qrReference: string,
  signal?: AbortSignal,
): Promise<ScanResponse> {
  if (!localStorage.getItem('token')) throw { status: '401' };
  const response = await apiClient('/attendances/scan-reference', {
    method: 'POST',
    authenticated: true,
    body: { qrReference },
    signal,
  });
  if (!response.ok) {
    throw {
      ...(await buildApiError(response, '/attendances/scan-reference')),
      status: String(response.status),
    };
  }
  const data: ScanResponse = await response.json();
  if (
    !data ||
    typeof data.message !== 'string' ||
    !Number.isFinite(Date.parse(data.timestamp)) ||
    !(
      (data.success === true &&
        typeof data.eventTitle === 'string' &&
        ((data.type === 'CHECK_IN' && data.status === 'CHECKED_IN') ||
          (data.type === 'CHECK_OUT' && data.status === 'CONFIRMED'))) ||
      (data.success === false &&
        ['ALREADY_CHECKED_IN', 'ALREADY_CHECKED_OUT'].includes(data.code))
    )
  ) {
    throw { code: 'INVALID_RESPONSE' };
  }
  return data;
}

export async function scanAttendance(qrToken: string, signal?: AbortSignal): Promise<ScanResponse> {
  if (!presenceEventId(qrToken)) throw { code: 'INVALID_QR_TOKEN' };
  if (!localStorage.getItem('token')) throw { status: '401' };
  const response = await apiClient('/attendances/scan', {
    method: 'POST', authenticated: true, body: { qrToken }, signal,
  });
  if (!response.ok) throw { ...await buildApiError(response, '/attendances/scan'), status: String(response.status) };
  const data: ScanResponse = await response.json();
  if (!data || typeof data.message !== 'string' || !Number.isFinite(Date.parse(data.timestamp)) ||
    !(data.success === true && typeof data.eventTitle === 'string' &&
      ((data.type === 'CHECK_IN' && data.status === 'CHECKED_IN') ||
       (data.type === 'CHECK_OUT' && data.status === 'CONFIRMED')) ||
      data.success === false && ['ALREADY_CHECKED_IN', 'ALREADY_CHECKED_OUT'].includes(data.code))) {
    throw { code: 'INVALID_RESPONSE' };
  }
  return data;
}

// Consulta real mesmo quando a listagem está em modo de demonstração.
export async function getScanAttendance(eventId: string, signal: AbortSignal): Promise<Attendance | undefined> {
  const response = await apiClient('/attendances/me', { authenticated: true, signal });
  if (!response.ok) throw await buildApiError(response, '/attendances/me');
  const data: Attendance[] = await response.json();
  return data.find(item => item.eventId === eventId);
}
