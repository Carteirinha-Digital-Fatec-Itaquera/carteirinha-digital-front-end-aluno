import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import EventFeedbackScreen from '../src/ui/screens/events/EventFeedbackScreen.tsx';
import ScanResultCard from '../src/ui/screens/scanner/ScanResultCard.tsx';
import { submitEventFeedback } from '../src/api/events/feedback.ts';

test('submitEventFeedback envia POST para o endpoint público anônimo', async () => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    return new Response(JSON.stringify({ success: true, message: 'Enviado!' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  };

  try {
    const payload = {
      rating: 5,
      comments: 'Excelente palestra!',
      suggestions: 'Mais tópicos de backend',
    };
    const res = await submitEventFeedback('evt-xyz-100', payload);
    assert.deepEqual(res, { success: true, message: 'Enviado!' });
    assert.equal(calls.length, 1);
    assert.ok(calls[0].url.includes('/public/events/evt-xyz-100/feedback'));
    assert.equal(calls[0].options.method, 'POST');
    assert.deepEqual(JSON.parse(calls[0].options.body), payload);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('EventFeedbackScreen renderiza as 3 perguntas e aviso de anonimato', () => {
  const html = renderToStaticMarkup(
    h(
      MemoryRouter,
      { initialEntries: ['/eventos/evt-100/avaliacao?title=Workshop%20NestJS'] },
      h(
        Routes,
        null,
        h(Route, { path: '/eventos/:id/avaliacao', element: h(EventFeedbackScreen) })
      )
    )
  );

  assert.ok(html.includes('Pesquisa de Satisfação'));
  assert.ok(html.includes('Como foi a atividade?'));
  assert.ok(html.includes('Workshop NestJS'));
  assert.ok(html.includes('Avaliação 100% Anônima:'));
  // Pergunta 1
  assert.ok(html.includes('1) O que você achou da palestra?'));
  // Pergunta 2
  assert.ok(html.includes('2) Comentários ou observações sobre a palestra:'));
  // Pergunta 3
  assert.ok(html.includes('3) Sugestão de temas ou assuntos para o próximo evento:'));
  // Botões
  assert.ok(html.includes('Enviar Avaliação'));
  assert.ok(html.includes('Pular pesquisa e concluir'));
});

test('ScanResultCard renderiza link de pesquisa de satisfação quando checkout é concluído', () => {
  const resultCheckout = {
    tone: 'success',
    title: 'Presença confirmada!',
    eventTitle: 'Palestra de Inovação',
    eventId: 'evt-1234',
    checkOutAt: '2026-10-16T21:00:00Z',
    certificates: true,
  };

  const html = renderToStaticMarkup(
    h(MemoryRouter, null, h(ScanResultCard, { result: resultCheckout, onRetry() {} }))
  );

  assert.ok(html.includes('Avaliar palestra (Pesquisa de Satisfação)'));
  assert.ok(html.includes('/eventos/evt-1234/avaliacao'));
});
