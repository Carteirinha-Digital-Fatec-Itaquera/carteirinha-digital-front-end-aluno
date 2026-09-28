// Contrato V1: backend/src/contracts/v1-events.types.ts (snapshot fornecido).
import type { Certificate } from '../domains/Certificate';

// Exemplos de fases distintas do evento, conforme o contrato V1.
export const certificatesMock: Certificate[] = [
  {
    "id": "55555555-5555-4555-8555-555555555555",
    "eventId": "11111111-1111-4111-8111-111111111111",
    "verificationCode": "FATEC-EVT-7K3M9Q2X4P6R8T1V",
    "eventTitle": "Arquitetura de Software na Prática",
    "eventDate": "2026-10-05",
    "workload": "2 horas",
    "issuedAt": "2026-10-05T21:05:00.000Z",
    "revokedAt": null
  }
];
