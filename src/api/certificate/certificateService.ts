import { apiClient, buildApiError } from '../config/apiClient';
import type { Certificate, CertificateDetails, CertificateVerification } from '../../domains/Certificate';

export const useMockCertificates = import.meta.env.VITE_USE_MOCK === 'true';
const isObject = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object';
const strings = (value: Record<string, unknown>, keys: string[]) => keys.every(key => typeof value[key] === 'string' && String(value[key]).trim().length > 0);
const timestamp = (value: unknown) => typeof value === 'string' && Number.isFinite(Date.parse(value));
const dateOnly = (value: unknown) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
const metadata = (value: Record<string, unknown>) => strings(value, ['id', 'eventId', 'verificationCode']) &&
  timestamp(value.issuedAt) && (value.revokedAt === null || timestamp(value.revokedAt));
const invalid = () => ({ code: 'INVALID_RESPONSE', message: 'Resposta de certificado inválida.' });

async function get(path: string, authenticated: boolean, signal?: AbortSignal): Promise<Response> {
  if (authenticated && !localStorage.getItem('token')) throw { status: '401' };
  const response = await apiClient(path, { authenticated, signal, cache: 'no-store' });
  if (!response.ok) throw { ...await buildApiError(response, path), status: String(response.status) };
  return response;
}

export const certificateService = {
  async list(signal?: AbortSignal): Promise<Certificate[]> {
    if (useMockCertificates) return structuredClone((await import('../../mocks/certificates.mock')).certificatesMock);
    const data: unknown = await (await get('/certificates/me', true, signal)).json();
    if (!Array.isArray(data) || !data.every(item => isObject(item) && metadata(item) &&
      strings(item, ['eventTitle', 'workload']) && dateOnly(item.eventDate))) throw invalid();
    return data as Certificate[];
  },
  async details(id: string, signal?: AbortSignal): Promise<CertificateDetails> {
    if (useMockCertificates) {
      const { certificateDetailsMock } = await import('../../mocks/certificates.mock');
      if (id !== certificateDetailsMock.id) throw { status: '404' };
      return structuredClone(certificateDetailsMock);
    }
    const data: unknown = await (await get('/certificates/' + encodeURIComponent(id), true, signal)).json();
    if (!isObject(data) || data.id !== id || !metadata(data) || !strings(data, ['attendanceId']) ||
      !isObject(data.payloadSnapshot) || !strings(data.payloadSnapshot, ['studentName', 'studentRa', 'course', 'eventTitle', 'workload', 'speaker', 'institution']) ||
      !dateOnly(data.payloadSnapshot.eventDate)) throw invalid();
    return data as unknown as CertificateDetails;
  },
  async pdf(id: string, signal?: AbortSignal): Promise<Blob> {
    if (useMockCertificates) throw { code: 'MOCK_PDF_UNAVAILABLE' };
    const response = await get('/certificates/' + encodeURIComponent(id) + '/pdf', true, signal);
    if (response.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase() !== 'application/pdf') throw invalid();
    const blob = await response.blob();
    if (!(await blob.slice(0, 5).text()).startsWith('%PDF-')) throw invalid();
    return blob;
  },
  async verify(code: string, signal?: AbortSignal): Promise<CertificateVerification> {
    // Nunca confirma autenticidade por fixtures, nem em VITE_USE_MOCK.
    const data: unknown = await (await get('/certificates/verify/' + encodeURIComponent(code), false, signal)).json();
    if (!isObject(data) || data.code !== code || !(data.valid === true &&
      strings(data, ['studentName', 'eventTitle', 'workload', 'institution']) && dateOnly(data.eventDate) && timestamp(data.issuedAt) ||
      data.valid === false && data.revoked === true && typeof data.message === 'string')) throw invalid();
    return data as unknown as CertificateVerification;
  },
};

export function publicCertificateUrl(code: string, origin: string): string {
  const base = new URL(import.meta.env.VITE_PUBLIC_APP_URL || origin);
  if (!['http:', 'https:'].includes(base.protocol) || base.username || base.password) throw new Error('URL pública inválida');
  return new URL('/certificado/verificar/' + encodeURIComponent(code), base.origin).href;
}

export function certificateFilename(code: string): string {
  return 'certificado-' + code.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 100) + '.pdf';
}

export function savePdfBlob(blob: Blob, filename: string): string {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = filename;
  anchor.hidden = true;

  document.body.append(anchor);

  try {
    anchor.click();
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  } finally {
    anchor.remove();
  }

  return url;
}

export function releasePdfUrl(url: string) {
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}