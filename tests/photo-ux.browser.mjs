// Exercita o front-end real com HTTP interceptado; não é teste de integração do back-end.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { preview } from 'vite';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

const server = await preview({ preview: { host: '127.0.0.1', port: 5191, strictPort: true } });
let browser;
const origin = 'http://127.0.0.1:5191';
const photoUrl = `${origin}/test-photo.svg`;
const photo = '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800"><rect width="600" height="800" fill="#eee"/><circle cx="300" cy="240" r="120" fill="#777"/><path d="M100 760V570a200 200 0 0 1 400 0v190" fill="#777"/></svg>';
const profile = { ra: '123456', name: 'Aluno Teste', photoStatus: 'APPROVED', photo: photoUrl };
const token = `header.${Buffer.from(JSON.stringify({ sub: profile.ra })).toString('base64')}.fixture`;
const screenshotDir = process.env.PHOTO_UX_SCREENSHOTS;
if (screenshotDir) mkdirSync(screenshotDir, { recursive: true });

async function setup(viewport = { width: 390, height: 844 }, authenticated = true) {
  const context = await browser.newContext({ viewport, serviceWorkers: 'block' });
  await context.addInitScript(({ token, profile, authenticated }) => {
    if (sessionStorage.getItem('photo-test-init')) return;
    sessionStorage.setItem('photo-test-init', '1');
    if (authenticated) {
      localStorage.setItem('token', token);
      localStorage.setItem('@Carteirinha:profile', JSON.stringify(profile));
      localStorage.setItem('mustChangePassword', 'true');
    }
  }, { token, profile, authenticated });
  const state = { profile: { ...profile }, profileFailure: false, imageFailure: false, profileCalls: 0, uploadCalls: 0, loginCalls: 0, loginOutcome: 'error', loginGate: Promise.resolve(), imageGate: Promise.resolve(), profileGate: Promise.resolve() };
  await context.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.pathname.includes('/estudantes/encontrar-por-ra/')) {
      state.profileCalls++;
      await state.profileGate;
      return state.profileFailure ? route.abort('failed') : route.fulfill({ json: state.profile });
    }
    if (url.pathname.endsWith('/estudantes/upload-foto')) {
      state.uploadCalls++;
      state.profile = { ...state.profile, photoStatus: 'PENDING' };
      return route.fulfill({ json: { ok: '' } });
    }
    if (url.pathname.endsWith('/autenticacao/login')) {
      state.loginCalls++;
      await state.loginGate;
      if (state.loginOutcome === 'network') return route.abort('failed');
      return state.loginOutcome === 'success'
        ? route.fulfill({ json: { token, mustChangePassword: false } })
        : route.fulfill({ status: 401, json: { message: 'Credenciais inválidas' } });
    }
    if (url.pathname === '/test-photo.svg') {
      await state.imageGate;
      return state.imageFailure ? route.abort('failed') : route.fulfill({ contentType: 'image/svg+xml', body: photo });
    }
    if (url.origin !== origin) return route.abort('blockedbyclient');
    return route.continue();
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  return { context, page, state, errors };
}

let profileVisit = 0;
async function loadConfirmedProfile(page, state, navigate) {
  // Espera um dado da resposta ser renderizado, sem depender do antigo aviso de carregamento.
  const firstName = `Consulta${++profileVisit}`;
  state.profile = { ...state.profile, name: `${firstName} Teste` };
  await navigate();
  await page.getByRole('heading', { name: `Bem-vindo(a), ${firstName}`, exact: true }).waitFor();
}

async function assertFits(page) {
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, 'Sem overflow horizontal');
  const dialog = page.getByRole('dialog', { name: 'Sua foto' });
  if (await dialog.count()) {
    const bounds = await dialog.boundingBox();
    const viewport = page.viewportSize();
    assert.ok(bounds.x >= 0 && bounds.y >= 0 && bounds.x + bounds.width <= viewport.width + 1 && bounds.y + bounds.height <= viewport.height + 1);
  }
}

