import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
try {
 const context = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
 await context.addInitScript(() => {
  const claims = btoa(JSON.stringify({ accountId: '11111111-1111-4111-8111-111111111111', role: 'student' }));
  localStorage.setItem('token', `header.${claims}.signature`); localStorage.setItem('mustChangePassword', 'true');
 });
 await context.route('**/*', async route => {
  const url = new URL(route.request().url());
  if (url.pathname.includes('html5-qrcode')) return route.fulfill({ contentType: 'text/javascript', body: `export const Html5QrcodeSupportedFormats={QR_CODE:0};export class Html5Qrcode {isScanning=false;async start(){window.__cameraStarts=(window.__cameraStarts||0)+1;if(window.__denyCamera)throw {name:'NotAllowedError'};this.isScanning=true;}async stop(){this.isScanning=false;window.__cameraStops=(window.__cameraStops||0)+1;}}` });
  if (url.origin !== 'http://127.0.0.1:5198' || url.pathname.startsWith('/api/')) return route.abort();
  return route.continue();
 });
 const page = await context.newPage();
 for (const path of ['/eventos', '/qrCodeScan']) {
  await page.goto('http://127.0.0.1:5198' + path);
  const button = page.getByRole('button', { name: 'Abrir câmera para registrar presença' });
  await button.waitFor(); assert.ok((await button.boundingBox()).height >= 44);
  await button.click(); await page.waitForURL('**/eventos/scanner');
  await page.getByText('Câmera ativa · posicione o QR na mira').waitFor();
  assert.ok(await page.evaluate(() => window.__cameraStarts >= 1));
  await page.getByRole('button', { name: 'Desligar câmera' }).click();
  await page.waitForFunction(() => window.__cameraStops >= 1);
 }
 await page.goto('http://127.0.0.1:5198/eventos');
 await page.evaluate(() => { window.__denyCamera = true; });
 await page.getByRole('button', { name: 'Abrir câmera para registrar presença' }).click();
 await page.getByRole('button', { name: 'Reiniciar câmera' }).waitFor();
 await page.getByText(/Permissão de câmera negada/).waitFor();
 assert.equal(await page.evaluate(() => location.origin), 'http://127.0.0.1:5198');
 console.log('PASS: both shortcuts with unavailable APIs/profile, camera opens internally, stops, and permission failure remains recoverable. Camera hardware mocked.');
} finally { await browser.close(); }
