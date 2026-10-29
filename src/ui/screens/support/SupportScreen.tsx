import MessageModal from '../../components/MessageModal/MessageModal';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import PageLayout from '../../components/page/PageLayout';
import { apiClient, buildApiError } from '../../../api/config/apiClient';
import './support.css';
import { eventService } from '../../../services/eventService';

const categories: Record<string, string> = { DATA: 'Dados cadastrais', PHOTO_CARD: 'Foto ou carteirinha', EVENT: 'Presença em evento', CERTIFICATE: 'Certificado', ACCESS: 'Acesso à conta', OTHER: 'Outro problema' };
const statuses: Record<string, string> = { OPEN: 'Aberto', IN_PROGRESS: 'Em atendimento', WAITING_STUDENT: 'Aguardando você', RESOLVED: 'Resolvido', CLOSED: 'Encerrado' };
type Ticket = { closeReason?: string | null; id: string; protocol: string; subject: string; category: string; status: string; version: number; unread: boolean; createdAt: string; assignedSecretaryId: number | null; eventId: string | null; certificateId: string | null; requestedField?: string; proposedValue?: string };
type Message = { id: string; authorRole: string; body: string; createdAt: string };
type Detail = { ticket: Ticket; messages: Message[]; messageNextCursor: string | null };
type Page = { items: Ticket[]; nextCursor: string | null };
async function request<T>(path: string, body?: object, signal?: AbortSignal): Promise<T> {
  const response = await apiClient('/support/tickets' + path, { authenticated: true, cache: 'no-store', signal, ...(body ? { method: 'POST', body } : {}) });
  if (!response.ok) { const error = await buildApiError(response, path); throw new Error(Array.isArray(error.message) ? error.message.join('. ') : error.message); }
  return response.json() as Promise<T>;
}
const date = (value: string) => new Date(value).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

