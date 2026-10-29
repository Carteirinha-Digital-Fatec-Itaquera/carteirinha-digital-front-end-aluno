import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

test('durable account queue, receipt reconciliation, GPS exclusion, logout and offline shell', { timeout: 60000 }, async () => {
 const browser = await chromium.launch({ channel: 'msedge', headless: true });
 try {
 const context = await browser.newContext();
 let sends = 0; let loseResponse = true; const receipts = new Map();
 await context.route('**/*', async route => {
  const url = new URL(route.request().url());
  if (url.origin !== 'http://localhost:4173') return route.abort();
  if (!url.pathname.startsWith('/api/attendances/offline/')) return route.continue();
  const body = route.request().postDataJSON(); const path = url.pathname.split('/').at(-1);
  if (path === 'status') return route.fulfill({ json: { receipts: body.requestIds.flatMap(id => receipts.has(id) ? [receipts.get(id)] : []), missingRequestIds: body.requestIds.filter(id => !receipts.has(id)) } });
  if (path === 'submit') {
   sends++;
   const receipt = { ...body, status: 'confirmed', message: 'Presença confirmada.', result: { success: true, type: 'CHECK_OUT', status: 'CONFIRMED', timestamp: new Date().toISOString(), eventTitle: 'Evento fictício', message: 'Presença confirmada.' } };
   receipts.set(body.requestId, receipt);
   if (loseResponse) { loseResponse = false; return route.abort(); }
   return route.fulfill({ json: receipt });
  }
  return route.fulfill({ json: { revoked: true } });
 });
 const page = await context.newPage(); await page.goto('http://localhost:4173/login');
 await page.evaluate(() => Promise.race([navigator.serviceWorker.ready.then(() => true), new Promise((_, reject) => setTimeout(() => reject(new Error('SW activation timeout')), 12000))]));
 console.log('SW ready');
 const accountId = '11111111-1111-4111-8111-111111111111';
 const item = { requestId: '22222222-2222-4222-8222-222222222222', accountId, reference: 'reference_test_123', scannedAt: new Date().toISOString(), state: 'waiting', locationRequired: false };
 await page.evaluate(async ({ item, accountId }) => { await presenceQueue.authorize({ accountId, expiresAt: Date.now() + 600000, generation: 'test' }); await presenceQueue.put(item); await presenceQueue.put({ ...item, requestId: '66666666-6666-4666-8666-666666666666', accountId: '77777777-7777-4777-8777-777777777777' }); await presenceQueue.put({ ...item, requestId: '33333333-3333-4333-8333-333333333333', locationRequired: true, state: 'gps' }); await presenceQueue.flush(); }, { item, accountId });
 console.log('initial flush', sends); assert.equal(sends, 1);
 let rows = await page.evaluate(() => presenceQueue.list()); assert.equal(rows[0].state, 'unknown');
 await page.reload(); rows = await page.evaluate(() => presenceQueue.list()); assert.equal(rows.length, 3);
 await page.evaluate(async ({ accountId }) => { await presenceQueue.authorize({ accountId, expiresAt: Date.now() + 600000, generation: 'test2' }); for (const item of await presenceQueue.list()) if (item.state === 'unknown') await presenceQueue.put({ ...item, nextAt: 0 }); await presenceQueue.flush(); }, { accountId });
 rows = await page.evaluate(() => presenceQueue.list()); assert.equal(rows.find(r => r.requestId === item.requestId).state, 'confirmed'); assert.equal(sends, 1, 'lost response must reconcile receipt without second POST'); assert.equal(rows.find(r => r.locationRequired).state, 'gps');
 await page.evaluate(async ({ item }) => { await presenceQueue.put({ ...item, requestId: '44444444-4444-4444-8444-444444444444' }); await presenceQueue.authorize(null); await presenceQueue.flush(); }, { item }); assert.equal(sends, 1, 'logout blocks sends');
 const worker = context.serviceWorkers()[0]; assert.ok(worker);
 const workerHasQueue = await worker.evaluate(() => typeof globalThis.presenceQueue?.flush === 'function'); assert.equal(workerHasQueue, true, 'production worker imports queue implementation');
 await worker.evaluate(async ({ accountId, item }) => {
   const q = globalThis.presenceQueue;
   await q.authorize({ accountId, expiresAt: Date.now() + 60000, generation: 'new-login' });
   await q.disableGeneration('old-login');
   if ((await q.control()).generation !== 'new-login') throw new Error('Delayed response disabled new login');
   await q.put({ ...item, requestId: '55555555-5555-4555-8555-555555555555' });
   globalThis.fetch = async (url, options) => {
     const body = JSON.parse(options.body);
     return new Response(JSON.stringify(String(url).endsWith('/status') ? { receipts: [] } : { ...body, status: 'confirmed', result: { success: true, type: 'CHECK_IN', status: 'CHECKED_IN', message: 'Entrada', timestamp: new Date().toISOString(), eventTitle: 'Evento fict�cio' } }), { status: 200, headers: { 'Content-Type': 'application/json' } });
   };
   let completion;
   const sync = new Event('sync');
   Object.defineProperties(sync, { tag: { value: 'student-presence' }, waitUntil: { value: promise => { completion = promise; } } });
   dispatchEvent(sync); await completion;
   if ((await q.list()).find(i => i.requestId === '55555555-5555-4555-8555-555555555555').state !== 'confirmed') throw new Error('Worker sync handler did not confirm');
   await q.authorize(null);
 }, { accountId, item });
 const token = 'header.' + Buffer.from(JSON.stringify({ accountId, role: 'student' })).toString('base64url') + '.signature';
 await page.evaluate(({ token }) => { localStorage.setItem('token', token); localStorage.setItem('mustChangePassword', 'true'); }, { token });
 await context.setOffline(true); await page.goto('http://localhost:4173/p/reference_test_123/aluno');
 console.log('offline route', await page.locator('h1').allTextContents());
 await page.locator('h1').waitFor();
 await page.locator('aside').waitFor();
 assert.match(await page.locator('aside').innerText(), /Registros de/);
 await page.reload(); await page.locator('aside').waitFor();
 await page.goto('http://localhost:4173/p/reference_test_123');
 await page.getByRole('status').filter({ hasText: /Aguardando/ }).waitFor();
 assert.equal(await page.getByRole('button', { name: /Sou visitante/ }).isDisabled(), true);
 assert.equal(await page.getByRole('dialog').count(), 0, 'network failure with a saved attempt is a waiting state');
 await page.evaluate(async ({ item }) => { await presenceQueue.put({ ...item, requestId: '88888888-8888-4888-8888-888888888888', reference: 'motion_test_reference', state: 'checking' }); }, { item });
 await page.goto('http://localhost:4173/p/motion_test_reference/aluno');
 const statusIcon = page.locator('[role="status"] svg'); await statusIcon.waitFor();
 assert.notEqual(await statusIcon.evaluate(el => getComputedStyle(el).animationName), 'none');
 await page.emulateMedia({ reducedMotion: 'reduce' });
 assert.equal(await statusIcon.evaluate(el => getComputedStyle(el).animationName), 'none');
 await page.emulateMedia({ reducedMotion: 'no-preference' });
 await page.evaluate(async () => { const item = (await presenceQueue.list()).find(i => i.reference === 'motion_test_reference'); await presenceQueue.put({ ...item, state: 'rejected', message: 'Registro encerrado.' }); });
 await page.waitForFunction(() => { const icon = document.querySelector('[role="status"] svg'); return icon && getComputedStyle(icon).animationName === 'none'; });
 await context.setOffline(false);
 await context.route('**/api/public/events/qr/policy_false_reference', route => route.fulfill({ json: { visitorsAllowed: false, locationRequired: false, event: { id: 'fixture-event', title: 'Evento de teste' }, checkpoint: { type: 'CHECK_IN' } } }));
 await page.goto('http://localhost:4173/p/policy_false_reference');
 await page.waitForURL('**/p/policy_false_reference/aluno');
 await context.route('**/api/public/events/qr/policy_true_reference', route => route.fulfill({ json: { visitorsAllowed: true, locationRequired: false, event: { id: 'fixture-event', title: 'Evento de teste' }, checkpoint: { type: 'CHECK_IN' } } }));
 await page.goto('http://localhost:4173/p/policy_true_reference');
 await page.getByRole('button', { name: /Sou visitante/ }).waitFor();
 await page.waitForFunction(async () => (await presenceQueue.list()).some(i => i.reference === 'policy_true_reference'));
 await page.evaluate(async ({ accountId }) => { const item = (await presenceQueue.list()).find(i => i.reference === 'policy_true_reference'); if (item.state !== 'choice') throw new Error('Gateway must await student choice'); await presenceQueue.put({ ...item, locationRequired: false }); await presenceQueue.authorize({ accountId, expiresAt: Date.now() + 600000, generation: 'choice-test' }); await presenceQueue.flush(); }, { accountId });
 assert.equal(sends, 1, 'gateway must not submit student presence before identity choice');
 await page.getByRole('button', { name: /Sou visitante/ }).click();
 await page.waitForURL('**/visitantes?ref=policy_true_reference');
 assert.equal(sends, 1, 'visitor branch must not submit student presence');
 } finally { await browser.close(); }
});
