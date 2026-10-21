import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const origin = process.env.TEST_URL || 'http://127.0.0.1:5197';
const artifacts = process.env.TEST_ARTIFACT_DIR;
if (artifacts) await mkdir(artifacts, { recursive: true });
const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'msedge', headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
let visitorSession = true;
let cpfLinked = true;
let certificateAccess = false;
let recoveryCount = 0;
let downloadCount = 0;
const certificate = { id: '00000000-0000-4000-8000-000000000002', verificationCode: 'FATEC-EVT-TEST', revokedAt: null, event: { title: 'Palestra de teste' }, artifact: { state: 'READY' } };
await context.addInitScript(() => localStorage.setItem('token', 'stale-student-token'));
await context.route('**/*', async route => {
  const url = new URL(route.request().url());
  if (url.pathname.endsWith('/feedback')) return route.fulfill({ json: { success: true } });
  if (url.pathname === '/api/visitor/session') return route.fulfill(visitorSession ? { json: { id: 'visitor-1', name: 'Visitante de teste', hasCpf: cpfLinked } } : { status: 401, json: {} });
  if (url.pathname === '/api/visitor/certificates') return route.fulfill(visitorSession || certificateAccess ? { json: [certificate] } : { status: 401, json: { message: 'Acesse novamente por CPF.' } });
  if (url.pathname === '/api/visitor/certificates/access') {
    assert.equal(route.request().postDataJSON().cpf, '52998224725');
    recoveryCount++;
    certificateAccess = true;
    return route.fulfill({ json: { success: true } });
  }
  if (url.pathname === '/api/visitor/cpf') {
    assert.ok(visitorSession);
    assert.equal(route.request().postDataJSON().cpf, '52998224725');
    cpfLinked = true;
    return route.fulfill({ json: { success: true } });
  }
  if (url.pathname === '/api/visitor/logout') {
    visitorSession = false;
    certificateAccess = false;
    return route.fulfill({ json: { success: true } });
  }
  if (url.pathname.endsWith('/pdf')) {
    downloadCount++;
    return route.fulfill({ contentType: 'application/pdf', body: Buffer.from('%PDF-1.4\nlocal browser fixture\n%%EOF') });
  }
  if (url.origin !== origin || url.pathname.startsWith('/api/')) return route.fulfill({ status: 401, json: {} });
  return route.continue();
});
try {
  const page = await context.newPage();
  await page.goto(`${origin}/eventos/teste/avaliacao?perfil=visitante&title=Palestra%20de%20teste`);
  await page.getByRole('heading', { name: 'Como foi a atividade?' }).waitFor();
  for (const width of [320, 390, 1280]) {
    await page.setViewportSize({ width, height: width === 1280 ? 900 : 844 });
    const visual = await page.evaluate(() => {
      const header = document.querySelector('header');
      const card = document.querySelector('form');
      const style = getComputedStyle(header);
      return { background: style.backgroundColor, topRadius: style.borderTopLeftRadius, bottomRadius: style.borderBottomLeftRadius, separated: card.getBoundingClientRect().top > header.getBoundingClientRect().bottom, overflow: document.documentElement.scrollWidth > innerWidth, star: getComputedStyle(document.querySelector('[role="radio"]')).color };
    });
    assert.equal(visual.background, 'rgb(186, 26, 26)');
    assert.equal(visual.star, 'rgb(186, 26, 26)');
    assert.equal(visual.topRadius, '0px');
    assert.equal(visual.bottomRadius, '28px');
    assert.equal(visual.separated, true);
    assert.equal(visual.overflow, false);
    if (artifacts && width !== 320) await page.screenshot({ path: path.join(artifacts, `pesquisa-${width}.png`), fullPage: true });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('radio', { name: '4 estrelas' }).click();
  assert.equal(await page.getByRole('radio', { name: '4 estrelas' }).getAttribute('aria-checked'), 'true');
  await page.getByRole('button', { name: 'Enviar Avaliação' }).click();
  const link = page.getByRole('link', { name: 'Ver Meus Certificados' });
  await link.waitFor();
  assert.equal(await link.getAttribute('href'), '/visitantes/certificados');
  await link.click();
  await page.getByRole('heading', { name: 'Palestra de teste' }).waitFor();
  assert.equal(new URL(page.url()).pathname, '/visitantes/certificados');
  const downloaded = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Baixar PDF', exact: true }).click();
  assert.equal((await downloaded).suggestedFilename(), 'certificado-FATEC-EVT-TEST.pdf');
  assert.equal(downloadCount, 1);
  if (artifacts) await page.screenshot({ path: path.join(artifacts, 'certificados-visitante.png'), fullPage: true });

  await page.getByRole('button', { name: 'Sair deste acesso' }).click();
  await page.getByLabel('CPF', { exact: true }).fill('11111111111');
  await page.getByRole('button', { name: 'Acessar certificados', exact: true }).click();
  await page.getByRole('alert').filter({ hasText: 'Informe um CPF válido.' }).waitFor();
  assert.equal(recoveryCount, 0);
  await page.getByLabel('CPF', { exact: true }).fill('52998224725');
  await page.getByRole('button', { name: 'Acessar certificados', exact: true }).click();
  await page.getByRole('heading', { name: 'Palestra de teste' }).waitFor();
  assert.equal(recoveryCount, 1);

  certificateAccess = false;
  await page.getByRole('button', { name: 'Atualizar certificados' }).click();
  await page.getByRole('alert').filter({ hasText: 'Acesse novamente por CPF.' }).waitFor();
  assert.equal(await page.getByRole('button', { name: 'Baixar PDF', exact: true }).count(), 0);

  visitorSession = true;
  cpfLinked = false;
  await page.reload();
  await page.getByRole('button', { name: 'Vincular CPF e acessar', exact: true }).waitFor();
  await page.getByLabel('CPF', { exact: true }).fill('52998224725');
  await page.getByRole('button', { name: 'Vincular CPF e acessar', exact: true }).click();
  await page.getByText('Acesso aos certificados recuperado.', { exact: true }).waitFor();
  assert.equal(cpfLinked, true);

  await Promise.all([
    page.waitForResponse(response => response.url().endsWith('/visitor/session')),
    page.goto(`${origin}/eventos/teste/avaliacao?title=Teste`),
  ]);
  await page.getByRole('button', { name: 'Enviar Avaliação' }).click();
  await page.getByRole('link', { name: 'Ver Meus Certificados' }).waitFor();
  assert.equal(await page.getByRole('link', { name: 'Ver Meus Certificados' }).getAttribute('href'), '/visitantes/certificados');

  await page.goto(`${origin}/eventos/teste/avaliacao?perfil=aluno&title=Teste`);
  await page.getByRole('button', { name: 'Enviar Avaliação' }).click();
  await page.getByRole('link', { name: 'Ver Meus Certificados' }).waitFor();
  assert.equal(await page.getByRole('link', { name: 'Ver Meus Certificados' }).getAttribute('href'), '/certificados');
  console.log('PASS: visual em 320/390/1280px, visitante com token antigo de aluno, pesquisa, certificado/PDF, CPF inválido, recuperação, expiração, vínculo legado e destino de aluno. APIs simuladas; nenhum dado de produção alterado.');
} finally { await context.close(); await browser.close(); }
