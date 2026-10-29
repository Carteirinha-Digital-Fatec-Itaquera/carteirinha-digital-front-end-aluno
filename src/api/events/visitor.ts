export interface Series {
  cpfRequired: boolean;
  id: string;
  title: string;
  slug: string;
  retentionAt: string;
  courses: string[];
  events: {
    id: string;
    title: string;
    description?: string | null;
    speaker: string;
    location: string;
    startsAt: string;
    endsAt?: string | null;
    workloadMinutes?: number | null;
    status?: string;
  }[];
}
export interface Visitor {
  id: string;
  name: string;
  course: string | null;
  seriesId: string;
  retentionAt: string;
  hasCpf?: boolean;
}
export function validVisitorCpf(value: string) {
  if (!/^(?:\d{11}|\d{3}\.\d{3}\.\d{3}-\d{2})$/.test(value)) return false;
  const cpf = value.replace(/\D/g, '');
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  for (let digit = 9; digit <= 10; digit++) {
    let sum = 0;
    for (let i = 0; i < digit; i++) sum += Number(cpf[i]) * (digit + 1 - i);
    if (((sum * 10) % 11) % 10 !== Number(cpf[digit])) return false;
  }
  return true;
}
export interface PublicQr {
  available?: boolean;
  permanent?: boolean;
  event: {
    attendanceMode?: string;
    id: string;
    title: string;
    description?: string | null;
    speaker: string;
    location: string;
    startsAt?: string;
    endsAt?: string;
    workloadMinutes?: number;
    status?: string;
  };
  checkpoint: { type: string };
  seriesId: string | null;
  visitorsAllowed: boolean;
  locationRequired: boolean;
  expiresAt: string;
  serverTime: string;
}
export interface VisitorAttendance {
  id: string;
  eventId: string;
  checkInAt: string | null;
  checkOutAt: string | null;
  status: 'CHECKED_IN' | 'CONFIRMED';
  event: {
    id: string;
    title: string;
    speaker: string;
    location: string;
    startsAt: string;
    endsAt: string;
    workloadMinutes?: number;
  };
}
export interface VisitorCertificate {
  id: string;
  verificationCode: string;
  revokedAt: string | null;
  event: { title: string };
  artifact: { state: string } | null;
}
export class VisitorApiError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}
export async function visitorRequest<T>(
  path: string,
  body?: unknown,
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch(`/api/${path}`, {
    method: body === undefined ? "GET" : "POST",
    credentials: "same-origin",
    cache: "no-store",
    headers:
      body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new VisitorApiError(
      typeof data.message === "string"
        ? data.message
        : "Não foi possível concluir. Tente novamente.",
      response.status,
      typeof data.code === "string" ? data.code : undefined,
    );
  }
  return response.json();
}
export async function locate() {
  if (!navigator.geolocation)
    throw new VisitorApiError("Localização indisponível. Procure a Secretaria presencialmente.", 400, "LOCATION_UNAVAILABLE");
  const position = await new Promise<GeolocationPosition>((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(
      resolve,
      (geoError) => {
        let code = 'LOCATION_UNAVAILABLE';
        let msg = 'Não foi possível obter sua localização. Permita o acesso ou procure a Secretaria presencialmente.';
        if (geoError && geoError.code === 1) {
          code = 'PERMISSION_DENIED';
          msg = 'Permita o acesso à localização nas configurações do navegador e tente novamente.';
        } else if (geoError && geoError.code === 3) {
          code = 'TIMEOUT';
          msg = 'Não conseguimos obter sua localização agora. Confira o GPS e a conexão.';
        }
        reject(new VisitorApiError(msg, 400, code));
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 },
    ),
  );
  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    accuracy: position.coords.accuracy,
    timestamp: position.timestamp,
  };
}
