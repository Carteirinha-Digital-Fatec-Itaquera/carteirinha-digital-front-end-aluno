// Execute com o servidor Vite já aberto. Câmera e HTTP são controlados neste teste.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'chrome', headless: true });
const context = await browser.newContext({ viewport: {width:390,height:844}, serviceWorkers:'block' });
await context.addInitScript(() => {
  localStorage.setItem('token','test-student');
  localStorage.removeItem('mustChangePassword');
});
const page = await context.newPage();
const errors=[];
page.on('pageerror',error=>errors.push(error.message));
let calls=0;
let response={success:true,type:'CHECK_IN',status:'CHECKED_IN',eventTitle:'Arquitetura de Software',timestamp:'2026-09-29T15:00:00Z',message:'ok'};
let http=200;
const id='11111111-1111-4111-8111-111111111111';
const encode=data=>Buffer.from(JSON.stringify(data)).toString('base64url');
const token=encode({alg:'HS256'})+'.'+encode({eventId:id,checkpoint:'CHECK_IN',checkpointVersion:2,jti:'test',iat:1,exp:21})+'.signature';
await page.route('**/attendances/scan',async route=>{
  calls++;
  assert.deepEqual(route.request().postDataJSON(),{qrToken:token});
  assert.equal(route.request().headers().authorization,'Bearer test-student');
  await new Promise(resolve=>setTimeout(resolve,250));
  await route.fulfill({status:http,json:response});
});
await page.route('**/attendances/me',route=>route.fulfill({json:[{eventId:id,checkInAt:'2026-09-29T13:00:00Z',checkOutAt:'2026-09-29T15:00:00Z'}]}));
await page.route(process.env.SCANNER_MODULE_GLOB || '**/*html5-qrcode*',route=>route.fulfill({contentType:'application/javascript',body:`
export const Html5QrcodeSupportedFormats={QR_CODE:0};
export class Html5Qrcode {
  isScanning=false;
  constructor(id){this.id=id;}
  async start(config,options,read){
    window.__cameraConfig=config; window.__read=read; window.__starting=(window.__starting||0)+1;
    if(window.__deny) throw {name:'NotAllowedError'};
    await new Promise(resolve=>setTimeout(resolve,window.__delay || 0));
    this.isScanning=true; window.__starts=(window.__starts||0)+1;
  }
  async stop(){this.isScanning=false;window.__stops=(window.__stops||0)+1;}
}` }));
try {
  await page.goto(process.env.TEST_URL || 'http://127.0.0.1:5173/eventos/scanner');
  await page.getByRole('heading',{name:'Registrar presença',exact:true}).waitFor();
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  if(process.env.SCREENSHOT_DIR) await page.screenshot({path:process.env.SCREENSHOT_DIR+'/scanner-mobile.png',fullPage:true});
  await page.getByRole('button',{name:'Abrir câmera',exact:true}).click();
  await page.getByText('Câmera ativa', {exact:false}).waitFor();
  assert.equal(await page.evaluate(()=>window.__cameraConfig.facingMode),'environment');
  await page.evaluate(token=>{window.__read(token);window.__read(token);window.__read(token);},token);
  await page.getByRole('heading',{name:'Entrada registrada!',exact:true}).waitFor();
  assert.equal(calls,1);
  await page.waitForFunction(()=>window.__stops>=1);
  await page.getByRole('button',{name:'Ler outro QR / Tentar novamente'}).click();
  response={...response,type:'CHECK_OUT',status:'CONFIRMED'};
  await page.getByText('Usar token de teste',{exact:true}).click();
  await page.getByLabel('Token de presença',{exact:true}).fill(token);
  await page.getByRole('button',{name:'Enviar token',exact:true}).click();
  await page.getByRole('heading',{name:'Presença confirmada!',exact:true}).waitFor();
  await page.getByText('Entrada',{exact:true}).waitFor();
  assert.equal(await page.getByRole('link',{name:'Ver certificados'}).count(),1);
  if(process.env.SCREENSHOT_DIR) await page.screenshot({path:process.env.SCREENSHOT_DIR+'/scanner-checkout.png',fullPage:true});
  for(const [body,status,title] of [
    [{success:false,code:'ALREADY_CHECKED_IN',timestamp:response.timestamp,message:'duplicate'},200,'Entrada já registrada'],
    [{success:false,code:'ALREADY_CHECKED_OUT',timestamp:response.timestamp,message:'duplicate'},200,'Saída já registrada'],
    [{code:'QR_EXPIRED'},400,'QR Code inválido ou período de presença encerrado'],
    [{code:'CHECK_IN_REQUIRED'},400,'Não foi possível registrar a saída'],
    [{message:'erro'},500,'Não foi possível confirmar o registro'],
  ]) {
    await page.getByRole('button',{name:'Ler outro QR / Tentar novamente'}).click();
    response=body;http=status;
    await page.getByText('Usar token de teste',{exact:true}).click();
    await page.getByLabel('Token de presença',{exact:true}).fill(token);
    await page.getByRole('button',{name:'Enviar token',exact:true}).click();
    await page.getByRole('heading',{name:title,exact:true}).waitFor();
  }
  await page.getByRole('button',{name:'Ler outro QR / Tentar novamente'}).click();
  await page.evaluate(()=>window.__deny=true);
  await page.getByRole('button',{name:'Abrir câmera',exact:true}).click();
  await page.getByText(/Permissão de câmera negada/).waitFor();
  await page.getByRole('button',{name:'Desligar câmera',exact:true}).click();
  await page.evaluate(()=>{window.__deny=false;window.__delay=300;});
  const previousStops=await page.evaluate(()=>window.__stops||0);
  const previousStarting=await page.evaluate(()=>window.__starting||0);
  await page.getByRole('button',{name:'Abrir câmera',exact:true}).click();
  await page.waitForFunction(n=>window.__starting>n,previousStarting);
  await page.getByRole('button',{name:'Desligar câmera',exact:true}).click();
  await page.waitForFunction(n=>window.__stops>n,previousStops);
  await page.setViewportSize({width:1280,height:900});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  if(process.env.SCREENSHOT_DIR) await page.screenshot({path:process.env.SCREENSHOT_DIR+'/scanner-desktop.png',fullPage:true});
  assert.deepEqual(errors,[]);
  console.log('Browser OK: mobile/desktop, entrada, saída, duplicidade, erros, Bearer, envio único e cleanup tardio.');
} finally { await browser.close(); }
