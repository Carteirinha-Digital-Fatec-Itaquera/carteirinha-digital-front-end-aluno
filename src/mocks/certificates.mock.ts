// Contrato V1: backend/src/contracts/v1-events.types.ts (snapshot fornecido).
import type { Certificate, CertificateDetails } from '../domains/Certificate';

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

export const certificateDetailsMock: CertificateDetails = {
  "id": "55555555-5555-4555-8555-555555555555",
  "eventId": "11111111-1111-4111-8111-111111111111",
  "attendanceId": "44444444-4444-4444-8444-444444444444",
  "verificationCode": "FATEC-EVT-7K3M9Q2X4P6R8T1V",
  "payloadSnapshot": {
    "studentName": "Pessoa Exemplo",
    "studentRa": "RA-EXEMPLO-001",
    "course": "DSM",
    "eventTitle": "Arquitetura de Software na Prática",
    "eventDate": "2026-10-05",
    "workload": "2 horas",
    "speaker": "Docente Exemplo",
    "institution": "Faculdade de Tecnologia de Itaquera - Centro Paula Souza"
  },
  "issuedAt": "2026-10-05T21:05:00.000Z",
  "revokedAt": null
};
