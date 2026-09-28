// Contrato V1: backend/src/contracts/v1-events.types.ts (snapshot fornecido).
import type { Event } from '../domains/Event';

// Exemplos de fases distintas do evento, conforme o contrato V1.
export const eventsMock: Event[] = [
  {
    "id": "11111111-1111-4111-8111-111111111111",
    "title": "Arquitetura de Software na Prática",
    "description": "Palestra de demonstração do contrato.",
    "speaker": "Docente Exemplo",
    "location": "Auditório Exemplo",
    "startsAt": "2026-10-05T19:00:00.000Z",
    "endsAt": "2026-10-05T21:00:00.000Z",
    "workloadMinutes": 120,
    "status": "SCHEDULED",
    "certificateEnabled": true,
    "checkpoints": [
      {
        "id": "22222222-2222-4222-8222-222222222222",
        "eventId": "11111111-1111-4111-8111-111111111111",
        "type": "CHECK_IN",
        "isOpen": false,
        "version": 1,
        "openedAt": null,
        "closedAt": null
      },
      {
        "id": "33333333-3333-4333-8333-333333333333",
        "eventId": "11111111-1111-4111-8111-111111111111",
        "type": "CHECK_OUT",
        "isOpen": false,
        "version": 1,
        "openedAt": null,
        "closedAt": null
      }
    ],
    "createdAt": "2026-09-24T18:00:00.000Z",
    "updatedAt": "2026-09-24T18:00:00.000Z"
  }
];
