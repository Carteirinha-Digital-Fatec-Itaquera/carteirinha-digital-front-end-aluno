import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { isApprovedProjectCreditHref } from '../src/utils/projectCreditContact.ts';
import ProjectCreditsScreen from '../src/ui/screens/credits/ProjectCreditsScreen.tsx';

test('isApprovedProjectCreditHref validates links correctly', () => {
  // Valid HTTPS links with query params and anchors
  assert.equal(
    isApprovedProjectCreditHref({
      kind: 'github',
      label: 'GitHub',
      href: 'https://github.com/wellingtonspdev?tab=repositories#featured',
    }),
    true,
  );

  assert.equal(
    isApprovedProjectCreditHref({
      kind: 'external',
      label: 'Blog Pessoal',
      href: 'https://techblog.example.com/posts/architecture?ref=fatec',
    }),
    true,
  );

  assert.equal(
    isApprovedProjectCreditHref({
      kind: 'email',
      label: 'Contato',
      href: 'mailto:wellington@example.com',
    }),
    true,
  );

  // Unsafe links must be rejected
  assert.equal(
    isApprovedProjectCreditHref({
      kind: 'portfolio',
      label: 'Inseguro',
      href: 'http://insecure.example.com',
    }),
    false,
  );

  assert.equal(
    isApprovedProjectCreditHref({
      kind: 'external',
      label: 'XSS',
      href: 'javascript:alert(1)',
    }),
    false,
  );

  assert.equal(
    isApprovedProjectCreditHref({
      kind: 'external',
      label: 'Data URI',
      href: 'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==',
    }),
    false,
  );

  assert.equal(
    isApprovedProjectCreditHref({
      kind: 'external',
      label: 'Credenciais',
      href: 'https://admin:pass@example.com',
    }),
    false,
  );

  assert.equal(
    isApprovedProjectCreditHref({
      kind: 'external',
      label: 'CRLF Injection',
      href: 'https://example.com/\r\nSet-Cookie:malicious',
    }),
    false,
  );
});

test('ProjectCreditsScreen renders static container without crashing', () => {
  const html = renderToStaticMarkup(
    h(MemoryRouter, { initialEntries: ['/creditos'] }, h(ProjectCreditsScreen)),
  );
  assert.ok(html.includes('Créditos do projeto'));
  assert.ok(html.includes('Quem constrói o projeto'));
});
