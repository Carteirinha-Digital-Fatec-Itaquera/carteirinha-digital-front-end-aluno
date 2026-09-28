// Contrato V1: backend/src/contracts/v1-events.types.ts (snapshot fornecido).
import type { Attendance } from '../domains/Attendance';

// Exemplos de fases distintas do evento, conforme o contrato V1.
export const attendanceMock: Attendance[] = [
  {
    "id": "44444444-4444-4444-8444-444444444444",
    "eventId": "11111111-1111-4111-8111-111111111111",
    "eventTitle": "Arquitetura de Software na Prática",
    "checkInAt": "2026-10-05T18:55:10.000Z",
    "checkOutAt": "2026-10-05T21:02:00.000Z",
    "status": "CONFIRMED"
  }
];
