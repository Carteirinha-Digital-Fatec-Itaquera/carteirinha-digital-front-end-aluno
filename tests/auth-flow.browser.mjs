import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { preview } from 'vite';

const browserChannel = process.env.BROWSER_CHANNEL || 'msedge';
const origin = process.env.TEST_URL || 'http://127.0.0.1:5187';
const reference = 'auth_audit_reference_123456';
const eventId = '00000000-0000-4000-8000-000000000003';
const seriesId = '00000000-0000-4000-8000-000000000004';
const event = {
  id: eventId,
  title: 'Atividade de teste de autenticacao',
  speaker: 'Palestrante teste',
  location: 'Auditorio',
  startsAt: new Date(Date.now() + 3600000).toISOString(),
  endsAt: new Date(Date.now() + 7200000).toISOString(),
};

let previewServer = null;
try {
  await fetch(origin);
} catch {
  previewServer = await preview({ preview: { port: 5187, host: '127.0.0.1' } });
}

const browser = await chromium.launch({ channel: browserChannel, headless: true });

async function createAuditContext(options = {}) {
  const { initToken, initProfile, mode } = options;
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });

  await ctx.addInitScript(({ initToken, initProfile }) => {
    if (sessionStorage.getItem('test-initialized') === '1') return;
    localStorage.clear();
    sessionStorage.clear();
    sessionStorage.setItem('test-initialized', '1');
    if (initToken) localStorage.setItem('token', initToken);
    if (initProfile) localStorage.setItem('@Carteirinha:profile', JSON.stringify(initProfile));
  }, { initToken, initProfile });

  await ctx.route('**/*', async (route) => {
    const url = new URL(route.request().url());

    if (url.pathname.endsWith('/autenticacao/login')) {
      return route.fulfill({
        status: 200,
        json: {
          token: 'fresh-valid-auth-token',
          mustChangePassword: Boolean(mode === 'first-access'),
        },
      });
    }

    if (url.pathname.includes('/attendances/qr/')) {
      if (mode === '401-token') {
        return route.fulfill({ status: 401, json: { message: 'Token de estudante expirado.' } });
      }
      return route.fulfill({
        status: 200,
        json: {
          event,
          checkpoint: { type: 'CHECK_IN' },
          locationRequired: false,
          expiresAt: new Date(Date.now() + 20000).toISOString(),
          serverTime: new Date().toISOString(),
        },
      });
    }

    if (url.pathname.includes('/estudantes/encontrar-por-ra/')) {
      if (mode === 'profile-network-fail') {
        return route.abort('failed');
      }
      if (mode === 'profile-401') {
        return route.fulfill({ status: 401, json: { message: 'Sessao expirada.' } });
      }
      return route.fulfill({
        status: 200,
        json: {
          ra: '123456',
          name: 'Estudante Teste',
          email: 'estudante@fatec.sp.gov.br',
          course: 'DSM',
        },
      });
    }

    if (url.pathname.includes('/public/events/series')) {
      if (mode === 'series-503') {
        return route.fulfill({ status: 503, json: { message: 'Falha simulada 503 ao carregar eventos.' } });
      }
      if (mode === 'series-network-fail') {
        return route.abort('failed');
      }
      return route.fulfill({
        status: 200,
        json: [{ id: seriesId, title: 'Edicao Teste', slug: 'ed-teste', cpfRequired: false, retentionAt: new Date(Date.now() + 86400000).toISOString(), courses: ['DSM'], events: [event] }],
      });
    }

    if (url.pathname.includes('/public/events/qr/')) {
      return route.fulfill({
        status: 200,
        json: { event, checkpoint: { type: 'CHECK_IN' }, seriesId, visitorsAllowed: true, locationRequired: false, expiresAt: new Date(Date.now() + 20000).toISOString(), serverTime: new Date().toISOString() },
      });
    }

    if (url.pathname.includes('/visitor/session')) {
      return route.fulfill({ status: 401, json: { message: 'Identifique-se.' } });
    }

    if (url.pathname.includes('/visitor/certificates') || url.pathname.includes('/visitor/attendances')) {
      return route.fulfill({ json: [] });
    }

    if (url.origin !== origin) {
      return route.fulfill({ status: 401, json: { message: 'External requests blocked in test' } });
    }

    return route.continue();
  });

  return ctx;
}

