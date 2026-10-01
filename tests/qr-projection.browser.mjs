import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { createServer } from 'vite';

const ref = 'aB3_cD4-eF5_gH6-iJ7_kL'; // 22 chars base64url
const expectedUrl = `https://carteirinha-digital-front-end-aluno.vercel.app/p/${ref}`;
const eventId = '22222222-2222-4222-8222-222222222222';

let viteServer;
let baseUrl = process.env.TEST_URL ? new URL(process.env.TEST_URL).origin : 'http://127.0.0.1:5173';
if (!process.env.TEST_URL) {
  viteServer = await createServer({
    server: { host: '127.0.0.1', port: 5173, strictPort: false },
    logLevel: 'error',
  });
  await viteServer.listen();
  const addr = viteServer.httpServer?.address();
  const actualPort = typeof addr === 'object' && addr?.port ? addr.port : 5173;
  baseUrl = `http://127.0.0.1:${actualPort}`;
}

const browser = await chromium.launch({
  channel: process.env.BROWSER_CHANNEL || 'chrome',
  headless: true,
});

try {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    serviceWorkers: 'block',
  });

  await context.addInitScript(() => {
    localStorage.setItem('token', 'student-test-token');
    localStorage.removeItem('mustChangePassword');
  });

  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (err) => errors.push(err.message));

  // =========================================================================
  // FASE 1: Renderizar QR Code real da Secretaria e decodificar pixels via html5-qrcode
  // =========================================================================
  console.log('1. Renderizando projeção do QR Code e decodificando pixels com html5-qrcode real...');

  // Abre harness de projeção com o componente real QRCodeSVG servido pelo Vite
  await page.goto(`${baseUrl}/tests/qr-render.html?value=${encodeURIComponent(expectedUrl)}`);
  const qrSvg = page.locator('[data-testid="attendance-qr"]');
  await qrSvg.waitFor();

  // Captura o screenshot dos pixels reais renderizados do SVG
  const qrImageBuffer = await qrSvg.screenshot({ type: 'png' });
  const base64DataUrl = `data:image/png;base64,${qrImageBuffer.toString('base64')}`;

  // Abre o harness de decodificação servido pelo Vite com html5-qrcode minificado
  await page.goto(`${baseUrl}/tests/qr-decode.html`);

  const decodeResult = await page.evaluate(async (dataUrl) => {
    return await window.decodeQrFromDataUrl(dataUrl);
  }, base64DataUrl);

  assert.equal(decodeResult.success, true, `Decodificação falhou: ${decodeResult.error}`);
  assert.equal(decodeResult.text, expectedUrl, 'Conteúdo dos pixels decodificados não coincide com a URL de presença');
  assert.match(decodeResult.text, /\/p\/[A-Za-z0-9_-]{22}$/, 'Não é uma URL de presença com referência válida');
  assert.doesNotMatch(decodeResult.text, /^eyJ/, 'O QR Code renderizado não deve ser um JWT');
  console.log('   ✓ Pixels decodificados com sucesso: URL real autorizada extraída.');

  // =========================================================================
  // FASE 2: Simular abertura pela Câmera Nativa no Frontend do Aluno
  // =========================================================================
  console.log('2. Testando fluxo do Aluno: abertura direta, sem scanner interno, GET sem escrita e confirmação em um toque...');

  let postCount = 0;
  let getCount = 0;

  // Intercepta rotas da API no Aluno
  await page.route('**/attendances/qr/**', async (route) => {
    getCount++;
    assert.equal(route.request().method(), 'GET');
    assert.equal(route.request().headers().authorization, 'Bearer student-test-token');
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        event: {
          id: eventId,
          title: 'Palestra de Engenharia de Software',
          speaker: 'Prof. Coordenador',
          location: 'Auditório Fatec',
        },
        checkpoint: { type: 'CHECK_IN' },
        expiresAt: new Date(Date.now() + 20000).toISOString(),
        serverTime: new Date().toISOString(),
      }),
    });
  });

  await page.route('**/attendances/scan-reference', async (route) => {
    postCount++;
    assert.equal(route.request().method(), 'POST');
    assert.equal(route.request().headers().authorization, 'Bearer student-test-token');
    const reqBody = route.request().postDataJSON();
    assert.equal(reqBody.qrReference, ref);

    if (postCount === 1) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          type: 'CHECK_IN',
          status: 'CHECKED_IN',
          eventTitle: 'Palestra de Engenharia de Software',
          timestamp: new Date().toISOString(),
          message: 'Entrada registrada com sucesso!',
        }),
      });
    } else {
      // Duplo toque / repetição: resposta idempotente
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          code: 'ALREADY_CHECKED_IN',
          timestamp: new Date().toISOString(),
          message: 'Entrada já registrada anteriormente',
        }),
      });
    }
  });

  // Abre a URL extraída dos pixels do QR diretamente no aplicativo do aluno
  const studentAppUrl = process.env.TEST_URL || `${baseUrl}/p/${ref}`;
  await page.goto(studentAppUrl);

  // Assertivas da prévia:
  await page.getByRole('heading', { name: 'Palestra de Engenharia de Software' }).waitFor();
  await page.getByText('Prof. Coordenador').waitFor();
  await page.getByText('Auditório Fatec').waitFor();

  // Garante que o GET da prévia foi executado mas NENHUM POST foi disparado
  assert.ok(getCount >= 1, 'Deveria ter feito chamada GET de prévia');
  assert.equal(postCount, 0, 'NENHUMA presença deve ser gravada na visualização da prévia antes do clique');

  // Garante que a câmera interna NÃO foi aberta (pois veio da câmera nativa)
  const cameraVideos = await page.locator('video').count();
  assert.equal(cameraVideos, 0, 'Câmera interna não deve ser aberta no fluxo de link direto');

  // Confirmação em um toque: clica no botão "Confirmar presença"
  const confirmBtn = page.getByRole('button', { name: /Confirmar entrada|Confirmar presença/i });
  await confirmBtn.waitFor();
  await confirmBtn.click();

  // Assertivas do resultado:
  await page.getByRole('heading', { name: 'Entrada registrada!' }).waitFor();
  assert.equal(postCount, 1, 'Deve ter disparado exatamente 1 POST de confirmação de presença');

  console.log('   ✓ Prévia sem escrita, ausência de câmera interna e registro em um toque validados com sucesso.');

  // =========================================================================
  // FASE 3: Testar Expiração e Erro de Link
  // =========================================================================
  console.log('3. Testando comportamento em caso de QR expirado...');

  await page.route('**/attendances/qr/expiredRef123456789012', async (route) => {
    await route.fulfill({
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({
        statusCode: 400,
        code: 'EXPIRED_OR_INVALID_QR',
        message: 'QR Code expirado ou inválido. Faça uma nova leitura.',
      }),
    });
  });

  const expiredAppUrl = process.env.TEST_URL
    ? process.env.TEST_URL.replace(ref, 'expiredRef123456789012')
    : `${baseUrl}/p/expiredRef123456789012`;
  await page.goto(expiredAppUrl);

  await page.getByText(/QR Code Inválido ou Expirado/i).waitFor();
  await page.getByText(/Este QR Code já expirou/i).waitFor();
  await page.getByRole('link', { name: /Escanear novamente no telão/i }).waitFor();

  console.log('   ✓ Mensagem clara de QR expirado e orientação para nova leitura no telão verificadas.');

  assert.deepEqual(errors, []);
  console.log('\n=== PROVA INTEGRADA E DECODIFICAÇÃO DE PIXELS CONCLUÍDA COM 100% DE SUCESSO! ===\n');
} finally {
  await browser.close();
  if (viteServer) {
    await viteServer.close();
  }
}
