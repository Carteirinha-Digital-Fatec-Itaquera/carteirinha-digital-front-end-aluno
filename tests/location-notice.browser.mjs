import assert from 'node:assert/strict';
import { chromium } from 'playwright';

// API e GPS simulados; valida a ordem real de interação no navegador.
const origin = process.env.TEST_URL || 'http://127.0.0.1:5189';
const reference = 'location_notice_reference_123';
const seriesId = '00000000-0000-4000-8000-000000000001';
const eventId = '00000000-0000-4000-8000-000000000002';
const event = { id: eventId, title: 'Atividade de teste', speaker: 'Pessoa de teste', location: 'Auditório', status: 'IN_PROGRESS', visitorsAllowed: true, startsAt: new Date().toISOString(), endsAt: new Date(Date.now() + 3600000).toISOString(), workloadMinutes: 60, checkpoints: [] };
const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'msedge', headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
await context.addInitScript(() => {
  localStorage.setItem('token', 'test-student');
  localStorage.removeItem('mustChangePassword');
  window.__geoCalls = 0;
  window.__denyGeo = false;
  Object.defineProperty(navigator, 'geolocation', { configurable: true, value: {
    getCurrentPosition(success, failure) {
      window.__geoCalls++;
      if (window.__denyGeo) failure({ code: 1 });
      else success({ coords: { latitude: -23.545, longitude: -46.468, accuracy: 10 }, timestamp: Date.now() });
    },
  } });
});
let challenges = 0;
let scans = 0;
let requireLocation = true;
const preview = () => ({ event, checkpoint: { type: 'CHECK_IN' }, seriesId, visitorsAllowed: true, locationRequired: requireLocation, expiresAt: null, serverTime: new Date().toISOString() });
await context.route('**/*', async route => {
  const url = new URL(route.request().url());
  const path = url.pathname;
  if (path.includes('/attendances/qr/') || path.includes('/public/events/qr/')) return route.fulfill({ json: preview() });
  if (path.endsWith('/attendances/location-challenge') || path.endsWith('/visitor/challenge')) { challenges++; return route.fulfill({ json: { challengeId: 'test-challenge' } }); }
  if (path.endsWith('/attendances/scan-reference') || path.endsWith('/visitor/attendance')) { scans++; return route.fulfill({ json: { success: true, type: 'CHECK_IN', status: 'CHECKED_IN', eventTitle: event.title, timestamp: new Date().toISOString(), message: 'Entrada registrada com sucesso!' } }); }
  if (path.endsWith('/public/events/series')) return route.fulfill({ json: [{ id: seriesId, title: 'Programação', retentionAt: new Date(Date.now() + 86400000).toISOString(), courses: [], events: [event] }] });
  if (path.endsWith('/visitor/session')) return route.fulfill({ json: { id: 'visitor', name: 'Visitante teste', seriesId, course: null, retentionAt: new Date(Date.now() + 86400000).toISOString() } });
  if (path.endsWith('/visitor/certificates') || path.endsWith('/visitor/attendances') || path.endsWith('/attendances/me')) return route.fulfill({ json: [] });
  if (url.origin !== origin) return route.fulfill({ status: 401, json: {} });
  return route.continue();
});
const modal = page => page.getByRole('dialog', { name: 'Ative sua localização para registrar presença' });
try {
  const page = await context.newPage();
  await page.goto(`${origin}/p/${reference}/aluno`);
  await page.getByRole('button', { name: 'Confirmar Entrada', exact: true }).click();
  await modal(page).waitFor();
  if (process.env.SCREENSHOT_DIR) await page.screenshot({ path: `${process.env.SCREENSHOT_DIR}/aviso-localizacao-mobile.png`, fullPage: true });
  assert.equal(challenges, 0); assert.equal(scans, 0);
  assert.equal(await page.evaluate(() => window.__geoCalls), 0);
  await modal(page).getByRole('button', { name: 'Cancelar', exact: true }).click();
  await page.getByRole('button', { name: 'Confirmar Entrada', exact: true }).waitFor({ state: 'visible' });
  assert.equal(challenges, 0); assert.equal(scans, 0);
  await page.getByRole('button', { name: 'Confirmar Entrada', exact: true }).click();
  await modal(page).waitFor();
  await page.keyboard.press('Escape');
  assert.equal(challenges, 0); assert.equal(scans, 0);
  await page.getByRole('button', { name: 'Confirmar Entrada', exact: true }).click();
  await modal(page).getByRole('button', { name: 'Entendi, continuar' }).click();
  await page.getByRole('heading', { name: 'Entrada registrada!', exact: true }).waitFor();
  assert.equal(challenges, 1); assert.equal(scans, 1);
  assert.equal(await page.evaluate(() => window.__geoCalls), 1);

  const visitor = await context.newPage();
  await visitor.goto(`${origin}/visitantes?ref=${reference}`);
  await visitor.getByRole('button', { name: /Confirmar Entrada/ }).click();
  await modal(visitor).waitFor();
  assert.equal(challenges, 1); assert.equal(scans, 1);
  assert.equal(await visitor.evaluate(() => window.__geoCalls), 0);
  await visitor.evaluate(() => { window.__denyGeo = true; });
  await modal(visitor).getByRole('button', { name: 'Entendi, continuar' }).click();
  await visitor.getByRole('dialog', { name: 'Acesso à Localização' }).waitFor();
  assert.equal(challenges, 2); assert.equal(scans, 1);
  await visitor.getByRole('dialog').getByRole('button', { name: 'Entendi', exact: true }).click();
  await visitor.evaluate(() => { window.__denyGeo = false; });
  await visitor.getByRole('button', { name: /Confirmar Entrada/ }).click();
  await modal(visitor).getByRole('button', { name: 'Entendi, continuar' }).click();
  await visitor.getByRole('status').filter({ hasText: 'Entrada registrada' }).waitFor();
  assert.equal(scans, 2);

  requireLocation = false;
  const noGeo = await context.newPage();
  await noGeo.goto(`${origin}/p/${reference}/aluno`);
  await noGeo.getByRole('button', { name: 'Confirmar Entrada', exact: true }).click();
  await noGeo.getByRole('heading', { name: 'Entrada registrada!', exact: true }).waitFor();
  assert.equal(await modal(noGeo).count(), 0);
  assert.equal(await noGeo.evaluate(() => window.__geoCalls), 0);
  assert.equal(scans, 3);
  console.log('PASS: aluno e visitante veem aviso antes do GPS; Cancelar/Escape não disparam desafio ou presença; recusa não registra; tentativa seguinte funciona; eventos sem GPS seguem sem aviso.');
} finally { await context.close(); await browser.close(); }
