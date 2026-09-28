import { useCallback } from 'react';
import type { Attendance } from '../../../domains/Attendance';
import { eventService } from '../../../services/eventService';
import EventCardComp from '../../components/eventCard/EventCardComp';
import AttendanceInfo from '../../components/eventCard/AttendanceInfo';
import { useEventResource } from './useEventResource';
import { LoadingState, ErrorState } from './ResourceState';
import { errorMessage } from './eventPresentation';
import styles from './style.module.css';

export default function ParticipationCard({ attendance }: { attendance: Attendance }) {
  // Eventos encerrados não aparecem em GET /events para aluno.
  const load = useCallback((signal: AbortSignal) => eventService.getEventById(attendance.eventId, signal), [attendance.eventId]);
  const resource = useEventResource(load);
  if (resource.data) return <EventCardComp event={resource.data} attendance={attendance} onUpdate={resource.setData} />;
  return <article className={styles.participationPlaceholder} aria-label={attendance.eventTitle}>
    <h3>{attendance.eventTitle}</h3>
    <AttendanceInfo attendance={attendance} />
    {resource.loading ? <LoadingState text="Carregando detalhes do evento..." /> :
      <ErrorState text={errorMessage(resource.error, 'Os detalhes deste evento não estão disponíveis. Seu registro de presença continua exibido acima.')} onRetry={resource.retry} />}
  </article>;
}
