import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import PublicEventsScreen from '../src/ui/screens/events/PublicEventsScreen.tsx';
import { visitorRequest, VisitorApiError } from '../src/api/events/visitor.ts';

test('VisitorApiError preserva mensagem e status HTTP', () => {
  const err = new VisitorApiError('Sessão expirada', 401);
  assert.equal(err.message, 'Sessão expirada');
  assert.equal(err.status, 401);
  assert.ok(err instanceof Error);
});

test('visitorRequest realiza GET e POST com JSON e headers apropriados', async () => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    return new Response(JSON.stringify({ ok: true, data: 'test' }), { status: 200 });
  };

  try {
    const resGet = await visitorRequest('public/events/series');
    assert.deepEqual(resGet, { ok: true, data: 'test' });
    assert.equal(calls[0].url, '/api/public/events/series');
    assert.equal(calls[0].options.method, 'GET');
    assert.equal(calls[0].options.body, undefined);

    const resPost = await visitorRequest('visitor/registration', { name: 'Visitante' });
    assert.deepEqual(resPost, { ok: true, data: 'test' });
    assert.equal(calls[1].url, '/api/visitor/registration');
    assert.equal(calls[1].options.method, 'POST');
    assert.equal(calls[1].options.headers['Content-Type'], 'application/json');
    assert.deepEqual(JSON.parse(calls[1].options.body), { name: 'Visitante' });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('visitorRequest propaga erros da API com mensagem do servidor', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ message: 'Código de verificação incorreto.' }), { status: 400 });

  try {
    await assert.rejects(
      visitorRequest('visitor/verify', { code: '123456' }),
      (err) => err instanceof VisitorApiError && err.status === 400 && err.message.includes('Código de verificação')
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('PublicEventsScreen renderiza tela de eventos e identificação inicial', () => {
  const html = renderToStaticMarkup(
    h(MemoryRouter, { initialEntries: ['/visitantes'] }, h(PublicEventsScreen, {}))
  );
  assert.ok(html.includes('Eventos e certificados'));
  assert.ok(html.includes('Participe como visitante'));
  assert.ok(html.includes('Acesso de aluno'));
});

test('PublicEventsScreen com reference prepara contexto do evento', () => {
  const html = renderToStaticMarkup(
    h(MemoryRouter, { initialEntries: ['/p/ref123'] }, h(PublicEventsScreen, { reference: 'ref123' }))
  );
  assert.ok(html.includes('Eventos e certificados'));
  assert.ok(html.includes('Participe como visitante'));
});

test('PublicEventsScreen renderiza cabeçalho arredondado e badge de visitantes do novo design', () => {
  const html = renderToStaticMarkup(
    h(MemoryRouter, { initialEntries: ['/visitantes'] }, h(PublicEventsScreen, {}))
  );
  assert.ok(html.includes('Carteirinha Digital · Visitantes'));
  assert.ok(html.includes('Fatec Itaquera'));
  assert.ok(html.includes('Identificação rápida do visitante'));
});

test('PublicPresenceGateway renderiza tela pública de visitantes quando não há perfil de aluno', async () => {
  const { default: PublicPresenceGateway } = await import('../src/ui/screens/attendance/PublicPresenceGateway.tsx');
  // Simula ausência de sessão de aluno
  const originalGetItem = globalThis.localStorage?.getItem;
  try {
    globalThis.localStorage = {
      getItem: (key) => (key === 'token' ? 'stale-token' : null),
      setItem: () => {},
      removeItem: () => {},
    };
    const html = renderToStaticMarkup(
      h(MemoryRouter, { initialEntries: ['/p/test-ref-12345'] }, h(PublicPresenceGateway, {}))
    );
    // Não redireciona para login nem quebra: renderiza a tela pública
    assert.ok(html.includes('Eventos e certificados'));
    assert.ok(html.includes('Participe como visitante'));
  } finally {
    if (originalGetItem) globalThis.localStorage.getItem = originalGetItem;
  }
});

