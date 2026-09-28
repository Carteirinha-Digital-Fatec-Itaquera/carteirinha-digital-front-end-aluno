import type { Event } from '../../../domains/Event';

export function openCheckpoint(event: Event) {
  if (event.status === 'CANCELLED' || event.status === 'COMPLETED') return undefined;
  return event.checkpoints.find(checkpoint => checkpoint.isOpen);
}

export function eventStatusLabel(event: Event): string {
  const checkpoint = openCheckpoint(event);
  if (checkpoint) return checkpoint.type === 'CHECK_IN' ? 'Check-in Aberto' : 'Check-out Aberto';
  if (event.status === 'COMPLETED') return 'Encerrado';
  if (event.status === 'CANCELLED') return 'Cancelado';
  return event.status === 'IN_PROGRESS' ? 'Em andamento' : 'Programado';
}

export function formatWorkload(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (!hours) return remainder + ' min';
  return hours + 'h' + (remainder ? ' ' + remainder + 'min' : '');
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));
}

export function formatTime(value: string): string {
  return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}

export function errorMessage(error: unknown, fallback: string): string {
  const status = error && typeof error === 'object' && 'status' in error ? String(error.status) : '';
  if (status === '401') return 'Sua sessão expirou. Entre novamente para continuar.';
  if (status === '403') return 'Sua conta não tem permissão para acessar estas informações.';
  return fallback;
}
