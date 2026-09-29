import { useEffect, useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Clock3, MapPin, UserRound, QrCode, ChevronDown, LoaderCircle, Radio } from 'lucide-react';
import type { Event } from '../../../domains/Event';
import type { Attendance } from '../../../domains/Attendance';
import { eventService } from '../../../services/eventService';
import BadgeComp from '../badge/BadgeComp';
import AttendanceInfo from './AttendanceInfo';
import { errorMessage, eventStatusLabel, formatDate, formatTime, formatWorkload, openCheckpoint } from '../../screens/events/eventPresentation';
import styles from './style.module.css';

export default function EventCardComp({ event, attendance, onUpdate }: {
  event: Event; attendance?: Attendance; onUpdate: (event: Event) => void;
}) {
  const navigate = useNavigate();
  const detailsId = useId();
  const [expanded, setExpanded] = useState(false);
  const [pending, setPending] = useState<'details' | 'scan'>();
  const [error, setError] = useState<string>();
  const [notice, setNotice] = useState<string>();
  const request = useRef<AbortController | null>(null);
  const checkpoint = openCheckpoint(event);
  useEffect(() => () => request.current?.abort(), []);

  async function refresh(action: 'details' | 'scan') {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setPending(action);
    setError(undefined);
    setNotice(undefined);
    try {
      const fresh = await eventService.getEventById(event.id, controller.signal);
      if (controller.signal.aborted) return;
      onUpdate(fresh);
      if (action === 'details') setExpanded(true);
      else if (openCheckpoint(fresh)) navigate('/eventos/scanner');
      else setNotice('O registro de presença está fechado neste momento.');
    } catch (reason) {
      if (!controller.signal.aborted) setError(errorMessage(reason,
        'Não foi possível atualizar este evento. Tente novamente antes de continuar.'));
    } finally {
      if (!controller.signal.aborted) setPending(undefined);
    }
  }

  const sameDay = new Date(event.startsAt).toDateString() === new Date(event.endsAt).toDateString();
  return <article className={styles.card + (checkpoint ? ' ' + styles.openCard : '')} aria-label={event.title}>
    <div className={styles.topline}>
      <span className={styles.eyebrow}>Evento acadêmico</span>
      <BadgeComp tone={checkpoint ? (checkpoint.type === 'CHECK_IN' ? 'success' : 'warning') : 'neutral'}>
        {checkpoint && <Radio size={13} aria-hidden="true" />}{eventStatusLabel(event)}
      </BadgeComp>
    </div>
    <h3>{event.title}</h3>
    <p className={styles.speaker}><UserRound size={16} aria-hidden="true" />{event.speaker}</p>
    <dl className={styles.metadata}>
      <div><dt><CalendarDays size={16} aria-hidden="true" />Data</dt><dd>
        <time dateTime={event.startsAt}>{formatDate(event.startsAt)}</time>
        {!sameDay && <> a <time dateTime={event.endsAt}>{formatDate(event.endsAt)}</time></>}
      </dd></div>
      <div><dt><Clock3 size={16} aria-hidden="true" />Horário</dt><dd>{formatTime(event.startsAt)} – {formatTime(event.endsAt)}</dd></div>
      <div><dt><Clock3 size={16} aria-hidden="true" />Carga horária</dt><dd>{formatWorkload(event.workloadMinutes)}</dd></div>
      <div><dt><MapPin size={16} aria-hidden="true" />Local</dt><dd>{event.location}</dd></div>
    </dl>
    {attendance && <AttendanceInfo attendance={attendance} />}
    <div className={styles.actions}>
      <button type="button" className={styles.detailsButton} aria-expanded={expanded}
        aria-controls={detailsId} disabled={!!pending} onClick={() => expanded ? setExpanded(false) : void refresh('details')}>
        {pending === 'details' ? <LoaderCircle size={16} className={styles.spinner} aria-hidden="true" /> : <ChevronDown size={16} aria-hidden="true" />}
        {expanded ? 'Ocultar detalhes' : 'Ver detalhes'}
      </button>
      {checkpoint && <button type="button" className={styles.scanButton} disabled={!!pending}
        onClick={() => void refresh('scan')}>
        {pending === 'scan' ? <LoaderCircle size={18} className={styles.spinner} aria-hidden="true" /> : <QrCode size={18} aria-hidden="true" />}
        {pending === 'scan' ? 'Verificando presença...' : 'Escanear Presença'}
      </button>}
    </div>
    <div id={detailsId} hidden={!expanded} className={styles.description}>
      <p>{event.description || 'Este evento ainda não possui uma descrição.'}</p>
      <p>{event.certificateEnabled ? 'Evento com emissão de certificado conforme confirmação de presença.' : 'Este evento não prevê emissão de certificado.'}</p>
    </div>
    {pending && <p role="status" className={styles.feedback}>Atualizando informações do evento...</p>}
    {error && <p role="alert" className={styles.error}>{error}</p>}
    {notice && <p role="status" className={styles.feedback}>{notice}</p>}
  </article>;
}
