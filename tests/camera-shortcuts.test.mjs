import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import Events from '../src/ui/screens/events/AlunoEventosScreen.tsx';
import Card from '../src/ui/screens/digitalStudentScan/DigitalStudentQrCode.tsx';
import Scanner from '../src/ui/screens/scanner/AlunoScannerScreen.tsx';
const render = (component, entry = '/') => renderToStaticMarkup(h(MemoryRouter, { initialEntries: [entry] }, h(component)));
test('events and card expose camera shortcut independently of loaded profile or events', () => {
 for (const component of [Events, Card]) {
  const html = render(component);
  assert.match(html, /Abrir câmera para registrar presença/);
  assert.match(html, /Leitor de presença em eventos/);
 }
});
test('internal navigation can request camera while direct scanner entry keeps explicit opening', () => {
 assert.match(render(Scanner, { pathname: '/eventos/scanner', state: { openCamera: true } }), /Solicitando acesso à câmera/);
 assert.match(render(Scanner, '/eventos/scanner'), /Pronto para participar/);
});
