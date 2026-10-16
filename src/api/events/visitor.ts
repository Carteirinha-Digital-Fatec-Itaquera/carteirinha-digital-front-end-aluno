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
  }[];
}
export interface Visitor {
  id: string;
  name: string;
  course: string | null;
  seriesId: string;
  retentionAt: string;
}
export interface PublicQr {
  event: {
    id: string;
    title: string;
    description?: string | null;
    speaker: string;
    location: string;
    startsAt?: string;
    endsAt?: string;
    workloadMinutes?: number;
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
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
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
    );
  }
  return response.json();
}
export async function locate() {
  if (!navigator.geolocation)
    throw Object.assign(
      new Error(
        "Localização indisponível. Procure a Secretaria presencialmente.",
      ),
      { code: "LOCATION_UNAVAILABLE" },
    );
  const position = await new Promise<GeolocationPosition>((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(
      resolve,
      () =>
        reject(
          Object.assign(
            new Error(
              "Não foi possível obter sua localização. Permita o acesso ou procure a Secretaria presencialmente.",
            ),
            { code: "LOCATION_UNAVAILABLE" },
          ),
        ),
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
