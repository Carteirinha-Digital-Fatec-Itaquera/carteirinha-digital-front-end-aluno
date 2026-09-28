import type { Event } from '../domains/Event';

// Cenários explícitos de desenvolvimento, no formato do Contrato V1.
// O primeiro evento é a fase concluída do exemplo oficial, coerente com o certificado.
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
    "status": "COMPLETED",
    "certificateEnabled": true,
    "checkpoints": [
      {
        "id": "11111111-1111-4111-8111-111111111111",
        "eventId": "11111111-1111-4111-8111-111111111111",
        "type": "CHECK_IN",
        "isOpen": false,
        "version": 2,
        "openedAt": "2026-10-05T18:55:00.000Z",
        "closedAt": "2026-10-05T21:02:00.000Z"
      },
      {
        "id": "11111111-1111-4111-8111-111111111112",
        "eventId": "11111111-1111-4111-8111-111111111111",
        "type": "CHECK_OUT",
        "isOpen": false,
        "version": 2,
        "openedAt": "2026-10-05T18:55:00.000Z",
        "closedAt": "2026-10-05T21:02:00.000Z"
      }
    ],
    "createdAt": "2026-09-24T18:00:00.000Z",
    "updatedAt": "2026-10-05T18:55:00.000Z"
  },
  {
    "id": "77777777-7777-4777-8777-777777777770",
    "title": "Carreiras em tecnologia: primeiros passos",
    "description": "Palestra de demonstração do contrato.",
    "speaker": "Docente Exemplo",
    "location": "Auditório Exemplo",
    "startsAt": "2026-11-12T19:00:00.000Z",
    "endsAt": "2026-11-12T21:00:00.000Z",
    "workloadMinutes": 120,
    "status": "SCHEDULED",
    "certificateEnabled": true,
    "checkpoints": [
      {
        "id": "77777777-7777-4777-8777-777777777771",
        "eventId": "77777777-7777-4777-8777-777777777770",
        "type": "CHECK_IN",
        "isOpen": false,
        "version": 1,
        "openedAt": null,
        "closedAt": null
      },
      {
        "id": "77777777-7777-4777-8777-777777777772",
        "eventId": "77777777-7777-4777-8777-777777777770",
        "type": "CHECK_OUT",
        "isOpen": false,
        "version": 1,
        "openedAt": null,
        "closedAt": null
      }
    ],
    "createdAt": "2026-09-24T18:00:00.000Z",
    "updatedAt": "2026-11-12T18:55:00.000Z"
  },
  {
    "id": "88888888-8888-4888-8888-888888888880",
    "title": "Inteligência artificial aplicada ao dia a dia",
    "description": "Palestra de demonstração do contrato.",
    "speaker": "Docente Exemplo",
    "location": "Auditório Exemplo",
    "startsAt": "2026-10-06T19:00:00.000Z",
    "endsAt": "2026-10-06T21:00:00.000Z",
    "workloadMinutes": 120,
    "status": "IN_PROGRESS",
    "certificateEnabled": true,
    "checkpoints": [
      {
        "id": "88888888-8888-4888-8888-888888888881",
        "eventId": "88888888-8888-4888-8888-888888888880",
        "type": "CHECK_IN",
        "isOpen": true,
        "version": 2,
        "openedAt": "2026-10-06T18:55:00.000Z",
        "closedAt": null
      },
      {
        "id": "88888888-8888-4888-8888-888888888882",
        "eventId": "88888888-8888-4888-8888-888888888880",
        "type": "CHECK_OUT",
        "isOpen": false,
        "version": 1,
        "openedAt": null,
        "closedAt": null
      }
    ],
    "createdAt": "2026-09-24T18:00:00.000Z",
    "updatedAt": "2026-10-06T18:55:00.000Z"
  },
  {
    "id": "99999999-9999-4999-8999-999999999990",
    "title": "Design de produtos digitais acessíveis",
    "description": "Palestra de demonstração do contrato.",
    "speaker": "Docente Exemplo",
    "location": "Auditório Exemplo",
    "startsAt": "2026-10-06T19:00:00.000Z",
    "endsAt": "2026-10-06T21:00:00.000Z",
    "workloadMinutes": 120,
    "status": "IN_PROGRESS",
    "certificateEnabled": true,
    "checkpoints": [
      {
        "id": "99999999-9999-4999-8999-999999999991",
        "eventId": "99999999-9999-4999-8999-999999999990",
        "type": "CHECK_IN",
        "isOpen": false,
        "version": 2,
        "openedAt": "2026-10-06T18:55:00.000Z",
        "closedAt": "2026-10-06T19:10:00.000Z"
      },
      {
        "id": "99999999-9999-4999-8999-999999999992",
        "eventId": "99999999-9999-4999-8999-999999999990",
        "type": "CHECK_OUT",
        "isOpen": true,
        "version": 2,
        "openedAt": "2026-10-06T21:00:00.000Z",
        "closedAt": null
      }
    ],
    "createdAt": "2026-09-24T18:00:00.000Z",
    "updatedAt": "2026-10-06T18:55:00.000Z"
  }
];
