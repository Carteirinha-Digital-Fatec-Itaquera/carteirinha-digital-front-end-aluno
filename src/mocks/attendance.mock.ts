import type { Attendance } from '../domains/Attendance';

// Histórico de desenvolvimento coerente com os cenários de events.mock.ts.
export const attendanceMock: Attendance[] = [
  {
    "id": "44444444-4444-4444-8444-444444444444",
    "eventId": "11111111-1111-4111-8111-111111111111",
    "eventTitle": "Arquitetura de Software na Prática",
    "checkInAt": "2026-10-05T18:55:10.000Z",
    "checkOutAt": "2026-10-05T21:02:00.000Z",
    "status": "CONFIRMED"
  },
  {
    "id": "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    "eventId": "99999999-9999-4999-8999-999999999990",
    "eventTitle": "Design de produtos digitais acessíveis",
    "checkInAt": "2026-10-06T18:55:10.000Z",
    "checkOutAt": null,
    "status": "CHECKED_IN"
  }
];
