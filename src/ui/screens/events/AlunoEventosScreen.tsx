import { useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CalendarDays, CheckCircle2, RefreshCw } from 'lucide-react';
import type { Event } from '../../../domains/Event';
import { eventService, useMockEvents } from '../../../services/eventService';
import EventCardComp from '../../components/eventCard/EventCardComp';
import EventsPageLayout from './EventsPageLayout';
import ParticipationCard from './ParticipationCard';
import { LoadingState, ErrorState } from './ResourceState';
import { useEventResource } from './useEventResource';
import { errorMessage, openCheckpoint } from './eventPresentation';
import styles from './style.module.css';

export default function AlunoEventosScreen() {
  const events = useEventResource(eventService.getEvents);
  const attendances = useEventResource(eventService.getMyAttendances);
  const [params, setParams] = useSearchParams();
  const activeTab = params.get('aba') === 'participacoes' ? 'participacoes' : 'agenda';
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const listedEvents = [...(events.data ?? [])].sort((a, b) =>
    Number(!!openCheckpoint(b)) - Number(!!openCheckpoint(a)) || Date.parse(a.startsAt) - Date.parse(b.startsAt));
  const history = [...(attendances.data ?? [])].sort((a, b) =>
    Date.parse(b.checkInAt ?? '') - Date.parse(a.checkInAt ?? ''));
  const attendanceByEvent = new Map((attendances.data ?? []).map(item => [item.eventId, item]));

  function selectTab(tab: string) {
    const next = new URLSearchParams(params);
    if (tab === 'participacoes') next.set('aba', tab); else next.delete('aba');
    setParams(next, { replace: true });
  }

  function updateEvent(fresh: Event) {
    events.setData(previous => previous?.map(event => event.id === fresh.id ? fresh : event));
  }

  return <EventsPageLayout title="Eventos & Palestras" className={styles.eventsPage}
    subtitle="Descubra as atividades da FATEC Itaquera e acompanhe suas participações acadêmicas."
    icon={<CalendarDays size={22} strokeWidth={1.8} aria-hidden="true" />}>
    <section className={styles.summaryGrid} aria-label="Resumo de atividades">
      <article className={styles.summaryCard}>
        <div className={styles.summaryIcon}><CalendarDays size={19} aria-hidden="true" /></div>
        <div><span className={styles.summaryNumber}>{events.data?.length ?? '—'}</span>
          <span className={styles.summaryLabel}>Eventos disponíveis</span></div>
      </article>
      <article className={styles.summaryCard}>
        <div className={styles.summaryIcon}><CheckCircle2 size={19} aria-hidden="true" /></div>
        <div><span className={styles.summaryNumber}>{attendances.data?.length ?? '—'}</span>
          <span className={styles.summaryLabel}>Participações registradas</span></div>
      </article>
    </section>
    {useMockEvents && <p className={styles.mockNotice} role="status">Ambiente de demonstração · dados simulados</p>}
    <div className={styles.tabs} role="tablist" aria-label="Eventos e participações">
      {(['agenda', 'participacoes'] as const).map((tab, index) => <button key={tab} type="button"
        ref={element => { tabs.current[index] = element; }} role="tab" id={'tab-' + tab}
        aria-selected={activeTab === tab} aria-controls={'panel-' + tab} tabIndex={activeTab === tab ? 0 : -1}
        onClick={() => selectTab(tab)} onKeyDown={event => {
          if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
          event.preventDefault();
          const target = event.key === 'Home' ? 0 : event.key === 'End' ? 1 : 1 - index;
          selectTab(target === 0 ? 'agenda' : 'participacoes');
          tabs.current[target]?.focus();
        }}>
        {index === 0 ? <CalendarDays size={17} aria-hidden="true" /> : <CheckCircle2 size={17} aria-hidden="true" />}
        {index === 0 ? 'Próximos / Ao Vivo' : 'Minhas Participações'}
      </button>)}
    </div>
    <section id="panel-agenda" role="tabpanel" aria-labelledby="tab-agenda" hidden={activeTab !== 'agenda'} tabIndex={0}>
      <div className={styles.sectionHeader}><div><span className={styles.sectionEyebrow}>Agenda acadêmica</span><h2>Próximos eventos / Ao vivo</h2></div>
        <button type="button" className={styles.refreshButton} onClick={events.retry} disabled={events.loading} aria-label="Atualizar eventos"><RefreshCw size={17} aria-hidden="true" /></button>
      </div>
      {events.loading ? <LoadingState text="Carregando eventos..." /> : events.error ?
        <ErrorState text={errorMessage(events.error, 'Não foi possível carregar os eventos. Verifique sua conexão e tente novamente.')} onRetry={events.retry} /> : <>
        {attendances.error && <ErrorState text={errorMessage(attendances.error, 'Seus status de presença não puderam ser carregados. Você pode continuar consultando os eventos.')} onRetry={attendances.retry} />}
        {attendances.loading && <LoadingState text="Consultando seus status de presença..." />}
        {listedEvents.length ? <div className={styles.cardList}>{listedEvents.map(event =>
          <EventCardComp key={event.id} event={event} attendance={attendanceByEvent.get(event.id)} onUpdate={updateEvent} />)}</div> :
          <div className={styles.emptyState}><CalendarDays size={34} aria-hidden="true" /><h2>Nenhum evento disponível</h2><p>Quando novas atividades forem publicadas, você poderá encontrá-las aqui.</p></div>}
      </>}
    </section>
    <section id="panel-participacoes" role="tabpanel" aria-labelledby="tab-participacoes" hidden={activeTab !== 'participacoes'} tabIndex={0}>
      <div className={styles.sectionHeader}><div><span className={styles.sectionEyebrow}>Sua trajetória</span><h2>Minhas participações</h2></div>
        <button type="button" className={styles.refreshButton} onClick={attendances.retry} disabled={attendances.loading} aria-label="Atualizar participações"><RefreshCw size={17} aria-hidden="true" /></button>
      </div>
      {attendances.loading ? <LoadingState text="Carregando participações..." /> : attendances.error ?
        <ErrorState text={errorMessage(attendances.error, 'Não foi possível carregar suas participações. Tente novamente em instantes.')} onRetry={attendances.retry} /> :
        history.length ? activeTab === 'participacoes' && <div className={styles.cardList}>{history.map(attendance =>
          <ParticipationCard key={attendance.id} attendance={attendance} />)}</div> :
          <div className={styles.emptyState}><CheckCircle2 size={34} aria-hidden="true" /><h2>Sua história começa no próximo evento</h2><p>Ao registrar presença, suas participações aparecerão aqui.</p><button type="button" className={styles.secondaryButton} onClick={() => selectTab('agenda')}>Explorar eventos</button></div>}
    </section>
  </EventsPageLayout>;
}
