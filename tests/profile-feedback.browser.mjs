// API totalmente interceptada. Nenhuma escrita de teste alcança serviços reais.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { preview } from 'vite';
import { readFile, mkdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
const origin = 'http://127.0.0.1:5195',
  api = 'http://localhost:3098';
const output = resolve(
  process.env.PROFILE_EVIDENCE_DIR || '../../outputs/aluno-meu-perfil-motivo',
);
const enc = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
const token = (ra) =>
  'synthetic.' +
  enc({
    sub: ra,
    role: 'student',
    accountId: 'account-' + ra,
    exp: Math.floor(Date.now() / 1000) + 3600,
  }) +
  '.fixture';
const ra = '9999999999999',
  otherRa = '8888888888888';
const photoUrl = origin + '/synthetic-student.svg';
const picture =
  '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800"><rect width="600" height="800" fill="#eee"/><circle cx="300" cy="240" r="120" fill="#777"/><path d="M100 760V570a200 200 0 0 1 400 0v190" fill="#777"/></svg>';
const fixture = {
  ra,
  name: 'Luna Aluna Fictícia',
  socialName: null,
  email: 'luna@example.test',
  cpf: '00000000000',
  course: 'Curso de teste',
  status: 'Em curso',
  admission: '20261',
  dueDate: '2031-01-01',
  photo: '',
  photoStatus: 'REJECTED',
  rejectionReason: 'A fotografia está desfocada. Envie uma imagem nítida.',
};
const png = await readFile(
  new URL('../public/perfil_default.png', import.meta.url),
);
const message =
  'Sua fotografia não foi aprovada. Envie uma nova foto para análise.';
const server = await preview({
  preview: { host: '127.0.0.1', port: 5195, strictPort: true },
});
let browser;
const deferred = () => {
  let resolve;
  const promise = new Promise((r) => (resolve = r));
  return { promise, resolve };
};
try {
  browser = await chromium.launch();
  await mkdir(output, { recursive: true });
  for (const width of [320, 390, 768, 1440]) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      serviceWorkers: 'block',
    });
    context.setDefaultTimeout(20000);
    context.setDefaultNavigationTimeout(120000);
    await context.addInitScript((value) => {
      if (sessionStorage.getItem('profile-fixture-seeded')) return;
      sessionStorage.setItem('profile-fixture-seeded', '1');
      localStorage.setItem('token', value);
      localStorage.setItem('mustChangePassword', 'true');
    }, token(ra));
    const state = {
      profile: { ...fixture },
      calls: 0,
      uploads: 0,
      gate: null,
      fail: false,
      unauthorized: false,
    };
    const errors = [];
    await context.route('**/*', (r) =>
      new URL(r.request().url()).origin === origin ? r.continue() : r.abort(),
    );
    await context.route(origin + '/api/**', (r) =>
      r.fulfill({
        status: 503,
        json: { message: 'API auxiliar fora do escopo, simulada.' },
      }),
    );
    await context.route(origin + '/synthetic-student.svg', (r) =>
      r.fulfill({ contentType: 'image/svg+xml', body: picture }),
    );
    await context.route(api + '/**', async (route) => {
      const req = route.request(),
        url = new URL(req.url());
      const headers = {
        'access-control-allow-origin': origin,
        'access-control-allow-headers': 'authorization,content-type',
        'access-control-allow-methods': 'GET,POST,OPTIONS',
      };
      const reply = (json, status = 200) =>
        route.fulfill({ json, status, headers }).catch(() => undefined);
      if (req.method() === 'OPTIONS')
        return route.fulfill({ status: 204, headers });
      assert(req.headers().authorization?.startsWith('Bearer '));
      if (url.pathname.startsWith('/estudantes/encontrar-por-ra/')) {
        state.calls++;
        const requested = url.pathname.split('/').at(-1);
        const profile =
          requested === otherRa
            ? {
                ...fixture,
                ra: otherRa,
                name: 'Outra Pessoa Fictícia',
                email: 'outra@example.test',
                rejectionReason: null,
                photoStatus: 'PENDING',
              }
            : { ...state.profile };
        const gate = state.gate;
        state.gate = null;
        if (gate) await gate.promise;
        if (state.fail) return route.abort('failed');
        if (state.unauthorized)
          return reply(
            { code: 'UNAUTHORIZED', message: 'Sessão expirada' },
            401,
          );
        return reply(profile);
      }
      if (url.pathname === '/support/tickets/me')
        return reply({ items: [], nextCursor: null });
      if (url.pathname === '/estudantes/upload-foto') {
        assert.equal(req.method(), 'POST');
        state.uploads++;
        state.profile = {
          ...state.profile,
          photoStatus: 'PENDING',
          rejectionReason: 'Motivo antigo retido no banco',
        };
        return reply({ ok: '' });
      }
      throw Error('Endpoint inesperado: ' + req.method() + ' ' + url.pathname);
    });
    const page = await context.newPage();
    page.on('pageerror', (e) => errors.push(e.message));
    const capture = async (name) => {
      assert(
        await page.locator('body').evaluate((e) => e.scrollWidth <= innerWidth),
        'Sem overflow horizontal',
      );
      await page.screenshot({
        path: join(output, name + '-' + width + '.png'),
        fullPage: true,
        animations: 'disabled',
      });
    };
    const refresh = async () => {
      const response = page.waitForResponse((r) =>
        r.url().includes('/estudantes/encontrar-por-ra/'),
      );
      await page.evaluate(() => window.dispatchEvent(new Event('focus')));
      await response;
    };
    await page.goto(origin + '/MainMenu');
    await page
      .getByRole('heading', { name: 'Foto reprovada', exact: true })
      .waitFor();
    await page.getByText(message, { exact: true }).waitFor();
    await page.getByText(fixture.rejectionReason, { exact: false }).waitFor();
    assert.equal(
      await page
        .getByRole('button', { name: 'Meu Perfil', exact: true })
        .count(),
      1,
    );
    await capture('home-reprovada-com-motivo');
    const loaded = state.calls;
    await page.getByRole('button', { name: 'Meu Perfil', exact: true }).click();
    await page
      .getByRole('heading', { name: 'Meu Perfil', exact: true })
      .waitFor();
    await page.getByText(fixture.email, { exact: true }).waitFor();
    assert.equal(
      state.calls,
      loaded,
      'Perfil reutiliza a consulta recente da Home',
    );
    const avatar = await page
      .getByRole('button', { name: 'Ampliar foto', exact: true })
      .boundingBox();
    assert.equal(avatar.width, 112);
    assert.equal(avatar.height, 112);
    await capture('meu-perfil');
    const backResponse = page.waitForResponse((r) =>
      r.url().includes('/estudantes/encontrar-por-ra/'),
    );
    await page
      .getByRole('link', { name: 'Voltar ao menu', exact: true })
      .click();
    await backResponse;
    await page.getByText(message, { exact: true }).waitFor();
    assert.equal(
      state.calls,
      loaded + 1,
      'Voltar à Home revalida o status sem apagar a identificação',
    );
    const gate = deferred();
    state.gate = gate;
    state.profile = { ...state.profile, photoStatus: 'PENDING' };
    const request = page.waitForRequest((r) =>
      r.url().includes('/estudantes/encontrar-por-ra/'),
    );
    await page.evaluate(() => window.dispatchEvent(new Event('focus')));
    await request;
    assert(
      await page.getByText(message, { exact: true }).isVisible(),
      'Aviso não pisca durante atualização',
    );
    gate.resolve();
    await page
      .getByRole('heading', { name: 'Foto em análise', exact: true })
      .waitFor();
    assert.equal(await page.getByText('Motivo:', { exact: true }).count(), 0);
    state.profile = {
      ...state.profile,
      photoStatus: 'APPROVED',
      photo: photoUrl,
    };
    await refresh();
    await page
      .getByRole('heading', { name: 'Foto aprovada', exact: true })
      .waitFor();
    assert.equal(await page.getByText('Motivo:', { exact: true }).count(), 0);
    await page.getByRole('button', { name: 'Meu Perfil', exact: true }).click();
    await page.locator('img[src="' + photoUrl + '"]').waitFor();
    await capture('perfil-foto-aprovada');
    await page
      .getByRole('link', { name: 'Voltar ao menu', exact: true })
      .click();
    await page
      .getByRole('button', { name: 'Fechar aviso de foto aprovada' })
      .click();
    assert.equal(
      await page
        .getByRole('heading', { name: 'Foto aprovada', exact: true })
        .count(),
      0,
    );
    state.profile = {
      ...state.profile,
      photoStatus: 'REJECTED',
      rejectionReason: null,
    };
    await refresh();
    await page.getByText(message, { exact: true }).waitFor();
    assert.equal(await page.getByText('Motivo:', { exact: true }).count(), 0);
    await capture('home-reprovada-sem-motivo');
    const long =
      'Fotografia desfocada. ' +
      'Mantenha o rosto centralizado e o fundo neutro. '.repeat(20);
    state.profile = { ...state.profile, rejectionReason: long };
    await refresh();
    await page.getByText(long, { exact: false }).waitFor();
    await capture('home-motivo-longo');
    await page
      .getByRole('link', { name: 'Enviar nova foto', exact: true })
      .click();
    await page.locator('input[type=file]').setInputFiles({
      name: 'imagem-institucional-ficticia.png',
      mimeType: 'image/png',
      buffer: png,
    });
    await page
      .getByRole('button', { name: 'Confirmar Envio', exact: true })
      .click();
    await page
      .getByRole('heading', { name: 'Foto enviada com sucesso' })
      .waitFor();
    assert.equal(state.uploads, 1);
    await page.getByRole('button', { name: 'OK', exact: true }).click();
    await page
      .getByRole('heading', { name: 'Foto em análise', exact: true })
      .waitFor();
    assert.equal(await page.getByText('Motivo:', { exact: true }).count(), 0);
    state.profile = {
      ra,
      name: 'Luna Aluna Fictícia',
      photoStatus: 'NULL',
      photo: '',
    };
    await refresh();
    await page.getByRole('button', { name: 'Meu Perfil', exact: true }).click();
    await page
      .getByRole('heading', { name: 'Meu Perfil', exact: true })
      .waitFor();
    assert(
      (await page.getByText('Não informado', { exact: true }).count()) >= 4,
    );
    await capture('perfil-campos-ausentes');
    await page
      .getByRole('link', { name: 'Voltar ao menu', exact: true })
      .click();
    state.fail = true;
    await page.evaluate(() => window.dispatchEvent(new Event('focus')));
    await page
      .getByRole('heading', { name: 'Status da foto indisponível' })
      .waitFor();
    assert(
      await page
        .getByRole('heading', { name: 'Bem-vindo(a), Luna', exact: true })
        .isVisible(),
    );
    state.fail = false;
    const delayed = deferred();
    state.gate = delayed;
    const oldRequest = page.waitForRequest((r) =>
      r.url().includes('/estudantes/encontrar-por-ra/'),
    );
    await page.evaluate(() => window.dispatchEvent(new Event('focus')));
    await oldRequest;
    await page.evaluate((value) => {
      localStorage.setItem('token', value);
      window.dispatchEvent(new Event('storage'));
    }, token(otherRa));
    await page
      .getByRole('heading', { name: 'Bem-vindo(a), Outra', exact: true })
      .waitFor();
    delayed.resolve();
    await page.getByRole('button', { name: 'Meu Perfil', exact: true }).click();
    await page.getByText('outra@example.test', { exact: true }).waitFor();
    assert.equal(
      await page.getByText(fixture.email, { exact: true }).count(),
      0,
    );
    state.unauthorized = true;
    await page.evaluate(() => window.dispatchEvent(new Event('focus')));
    await page.waitForURL('**/login');
    assert.equal(
      await page.evaluate(() => localStorage.getItem('token')),
      null,
    );
    await page.goto(origin + '/meu-perfil');
    await page.waitForURL('**/login');
    assert.equal(
      await page.getByText('outra@example.test', { exact: true }).count(),
      0,
    );
    assert.deepEqual(errors, []);
    await context.close();
    console.log(
      'PASS ' +
        width +
        ': Meu Perfil, campos, cache de sessão, motivo literal, estados, upload simulado, resposta atrasada e 401.',
    );
  }
} finally {
  await browser?.close();
  await new Promise((done) => server.httpServer.close(done));
}
