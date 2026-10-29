import { test } from 'node:test';
import assert from 'node:assert/strict';
import { activateOfflineSession, prepareOfflineSession, stopOfflineSession } from '../src/api/attendance/offlinePresence.ts';
test('same module logout/login reactivates scoped session and reuses valid authorization', async () => {
 const accountId = '11111111-1111-4111-8111-111111111111';
 const token = 'header.' + Buffer.from(JSON.stringify({ accountId, role: 'student' })).toString('base64url') + '.signature';
 const values = new Map([['token', token]]);
 globalThis.localStorage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
 Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { onLine: true } });
 let control = null; let sessions = 0;
 globalThis.presenceQueue = { control: async () => control, authorize: async value => { control = value; }, list: async () => [], request: async () => ({ revoked: true }) };
 globalThis.fetch = async () => { sessions++; return new Response(JSON.stringify({ accountId, expiresAt: new Date(Date.now() + 600000).toISOString() }), { status: 200 }); };
 await prepareOfflineSession(); assert.equal(sessions, 1);
 await prepareOfflineSession(); assert.equal(sessions, 1, 'polling reuses unexpired authorization');
 const generation = control.generation;
 await stopOfflineSession(); assert.equal(control, null);
 await prepareOfflineSession(); assert.equal(control, null, 'logout cannot reauthorize from late poll');
 await activateOfflineSession(); assert.equal(control.accountId, accountId); assert.notEqual(control.generation, generation); assert.equal(sessions, 2);
 await stopOfflineSession(); await activateOfflineSession(); assert.equal(sessions, 3, 'second SPA login reactivates again');
});

test('storage failure cannot block authentication cleanup', async () => {
 let revoked = false;
 globalThis.presenceQueue = { authorize: async () => { throw new DOMException('Denied', 'SecurityError'); }, request: async () => { revoked = true; } };
 Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { serviceWorker: { getRegistrations: async () => { throw new Error('Denied'); } } } });
 await assert.doesNotReject(stopOfflineSession());
 assert.equal(revoked, true);
});
