import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import EventCard from '../src/ui/components/eventCard/EventCardComp.tsx';
import { LoadingState, ErrorState } from '../src/ui/screens/events/ResourceState.tsx';
import { openCheckpoint, formatWorkload, errorMessage } from '../src/ui/screens/events/eventPresentation.ts';
import { eventsMock } from '../src/mocks/events.mock.ts';

const base = eventsMock[0];
const makeEvent = (status, checkpoint) => ({ ...structuredClone(base), status,
  checkpoints: base.checkpoints.map(item => ({ ...item, isOpen: item.type === checkpoint })),
});
const markup = (event, attendance) => renderToStaticMarkup(h(MemoryRouter, null,
  h(EventCard, { event, attendance, onUpdate() {} })));

for (const [status, checkpoint, label] of [
  ['SCHEDULED', undefined, 'Programado'],
  ['IN_PROGRESS', undefined, 'Em andamento'],
  ['IN_PROGRESS', 'CHECK_IN', 'Check-in Aberto'],
  ['IN_PROGRESS', 'CHECK_OUT', 'Check-out Aberto'],
  ['COMPLETED', undefined, 'Encerrado'],
  ['CANCELLED', undefined, 'Cancelado'],
]) {
  test('card renderiza ' + label + ' e a ação apropriada', () => {
    const event = makeEvent(status, checkpoint);
    const html = markup(event);
    assert.ok(html.includes(label));
    assert.equal(html.includes('Escanear Presença'), !!checkpoint);
    assert.ok(html.includes(event.title));
    assert.ok(html.includes(event.speaker));
    assert.ok(html.includes(event.location));
    assert.ok(html.includes('Carga horária'));
  });
}

test('evento encerrado/cancelado nunca libera scanner com checkpoint inconsistente', () => {
  for (const status of ['COMPLETED', 'CANCELLED']) {
    const event = makeEvent(status, 'CHECK_IN');
    assert.equal(openCheckpoint(event), undefined);
    assert.equal(markup(event).includes('Escanear Presença'), false);
  }
});

test('presença é exibida junto ao estado atual do evento', () => {
  for (const [status, label] of [['CHECKED_IN', 'Entrada Registrada'], ['CONFIRMED', 'Presença Confirmada']]) {
    const attendance = { id: 'attendance', eventId: base.id, eventTitle: base.title,
      status, checkInAt: '2026-10-05T18:55:00.000Z', checkOutAt: null };
    const html = markup(makeEvent('IN_PROGRESS', 'CHECK_OUT'), attendance);
    assert.ok(html.includes(label));
    assert.ok(html.includes('Check-out Aberto'));
    assert.ok(html.includes('Entrada:'));
  }
});

test('carga horária mantém minutos e horas', () => {
  assert.equal(formatWorkload(45), '45 min');
  assert.equal(formatWorkload(60), '1h');
  assert.equal(formatWorkload(90), '1h 30min');
  assert.equal(formatWorkload(120), '2h');
});

test('loading e erro têm anúncio acessível e opção de nova tentativa', () => {
  assert.match(renderToStaticMarkup(h(LoadingState, {text:'Carregando eventos...'})), /role="status"/);
  const html = renderToStaticMarkup(h(ErrorState, {text:'Falha HTTP', onRetry(){}}));
  assert.match(html, /role="alert"/);
  assert.match(html, /Tentar novamente/);
  assert.match(errorMessage({status:'401'}, 'Falha'), /sessão expirou/);
  assert.match(errorMessage({status:'403'}, 'Falha'), /permissão/);
});

test('HTTP é padrão; usa Bearer, detalhes e AbortSignal; não troca erros por fixtures', async () => {
  delete process.env.VITE_USE_MOCK;
  process.env.VITE_API_URL = 'http://api.test';
  const { eventService, useMockEvents } = await import('../src/services/eventService.ts?real');
  assert.equal(useMockEvents, false);
  const previousFetch = globalThis.fetch;
  const previousStorage = globalThis.localStorage;
  const calls = [];
  const signal = new AbortController().signal;
  globalThis.localStorage = {getItem: () => 'token-de-teste'};
  globalThis.fetch = async (url, options) => {
    calls.push({url, options});
    return new Response(JSON.stringify(url.endsWith('/' + base.id) ? base : []));
  };
  try {
    await eventService.getEvents(signal);
    await eventService.getEventById(base.id, signal);
    await eventService.getMyAttendances(signal);
    assert.deepEqual(calls.map(call => call.url), [
      'http://api.test/events', 'http://api.test/events/' + base.id, 'http://api.test/attendances/me',
    ]);
    assert.ok(calls.every(call => call.options.headers.Authorization === 'Bearer token-de-teste'));
    assert.ok(calls.every(call => call.options.signal === signal));
    for (const status of [401, 403, 404, 500]) {
      globalThis.fetch = async () => new Response(JSON.stringify({message:'Falha controlada'}), {status});
      await assert.rejects(eventService.getEvents(), error => error.status === String(status));
      await assert.rejects(eventService.getMyAttendances(), error => error.status === String(status));
    }
    globalThis.fetch = async () => { throw new TypeError('Sem rede'); };
    await assert.rejects(eventService.getEvents());
  } finally { globalThis.fetch = previousFetch; globalThis.localStorage = previousStorage; }
});

test('mock é explícito, isolado e detalhe inexistente retorna erro', async () => {
  process.env.VITE_USE_MOCK = 'true';
  const { eventService } = await import('../src/services/eventService.ts?mock');
  const previousFetch = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error('Mock não deve chamar HTTP'); };
  try {
    const event = await eventService.getEventById(base.id);
    event.title = 'alterado';
    assert.notEqual((await eventService.getEventById(base.id)).title, 'alterado');
    assert.ok(Array.isArray(await eventService.getEvents()));
    assert.ok(Array.isArray(await eventService.getMyAttendances()));
    await assert.rejects(eventService.getEventById('inexistente'), error => error.status === '404');
  } finally { globalThis.fetch = previousFetch; delete process.env.VITE_USE_MOCK; }
});