export default function SupportScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState<Page>({ items: [], nextCursor: null });
  const [detail, setDetail] = useState<Detail | null>(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [dangerAction, setDangerAction] = useState<'cancel' | 'delete' | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ category: 'DATA', subject: '', description: '', requestedField: '', proposedValue: '', eventId: '', certificateId: '' });
  const [showNew, setShowNew] = useState(false);
  const [events, setEvents] = useState<{ id: string; title: string }[]>([]);
  const [certificates, setCertificates] = useState<{ id: string; eventId: string; eventTitle: string }[]>([]);
  const [contextWarning, setContextWarning] = useState('');
  const createKey = useRef(crypto.randomUUID());
  const actionKey = useRef<{ payload: string; id: string } | null>(null);
  const epoch = useRef(0);
  const load = useCallback(async (signal?: AbortSignal) => {
    const current = ++epoch.current;
    setError('');
    try {
      if (id) {
        const value = await request<Detail>('/' + id, undefined, signal);
        if (signal?.aborted || current !== epoch.current) return;
        setDetail(value);
        await request('/' + id + '/read', { version: value.ticket.version }, signal);
      } else {
        const value = await request<Page>('/me' + (status ? '?status=' + status : ''), undefined, signal);
        if (!signal?.aborted && current === epoch.current) setPage(value);
      }
    } catch (e) { if (!signal?.aborted && current === epoch.current) setError(e instanceof Error ? e.message : 'Não foi possível carregar.'); }
  }, [id, status]);
  useEffect(() => {
    const counter = epoch; const controller = new AbortController();
    const refresh = () => { if (document.visibilityState !== 'hidden') void load(controller.signal); };
    queueMicrotask(() => { if (controller.signal.aborted) return; setDetail(null); setMessage(''); actionKey.current = null; refresh(); });
    const timer = window.setInterval(refresh, 60000); window.addEventListener('focus', refresh); document.addEventListener('visibilitychange', refresh);
    return () => { controller.abort(); counter.current++; window.clearInterval(timer); window.removeEventListener('focus', refresh); document.removeEventListener('visibilitychange', refresh); };
  }, [load]);
  useEffect(() => {
    if (!showNew) return;
    let active = true;
    void Promise.allSettled([eventService.getEvents(), eventService.getMyCertificates()]).then(([agenda, issued]) => {
      if (!active) return;
      if (agenda.status === 'fulfilled') setEvents(agenda.value);
      if (issued.status === 'fulfilled') setCertificates(issued.value);
      if (agenda.status === 'rejected' || issued.status === 'rejected') setContextWarning('Não foi possível carregar todos os vínculos opcionais. Você pode descrever o evento ou certificado na mensagem.');
    });
    return () => { active = false; };
  }, [showNew]);
  async function create(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const value = await request<Ticket>('', { requestId: createKey.current, category: form.category, subject: form.subject, description: form.description, ...(form.category === 'DATA' && form.requestedField ? { requestedField: form.requestedField, ...(form.proposedValue ? { proposedValue: form.proposedValue } : {}) } : {}), ...(form.eventId ? { eventId: form.eventId } : {}), ...(form.certificateId ? { certificateId: form.certificateId } : {}) });
      createKey.current = crypto.randomUUID(); setShowNew(false); navigate('/suporte/' + value.id);
    } catch (e) { setError(e instanceof Error ? e.message : 'Falha ao abrir solicitação.'); } finally { setBusy(false); }
  }
  async function act(action: string, extra?: object) {
    if (!detail || !id) return;
    setBusy(true); setError('');
    const payload = JSON.stringify({ action, message: message.trim(), extra, expectedVersion: detail.ticket.version });
    if (!actionKey.current || actionKey.current.payload !== payload) actionKey.current = { payload, id: crypto.randomUUID() };
    try {
      await request('/' + id + '/' + action, { requestId: actionKey.current.id, expectedVersion: detail.ticket.version, ...(extra ?? { message: message.trim() }) });
      actionKey.current = null; setMessage(''); setActionReason(''); if (action === 'delete') { navigate('/suporte', { replace: true }); return; } await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Falha ao enviar.'); } finally { setBusy(false); }
  }
  async function moreMessages() {
    if (!detail?.messageNextCursor || !id) return;
    setBusy(true);
    try { const older = await request<Detail>('/' + id + '?cursor=' + detail.messageNextCursor); setDetail({ ...detail, messages: [...older.messages, ...detail.messages], messageNextCursor: older.messageNextCursor }); }
    catch (e) { setError(e instanceof Error ? e.message : 'Falha ao carregar.'); } finally { setBusy(false); }
  }
  async function moreTickets() {
    setBusy(true);
    try { const next = await request<Page>('/me?cursor=' + page.nextCursor + (status ? '&status=' + status : '')); setPage({ items: [...page.items, ...next.items], nextCursor: next.nextCursor }); }
    catch (e) { setError(e instanceof Error ? e.message : 'Falha ao carregar.'); } finally { setBusy(false); }
  }
  const terminal = detail && ['RESOLVED', 'CLOSED'].includes(detail.ticket.status);
  return <PageLayout title="Suporte da carteirinha" subtitle="Descreva seu problema e acompanhe o atendimento da Secretaria." backTo={id ? '/suporte' : '/Help'} backLabel={id ? 'Minhas solicitações' : 'Voltar à ajuda'} roundedHeader>
    <section className="student-support" aria-busy={busy}>
      <p>Não envie senhas, códigos de acesso, documentos ou dados sensíveis. Alterações cadastrais dependem de conferência da Secretaria.</p>
      {error && <div role="alert" className="support-error">{error} <button type="button" disabled={busy} onClick={() => void load()}>Atualizar atendimento</button></div>}
      {!id && <>
        <div className="support-tools"><h2>Minhas solicitações</h2><button onClick={() => setShowNew(!showNew)}>{showNew ? 'Cancelar nova solicitação' : 'Abrir solicitação'}</button><label>Situação<select value={status} onChange={e => setStatus(e.target.value)}><option value="">Todas</option>{Object.entries(statuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></div>
        {showNew && <form onSubmit={create}>
          <label>Categoria<select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>{Object.entries(categories).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
          <label>Assunto<input required minLength={5} maxLength={120} value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} /></label>
          <label>Descrição do problema<textarea required minLength={20} maxLength={3000} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></label>
          {['EVENT', 'CERTIFICATE'].includes(form.category) && <>{contextWarning && <p role="status">{contextWarning}</p>}<label>Evento relacionado (opcional)<select value={form.eventId} onChange={e => setForm({ ...form, eventId: e.target.value, certificateId: '' })}><option value="">Sem vínculo; informar na descrição</option>{events.map(event => <option value={event.id} key={event.id}>{event.title}</option>)}</select></label><label>Certificado relacionado (opcional)<select value={form.certificateId} onChange={e => { const cert = certificates.find(item => item.id === e.target.value); setForm({ ...form, certificateId: e.target.value, eventId: cert?.eventId || form.eventId }); }}><option value="">Sem certificado vinculado</option>{certificates.map(cert => <option key={cert.id} value={cert.id}>{cert.eventTitle}</option>)}</select></label></>}
          {form.category === 'DATA' && <><label>Informação a conferir (opcional)<select value={form.requestedField} onChange={e => setForm({ ...form, requestedField: e.target.value })}><option value="">Selecione</option><option value="NAME">Nome completo</option><option value="SOCIAL_NAME">Nome social</option><option value="COURSE">Curso</option><option value="EMAIL">E-mail</option><option value="OTHER">Outra informação</option></select></label>{form.requestedField && <label>Informação correta proposta (opcional)<input maxLength={160} value={form.proposedValue} onChange={e => setForm({ ...form, proposedValue: e.target.value })} /></label>}</>}
          <button disabled={busy} type="submit">Enviar solicitação</button>
        </form>}
        {!error && !page.items.length && <p>Nenhuma solicitação encontrada.</p>}
        <ul>{page.items.map(ticket => <li key={ticket.id}><Link to={'/suporte/' + ticket.id}><strong>{ticket.protocol} — {ticket.subject}</strong></Link><p>{ticket.closeReason?.startsWith('CANCELLED_') ? 'Cancelado' : statuses[ticket.status]} · {categories[ticket.category]} · {date(ticket.createdAt)}{ticket.unread && ' · Nova atualização'}</p></li>)}</ul>
        {page.nextCursor && <button disabled={busy} onClick={() => void moreTickets()}>Carregar mais solicitações</button>}
      </>}
      {id && !detail && !error && <p role="status">Carregando atendimento…</p>}
      {detail && <>
        <h2>{detail.ticket.protocol}</h2><h3>{detail.ticket.subject}</h3><p>{categories[detail.ticket.category]} · {detail.ticket.closeReason?.startsWith('CANCELLED_') ? 'Cancelado' : statuses[detail.ticket.status]}</p>
        {detail.ticket.proposedValue && <p>Informação proposta: {detail.ticket.proposedValue}</p>}
        {detail.ticket.eventId && <Link to="/eventos">Consultar eventos</Link>}{detail.ticket.certificateId && <Link to="/certificados">Consultar certificados</Link>}
        <h3>Conversa com a Secretaria</h3>
        {detail.messageNextCursor && <button disabled={busy} onClick={() => void moreMessages()}>Mensagens anteriores</button>}
        <ol className="support-conversation">{detail.messages.map(item => <li key={item.id}><strong>{item.authorRole === 'STUDENT' ? 'Você' : 'Secretaria'}</strong><time>{date(item.createdAt)}</time><p>{item.body}</p></li>)}</ol>
        <label>{terminal ? 'Motivo para reabrir ou confirmação de encerramento' : 'Sua mensagem'}<textarea minLength={terminal ? 3 : 1} maxLength={3000} value={message} onChange={e => setMessage(e.target.value)} /></label>
        <label>Motivo para cancelar ou excluir<input maxLength={1000} minLength={3} value={actionReason} onChange={e => setActionReason(e.target.value)} /></label>
        <div className="support-tools">{!terminal && <button disabled={busy || actionReason.trim().length < 3} onClick={() => setDangerAction('cancel')}>Cancelar solicitação</button>}<button disabled={busy || actionReason.trim().length < 3} onClick={() => setDangerAction('delete')}>Excluir solicitação</button></div>
        <div className="support-tools">
          {!terminal && <button disabled={busy || !message.trim()} onClick={() => void act('messages')}>Enviar mensagem</button>}
          {detail.ticket.status === 'RESOLVED' && <button disabled={busy || message.trim().length < 3} onClick={() => void act('close')}>{detail.ticket.status === 'RESOLVED' ? 'Confirmar solução e encerrar' : 'Cancelar solicitação'}</button>}
          {terminal && <><p>Reabertura disponível por até sete dias após a resolução ou o encerramento.</p><button disabled={busy || message.trim().length < 3} onClick={() => void act('reopen')}>Reabrir solicitação</button></>}
        </div>
      </>}
      <MessageModal visible={dangerAction !== null} tone="warning" title={dangerAction === 'delete' ? 'Excluir solicitação?' : 'Cancelar solicitação?'} message={dangerAction === 'delete' ? 'A solicitação será retirada das listas do aluno e da Secretaria. O histórico será preservado para auditoria.' : 'O atendimento será encerrado como cancelado. Você poderá reabri-lo dentro do prazo de sete dias.'} confirmText={dangerAction === 'delete' ? 'Confirmar exclusão' : 'Confirmar cancelamento'} cancelText="Voltar" onCancel={() => setDangerAction(null)} onConfirm={() => { const action = dangerAction; setDangerAction(null); if (action && !busy) void act(action, { reason: actionReason.trim(), confirmed: true }); }} />
    </section>
  </PageLayout>;
}
