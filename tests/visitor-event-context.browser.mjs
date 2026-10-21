import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const origin = process.env.TEST_URL || 'http://127.0.0.1:5187';
const reference = 'event_context_reference_123';
const seriesId = '00000000-0000-4000-8000-000000000001';
const eventId = '00000000-0000-4000-8000-000000000002';
const now = Date.now();
const event = { id: eventId, title: 'Atividade A', speaker: 'Pessoa de teste', location: 'Local de teste', status: 'IN_PROGRESS', startsAt: new Date(now).toISOString(), endsAt: new Date(now + 3600000).toISOString(), workloadMinutes: 60, checkpoints: [] };
const other = { ...event, id: '00000000-0000-4000-8000-000000000003', title: 'Atividade B' };
const cancelled = { ...event, id: '00000000-0000-4000-8000-000000000004', title: 'Atividade cancelada', status: 'CANCELLED' };
let cancelledDuringVisit = false;
let registered = false;
const scans = [];
const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'msedge', headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
await context.route('**/*', async route => {
  const url = new URL(route.request().url());
  const events = [{ ...event, status: cancelledDuringVisit ? 'CANCELLED' : 'IN_PROGRESS' }, other, cancelled];
  if (url.pathname.endsWith('/public/events/series')) return route.fulfill({ json: [{ id: seriesId, title: 'Programação de teste', slug: 'teste', retentionAt: new Date(now + 86400000).toISOString(), courses: [], cpfRequired: false, events }] });
  if (url.pathname.includes('/public/events/qr/')) return route.fulfill({ json: { event, checkpoint: { type: 'CHECK_IN' }, seriesId, visitorsAllowed: true, locationRequired: false, expiresAt: new Date(now + 900000).toISOString(), serverTime: new Date(now).toISOString() } });
  if (url.pathname.endsWith('/visitor/registration')) { registered = true; return route.fulfill({ json: { success: true } }); }
  if (url.pathname.endsWith('/visitor/session')) return route.fulfill(registered
    ? { json: { id: 'visitor', name: 'Visitante teste', seriesId, course: null, retentionAt: new Date(now + 86400000).toISOString() } }
    : { status: 401, json: { message: 'Identifique-se.' } });
  if (url.pathname.endsWith('/visitor/attendance')) {
    scans.push(route.request().postDataJSON());
    return route.fulfill({ json: { success: true, type: 'CHECK_IN', status: 'CHECKED_IN', message: 'Entrada registrada com sucesso!' } });
  }
  if (url.pathname.endsWith('/visitor/certificates') || url.pathname.endsWith('/visitor/attendances') || url.pathname.endsWith('/attendances/me')) return route.fulfill({ json: [] });
  if (url.pathname === '/events') return route.fulfill({ json: events });
  if (url.origin !== origin) return route.fulfill({ status: 401, json: {} });
  return route.continue();
});
try {
  const page = await context.newPage();
  await page.clock.install();
  await page.goto(`${origin}/visitantes?ref=${reference}`);
  await page.getByLabel('Nome completo', { exact: true }).fill('Visitante teste');
  await page.getByLabel('E-mail', { exact: true }).fill('visitante@example.invalid');
  await page.getByLabel('CPF', { exact: true }).fill('52998224725');
  assert.equal(await page.getByRole('heading', { name: 'Atividade B', exact: true }).count(), 0);
  assert.equal(await page.getByText('Atividade cancelada', { exact: true }).count(), 0);
  await page.clock.fastForward(21000);
  assert.equal(await page.getByLabel('Nome completo', { exact: true }).inputValue(), 'Visitante teste');
  await page.getByRole('button', { name: 'Continuar como visitante', exact: true }).click();
  await page.getByRole('heading', { name: 'Olá, Visitante teste', exact: true }).waitFor();
  await page.getByRole('button', { name: /Confirmar Entrada/ }).click();
  await page.getByRole('status').filter({ hasText: 'Entrada registrada' }).waitFor();
  assert.equal(scans.length, 1);
  assert.equal(scans[0].reference, reference);
  assert.equal(scans[0].eventId, eventId);
  cancelledDuringVisit = true;
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  await page.getByText('Este evento não está disponível para participação.', { exact: false }).waitFor();
  assert.equal(await page.getByRole('button', { name: /Confirmar Entrada/ }).count(), 0);
  assert.equal(await page.getByRole('heading', { name: 'Atividade B', exact: true }).count(), 0);

  cancelledDuringVisit = false;
  const student = await context.newPage();
  await student.goto(`${origin}/login`);
  await student.evaluate(() => { localStorage.setItem('token', 'local-test-token'); localStorage.setItem('mustChangePassword', 'true'); });
  await student.goto(`${origin}/eventos`);
  await student.getByRole('heading', { name: 'Atividade A', exact: true }).waitFor();
  assert.equal(await student.getByRole('heading', { name: 'Atividade cancelada', exact: true }).count(), 0);
  cancelledDuringVisit = true;
  await student.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  await student.getByRole('heading', { name: 'Atividade A', exact: true }).waitFor({ state: 'hidden' });
  await student.getByRole('heading', { name: 'Atividade B', exact: true }).waitFor();
  console.log('PASS: cadastro preservado após 21s, evento vinculado ao QR, cancelados ausentes e atualização das agendas de visitante/aluno.');
} finally { await context.close(); await browser.close(); }
