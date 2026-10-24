import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import PhotoStatus from '../src/ui/components/photoStatus/PhotoStatus.tsx';

const render = (status, availability = 'ready', studentKey) => renderToStaticMarkup(h(MemoryRouter, null, h(PhotoStatus, { status, availability, studentKey })));

for (const [status, title] of [['PENDING', 'Foto em análise'], ['APPROVED', 'Foto aprovada'], ['REJECTED', 'Foto reprovada']]) {
  test(`apresenta o estado explícito ${status}`, () => {
    const html = render(status);
    assert.ok(html.includes(title));
    assert.equal(html.includes('Fechar aviso de foto aprovada'), status === 'APPROVED');
    assert.equal(html.includes('Enviar nova foto'), status === 'REJECTED');
    if (status === 'REJECTED') assert.ok(html.includes('href="/UploadImage"'));
    assert.ok(!html.includes('Motivo:'));
  });
}

test('não deduz aprovação de status ausente, nulo, vazio ou desconhecido', () => {
  for (const status of [undefined, null, '', 'NULL', 'OTHER']) assert.equal(render(status), '');
});

test('preferência persistida é individual e afeta somente APPROVED', () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: key => key === '@Carteirinha:approvedPhotoNotice:id%3Aaluno-a' ? '1' : null,
  } });
  try {
    assert.equal(render('APPROVED', 'ready', 'id:aluno-a'), '');
    assert.ok(render('APPROVED', 'ready', 'id:aluno-b').includes('Foto aprovada'));
    assert.ok(render('APPROVED').includes('Foto aprovada'));
    for (const status of ['PENDING', 'REJECTED']) {
      const html = render(status, 'ready', 'id:aluno-a');
      assert.ok(html.includes(status === 'PENDING' ? 'Foto em análise' : 'Foto reprovada'));
      assert.ok(!html.includes('Fechar aviso de foto aprovada'));
    }
    assert.ok(render('APPROVED', 'unavailable', 'id:aluno-a').includes('Status da foto indisponível'));
  } finally {
    if (original) Object.defineProperty(globalThis, 'localStorage', original);
    else delete globalThis.localStorage;
  }
});

test('armazenamento bloqueado não impede a exibição do aviso', () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw new Error('Storage blocked'); } });
  try { assert.ok(render('APPROVED', 'ready', 'id:aluno-a').includes('Fechar aviso de foto aprovada')); }
  finally {
    if (original) Object.defineProperty(globalThis, 'localStorage', original);
    else delete globalThis.localStorage;
  }
});

test('cache não confirma status durante a consulta', () => {
  for (const status of ['PENDING', 'APPROVED', 'REJECTED', undefined, null, '', 'OTHER']) {
    const html = render(status, 'loading');
    assert.equal(html, '', 'Sem card, mensagem transitória ou status de cache durante a consulta');
  }
});

test('falha de consulta não apresenta estado antigo como atual', () => {
  for (const status of ['PENDING', 'APPROVED', 'REJECTED']) {
    const html = render(status, 'unavailable');
    assert.ok(html.includes('Status da foto indisponível'));
    assert.ok(!html.includes('Foto aprovada') && !html.includes('Foto reprovada') && !html.includes('Foto em análise'));
  }
});
