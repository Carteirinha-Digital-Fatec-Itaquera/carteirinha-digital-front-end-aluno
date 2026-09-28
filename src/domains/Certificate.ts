// Contrato V1: backend/src/contracts/v1-events.types.ts (snapshot fornecido).
import type { Uuid, IsoDateTime } from './Event';
export interface Certificate {
  id: Uuid;
  eventId: Uuid;
  verificationCode: string;
  eventTitle: string;
  eventDate: string;
  workload: string;
  issuedAt: IsoDateTime;
  revokedAt: IsoDateTime | null;
}
export interface CertificateSnapshot {
  studentName: string;
  studentRa: string;
  course: string;
  eventTitle: string;
  eventDate: string;
  workload: string;
  speaker: string;
  institution: string;
}
export interface CertificateDetails {
  id: Uuid;
  eventId: Uuid;
  attendanceId: Uuid;
  verificationCode: string;
  payloadSnapshot: CertificateSnapshot;
  issuedAt: IsoDateTime;
  revokedAt: IsoDateTime | null;
}
