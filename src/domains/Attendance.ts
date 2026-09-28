// Contrato V1: backend/src/contracts/v1-events.types.ts (snapshot fornecido).
import type { Uuid, IsoDateTime } from './Event';
export type AttendanceStatus = 'CHECKED_IN' | 'CONFIRMED';
// GET /attendances/me: não expõe os dados pessoais da visão da secretaria.
export interface Attendance {
  id: Uuid;
  eventId: Uuid;
  eventTitle: string;
  checkInAt: IsoDateTime | null;
  checkOutAt: IsoDateTime | null;
  status: AttendanceStatus;
}
