// Contrato V1: backend/src/contracts/v1-events.types.ts (snapshot fornecido).
export type Uuid = string;
export type IsoDateTime = string;
export type EventStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type CheckpointType = 'CHECK_IN' | 'CHECK_OUT';
export interface CheckpointView {
  id: Uuid;
  eventId: Uuid;
  type: CheckpointType;
  isOpen: boolean;
  version: number;
  openedAt: IsoDateTime | null;
  closedAt: IsoDateTime | null;
}
export interface Event {
  id: Uuid;
  title: string;
  description: string | null;
  speaker: string;
  location: string;
  startsAt: IsoDateTime;
  endsAt: IsoDateTime;
  workloadMinutes: number;
  status: EventStatus;
  certificateEnabled: boolean;
  checkpoints: CheckpointView[];
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
}