try {
  browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'msedge', headless: true, timeout: 30000 });
  {
    const { context, page, state, errors } = await setup();
    let releaseProfile;
    state.profileGate = new Promise(resolve => { releaseProfile = resolve; });
    state.profile.photoStatus = 'PENDING';
    const requested = page.waitForRequest(request => request.url().includes('/estudantes/encontrar-por-ra/'));
    await page.goto(`${origin}/MainMenu`);
    await requested;
    const card = page.getByRole('region', { name: 'Situação da fotografia' });
    assert.equal(await card.count(), 0, 'Cache aprovado não aparece enquanto o perfil é consultado');
    assert.equal(await page.getByText('Consultando situação da foto', { exact: false }).count(), 0);
    releaseProfile();
    await page.getByRole('heading', { name: 'Foto em análise' }).waitFor();
    assert.equal(state.profileCalls, 1);
    await page.getByRole('button', { name: 'Configurações', exact: true }).click();
    state.profileGate = new Promise(resolve => { releaseProfile = resolve; });
    const returned = page.waitForRequest(request => request.url().includes('/estudantes/encontrar-por-ra/'));
    await page.getByRole('link', { name: 'Voltar ao menu' }).click();
    await returned;
    assert.equal(await card.count(), 0, 'Sem card transitório ao retornar à Home');
    assert.equal(await page.getByText('Consultando situação da foto', { exact: false }).count(), 0);
    state.profileFailure = true;
    releaseProfile();
    await page.getByRole('heading', { name: 'Status da foto indisponível' }).waitFor();
    assert.equal(state.profileCalls, 2, 'Uma consulta por montagem, sem requisições adicionais');
    assert.deepEqual(errors, []);
    await context.close();
  }
  console.log('PASS: consulta silenciosa inicial e no retorno, sem status antigo; falha preservada');
  for (const width of [320, 1440]) {
    const { context, page, state, errors } = await setup({ width, height: 900 });
    await page.goto(`${origin}/MainMenu`);
    const close = page.getByRole('button', { name: 'Fechar aviso de foto aprovada' });
    await close.waitFor();
    const card = page.getByRole('region', { name: 'Situação da fotografia' });
    const textBounds = await card.locator('p').boundingBox();
    const closeBounds = await close.boundingBox();
    assert.ok(textBounds.x + textBounds.width <= closeBounds.x, 'X não sobrepõe o texto');
    await assertFits(page);
    if (screenshotDir) await card.screenshot({ path: path.join(screenshotDir, `approval-dismissible-${width}.png`) });
    const beforeCalls = state.profileCalls;
    const beforeProfile = await page.evaluate(() => localStorage.getItem('@Carteirinha:profile'));
    await close.focus();
    await page.keyboard.press('Enter');
    await card.waitFor({ state: 'detached' });
    assert.equal(state.profileCalls, beforeCalls);
    assert.equal(state.uploadCalls, 0);
    assert.equal(await page.evaluate(() => localStorage.getItem('@Carteirinha:profile')), beforeProfile);
    await page.getByRole('button', { name: 'Ampliar foto' }).click();
    await page.getByRole('img', { name: 'Foto do aluno ampliada' }).waitFor();
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Configurações', exact: true }).click();
    await loadConfirmedProfile(page, state, () => page.getByRole('link', { name: 'Voltar ao menu' }).click());
    assert.equal(await close.count(), 0);
    await loadConfirmedProfile(page, state, () => page.reload());
    assert.equal(await close.count(), 0);
    // Outro aluno no mesmo navegador não herda o fechamento.
    state.profile = { ...profile, id: 'aluno-b', ra: '654321' };
    await page.evaluate(() => localStorage.setItem('token', `header.${btoa(JSON.stringify({ sub: '654321' }))}.fixture`));
    await page.reload();
    await close.waitFor();
    // Volta ao primeiro aluno: nenhum outro status pode ser ocultado.
    await page.evaluate(token => localStorage.setItem('token', token), token);
    for (const status of ['PENDING', 'REJECTED', 'APPROVED']) {
      state.profile = { ...profile, photoStatus: status };
      await loadConfirmedProfile(page, state, () => page.reload());
      if (status === 'APPROVED') {
        await close.waitFor(); // Nova aprovação após PENDING/REJECTED volta a exibir o aviso.
        await page.getByRole('heading', { name: 'Foto aprovada', exact: true }).waitFor();
      } else {
        assert.equal(await close.count(), 0);
        if (status === 'PENDING') await page.getByRole('heading', { name: 'Foto em análise' }).waitFor();
        if (status === 'REJECTED') {
          await page.getByRole('heading', { name: 'Foto reprovada' }).waitFor();
          assert.equal(await page.getByRole('link', { name: 'Enviar nova foto' }).getAttribute('href'), '/UploadImage');
        }
      }
    }
    assert.deepEqual(errors, []);
    await context.close();
  }
  console.log('PASS: fechamento acessível, persistência, isolamento por aluno e preservação de outros status em mobile/desktop');

  {
    const { context, page, errors } = await setup();
    await page.goto(`${origin}/MainMenu`);
    const close = page.getByRole('button', { name: 'Fechar aviso de foto aprovada' });
    await close.waitFor();
    await page.evaluate(() => {
      Storage.prototype.setItem = () => { throw new Error('Storage blocked'); };
      Storage.prototype.getItem = () => { throw new Error('Storage blocked'); };
    });
    await close.click();
    await page.getByRole('region', { name: 'Situação da fotografia' }).waitFor({ state: 'detached' });
    assert.deepEqual(errors, []);
    await context.close();
  }
  console.log('PASS: fechamento local mesmo com armazenamento bloqueado');

  for (const viewport of [{ width: 320, height: 568 }, { width: 390, height: 844 }, { width: 1440, height: 900 }, { width: 844, height: 390 }]) {
    const { context, page, state, errors } = await setup(viewport);
    await page.goto(`${origin}/MainMenu`);
    await page.getByRole('heading', { name: 'Foto aprovada', exact: true }).waitFor();
    const opener = page.getByRole('button', { name: 'Ampliar foto' });
    const badge = opener.locator(':scope > span[aria-hidden=true]');
    assert.equal(await opener.textContent(), '', 'Indicador exclusivamente visual, sem texto Ampliar');
    assert.equal(await opener.locator('button, a').count(), 0, 'Sem controles interativos aninhados');
    const frame = await opener.locator('..').boundingBox();
    const badgeBounds = await badge.boundingBox();
    const expectedFrameSize = viewport.width <= 540 ? 136 : 150;
    assert.equal(frame.width, expectedFrameSize);
    assert.equal(frame.height, expectedFrameSize);
    const dx = badgeBounds.x + badgeBounds.width / 2 - (frame.x + frame.width / 2);
    const dy = badgeBounds.y + badgeBounds.height / 2 - (frame.y + frame.height / 2);
    assert.ok(dx > 0 && dy > 0 && Math.hypot(dx, dy) + badgeBounds.width / 2 > frame.width / 2, 'Ícone inferior direito ligeiramente fora do círculo');
    if (screenshotDir) await opener.locator('..').screenshot({ path: path.join(screenshotDir, `avatar-icon-${viewport.width}.png`) });
    await badge.click();
    await page.getByRole('dialog', { name: 'Sua foto' }).waitFor();
    await page.keyboard.press('Escape');
    await opener.focus();
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog', { name: 'Sua foto' });
    await dialog.waitFor();
    const image = dialog.getByRole('img', { name: 'Foto do aluno ampliada' });
    await image.waitFor({ state: 'visible' });
    assert.equal(await image.evaluate(img => getComputedStyle(img).objectFit), 'contain');
    assert.equal(await image.evaluate(img => img.naturalWidth / img.naturalHeight), .75);
    assert.equal(await dialog.getByRole('button', { name: 'Fechar visualização da foto' }).evaluate(el => el === document.activeElement), true);
    for (let i = 0; i < 4; i++) {
      await page.keyboard.press('Tab');
      // O diálogo nativo pode ceder foco à barra do navegador entre ciclos;
      // nenhum controle da página atrás dele pode receber foco.
      assert.equal(await dialog.evaluate(el => el.contains(document.activeElement) || document.activeElement === document.body), true);
    }
    await assertFits(page);
    if (screenshotDir) await page.screenshot({ path: path.join(screenshotDir, `photo-${viewport.width}x${viewport.height}.png`) });
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'detached' });
    assert.equal(await opener.evaluate(el => el === document.activeElement), true);
    await opener.click();
    await page.getByRole('button', { name: 'Fechar visualização da foto' }).click();
    assert.equal(await opener.evaluate(el => el === document.activeElement), true);
    await opener.click();
    await page.getByRole('link', { name: 'Alterar foto', exact: true }).click();
    await page.waitForURL('**/UploadImage');
    await page.getByRole('heading', { name: 'Enviar fotografia' }).waitFor();
    assert.equal(state.uploadCalls, 0, 'Ampliar/navegar não envia foto');
    assert.deepEqual(errors, []);
    await context.close();
  }
  console.log('PASS: foto, teclado, foco, Escape, proporção, upload e layout em quatro viewports');

  {
    const { context, page, state, errors } = await setup();
    for (const status of ['PENDING', 'REJECTED', '', 'NULL', 'OTHER']) {
      state.profile = { ...profile, photoStatus: status };
      await loadConfirmedProfile(page, state, () => page.goto(`${origin}/MainMenu`));
      assert.equal(await page.getByRole('heading', { name: 'Foto aprovada', exact: true }).count(), 0);
      if (status === 'PENDING') await page.getByRole('heading', { name: 'Foto em análise' }).waitFor();
      if (status === 'REJECTED') {
        await page.getByRole('heading', { name: 'Foto reprovada' }).waitFor();
        assert.equal(await page.getByRole('link', { name: 'Enviar nova foto' }).getAttribute('href'), '/UploadImage');
      }
      await page.getByRole('button', { name: 'Ampliar foto' }).click();
      await page.getByText('Nenhuma foto aprovada disponível para ampliar.').waitFor();
      assert.equal(await page.getByRole('dialog').getByRole('img').count(), 0);
    }
    state.profile = { ...profile, photo: '' };
    await page.goto(`${origin}/MainMenu`);
    await page.getByRole('heading', { name: 'Foto aprovada', exact: true }).waitFor();
    await page.getByRole('button', { name: 'Ampliar foto' }).click();
    await page.getByText('Nenhuma foto aprovada disponível para ampliar.').waitFor();
    assert.deepEqual(errors, []);
    await context.close();
  }
  console.log('PASS: estados pendente, reprovado, ausente/desconhecido e foto ausente');

  {
    const { context, page, state, errors } = await setup();
    let releaseImage;
    state.imageGate = new Promise(resolve => { releaseImage = resolve; });
    await page.goto(`${origin}/MainMenu`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('heading', { name: 'Foto aprovada', exact: true }).waitFor();
    await page.getByRole('button', { name: 'Ampliar foto' }).click();
    await page.getByText('Carregando foto...').waitFor();
    state.imageFailure = true;
    releaseImage();
    await page.getByText('Não foi possível carregar sua foto.').waitFor();
    assert.equal(await page.getByRole('dialog').getByRole('img').count(), 0);
    await page.getByRole('link', { name: 'Alterar foto', exact: true }).click();
    await page.waitForURL('**/UploadImage');
    assert.deepEqual(errors, []);
    await context.close();
  }
  console.log('PASS: carregamento e falha de imagem sem imagem quebrada');

  {
    const { context, page, state, errors } = await setup();
    state.profileFailure = true;
    await page.goto(`${origin}/MainMenu`);
    await page.getByRole('heading', { name: 'Status da foto indisponível' }).waitFor();
    assert.equal(await page.getByRole('heading', { name: 'Foto aprovada', exact: true }).count(), 0);
    state.profileFailure = false;
    state.profile.photoStatus = 'PENDING';
    await page.getByRole('button', { name: 'Configurações', exact: true }).click();
    await page.getByRole('link', { name: 'Voltar ao menu' }).click();
    await page.getByRole('heading', { name: 'Foto em análise' }).waitFor();
    assert.equal(state.profileCalls, 2, 'Uma consulta a cada montagem em produção');
    await page.evaluate(() => {
      Object.defineProperty(navigator, 'onLine', { configurable: true, value: false });
      window.dispatchEvent(new Event('offline'));
    });
    await page.getByRole('heading', { name: 'Status da foto indisponível' }).waitFor();
    assert.equal(await page.getByRole('heading', { name: 'Foto em análise' }).count(), 0);
    state.profile.photoStatus = 'REJECTED';
    await page.evaluate(() => {
      Object.defineProperty(navigator, 'onLine', { configurable: true, value: true });
      window.dispatchEvent(new Event('online'));
    });
    await page.getByRole('heading', { name: 'Foto reprovada' }).waitFor();
    assert.equal(state.profileCalls, 3);
    assert.deepEqual(errors, []);
    await context.close();
  }
  console.log('PASS: falha, cache, retorno de navegação, offline e reconexão');

  {
    const { context, page, state, errors } = await setup();
    await page.goto(`${origin}/MainMenu`);
    await page.getByRole('heading', { name: 'Foto aprovada', exact: true }).waitFor();
    await page.getByRole('button', { name: 'Enviar Foto', exact: true }).click();
    await page.getByRole('button', { name: 'Continuar', exact: true }).click();
    await page.waitForURL('**/UploadImage');
    // Usa o upload real do front-end com uma imagem de teste, sem acesso ao servidor real.
    await page.locator('input[type=file]').setInputFiles({ name: 'photo.svg', mimeType: 'image/svg+xml', buffer: Buffer.from(photo) });
    await page.getByRole('button', { name: 'Confirmar Envio' }).click();
    await page.getByRole('heading', { name: 'Foto enviada com sucesso' }).waitFor();
    await page.getByRole('button', { name: 'OK', exact: true }).click();
    await page.waitForURL('**/MainMenu');
    await page.getByRole('heading', { name: 'Foto em análise' }).waitFor();
    assert.equal(state.uploadCalls, 1);
    assert.equal(state.profileCalls, 3, 'Consulta inicial, RA no upload e retorno ao menu');
    if (screenshotDir) await page.screenshot({ path: path.join(screenshotDir, 'status-pending-mobile.png'), fullPage: true });
    assert.deepEqual(errors, []);
    await context.close();
  }
  console.log('PASS: envio existente e atualização pelo perfil após retorno');

  for (const outcome of ['error', 'network', 'success']) {
    const { context, page, state, errors } = await setup({ width: 390, height: 844 }, false);
    let releaseLogin;
    state.loginOutcome = outcome;
    state.loginGate = new Promise(resolve => { releaseLogin = resolve; });
    await page.goto(`${origin}/login`);
    await page.getByRole('button', { name: 'Entrar', exact: true }).click();
    const status = page.getByRole('status').filter({ hasText: 'Fazendo login' });
    await status.waitFor();
    assert.equal(await page.getByRole('button', { name: 'Entrar', exact: true }).count(), 0);
    const dots = status.locator('[aria-hidden=true] > span');
    assert.equal(await dots.count(), 3);
    const timings = await dots.evaluateAll(nodes => nodes.map(el => ({ name: getComputedStyle(el).animationName, delay: getComputedStyle(el).animationDelay })));
    assert.ok(timings.every(t => t.name !== 'none'));
    assert.deepEqual(timings.map(t => t.delay), ['0s', '0.2s', '0.4s']);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    assert.equal(await dots.first().evaluate(el => getComputedStyle(el).animationName), 'none');
    await assertFits(page);
    assert.equal(state.loginCalls, 1);
    releaseLogin();
    if (outcome === 'success') await page.waitForURL('**/MainMenu');
    else {
      await page.getByRole('dialog').waitFor();
      await page.getByRole('button', { name: 'Fechar', exact: true }).click();
      await page.getByRole('button', { name: 'Entrar', exact: true }).waitFor();
    }
    assert.equal(await page.getByRole('status').filter({ hasText: 'Fazendo login' }).count(), 0);
    assert.deepEqual(errors, []);
    await context.close();
  }
  console.log('PASS: animação, movimento reduzido, envio único e encerramento por sucesso/erro HTTP/conexão');
} finally {
  await browser?.close();
  await server.close();
}