try {
  // Test 1: Navegador limpo -> login bem-sucedido -> chega em /p/:reference/aluno preservando returnUrl
  {
    const ctx = await createAuditContext();
    const page = await ctx.newPage();
    await page.goto(`${origin}/p/${reference}`);
    await page.getByRole('button', { name: /Sou estudante da Fatec Itaquera/i }).click();
    await page.waitForURL('**/login');
    assert.equal(await page.evaluate(() => sessionStorage.getItem('returnUrl')), `/p/${reference}/aluno`);

    await page.locator('input').first().fill('estudante@fatec.sp.gov.br');
    await page.locator('input[type="password"]').fill('senha-teste');
    await page.getByRole('button', { name: 'Entrar', exact: true }).click();
    await page.waitForURL(`**/p/${reference}/aluno`, { timeout: 10000 });
    assert.equal(new URL(page.url()).pathname, `/p/${reference}/aluno`);
    assert.equal(await page.evaluate(() => Boolean(localStorage.getItem('token'))), true);
    await ctx.close();
  }

  // Test 2: Primeiro acesso (mustChangePassword: true) -> redireciona para /first-access
  {
    const ctx = await createAuditContext({ mode: 'first-access' });
    const page = await ctx.newPage();
    await page.goto(`${origin}/p/${reference}`);
    await page.getByRole('button', { name: /Sou estudante da Fatec Itaquera/i }).click();
    await page.waitForURL('**/login');
    await page.locator('input').first().fill('estudante@fatec.sp.gov.br');
    await page.locator('input[type="password"]').fill('senha-teste');
    await page.getByRole('button', { name: 'Entrar', exact: true }).click();
    await page.waitForURL('**/first-access', { timeout: 10000 });
    assert.equal(new URL(page.url()).pathname, '/first-access');
    await ctx.close();
  }

  // Test 3: Token presente e perfil ausente -> rota autenticada acessivel sem loop
  {
    const ctx = await createAuditContext({ initToken: 'sample-student-token' });
    const page = await ctx.newPage();
    await page.goto(`${origin}/p/${reference}/aluno`);
    await page.waitForSelector('text=Atividade de teste de autenticacao', { timeout: 10000 });
    assert.equal(new URL(page.url()).pathname, `/p/${reference}/aluno`);
    assert.equal(await page.evaluate(() => Boolean(localStorage.getItem('@Carteirinha:profile'))), false);
    await ctx.close();
  }

  // Test 4: Perfil presente e token ausente -> redireciona para /login e expurga perfil
  {
    const ctx = await createAuditContext({ initProfile: { name: 'Aluno Sem Token', ra: '999' } });
    const page = await ctx.newPage();
    await page.goto(`${origin}/p/${reference}/aluno`);
    await page.waitForURL('**/login', { timeout: 10000 });
    assert.equal(new URL(page.url()).pathname, '/login');
    assert.equal(await page.evaluate(() => Boolean(localStorage.getItem('@Carteirinha:profile'))), false);
    await ctx.close();
  }

  // Test 5: Token expirado (401 na API) -> retorna ao /login preservando returnUrl
  {
    const ctx = await createAuditContext({ initToken: 'expired-token', mode: '401-token' });
    const page = await ctx.newPage();
    await page.goto(`${origin}/p/${reference}/aluno`);
    await page.waitForURL('**/login', { timeout: 10000 });
    assert.equal(new URL(page.url()).pathname, '/login');
    assert.equal(await page.evaluate(() => sessionStorage.getItem('returnUrl')), `/p/${reference}/aluno`);
    assert.equal(await page.evaluate(() => Boolean(localStorage.getItem('token'))), false);
    await ctx.close();
  }

  // Test 6: Acesso normal ao /MainMenu apos login sem returnUrl
  {
    const ctx = await createAuditContext();
    const page = await ctx.newPage();
    await page.goto(`${origin}/login`);
    await page.locator('input').first().fill('estudante@fatec.sp.gov.br');
    await page.locator('input[type="password"]').fill('senha-teste');
    await page.getByRole('button', { name: 'Entrar', exact: true }).click();
    await page.waitForURL('**/MainMenu', { timeout: 10000 });
    assert.equal(new URL(page.url()).pathname, '/MainMenu');
    await ctx.close();
  }

  // Test 7: Falha de rede ao buscar perfil no MainMenu nao expulsa o usuario (mantem sessao)
  {
    const ctx = await createAuditContext({ initToken: 'valid-token', mode: 'profile-network-fail' });
    const page = await ctx.newPage();
    await page.goto(`${origin}/MainMenu`);
    await page.waitForTimeout(1000);
    assert.equal(new URL(page.url()).pathname, '/MainMenu');
    assert.equal(await page.evaluate(() => Boolean(localStorage.getItem('token'))), true);
    await ctx.close();
  }

  // Test 8: Falha inicial 503 em /visitantes abre modal central
  {
    const ctx = await createAuditContext({ mode: 'series-503' });
    const page = await ctx.newPage();
    await page.goto(`${origin}/visitantes?ref=${reference}`);
    await page.getByText('Falha simulada 503 ao carregar eventos.', { exact: true }).waitFor({ timeout: 10000 });
    const dialogCount = await page.getByRole('dialog').count();
    assert.ok(dialogCount > 0, 'Modal central deve ser exibido na falha 503 inicial');
    await ctx.close();
  }

  console.log('PASS: todos os testes de fluxo de autenticacao e modais passaram com sucesso.');
} finally {
  await browser.close();
  if (previewServer) {
    await previewServer.close();
  }
}
