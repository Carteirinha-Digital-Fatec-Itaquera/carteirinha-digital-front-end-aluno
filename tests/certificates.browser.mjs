// Execute após npm run build e npm run preview -- --port 5173.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { certificatesMock as certificates, certificateDetailsMock as details } from '../src/mocks/certificates.mock.ts';
const origin=process.env.TEST_ORIGIN || 'http://127.0.0.1:5173';
const screenshotDir=process.env.SCREENSHOT_DIR;
if(screenshotDir)mkdirSync(screenshotDir,{recursive:true});
const browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL || 'chrome',headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block',acceptDownloads:true});
await context.tracing.start({screenshots:true,snapshots:true,sources:true});
await context.addInitScript(()=>{
 if(location.pathname.startsWith('/certificado/verificar/')) localStorage.clear();
 else {localStorage.setItem('token','test-student');localStorage.removeItem('mustChangePassword');}
});
const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
const warnings=[], pdfResponses=[], downloadEvents=[];
page.on('console',message=>{if(['warning','error'].includes(message.type()))warnings.push(message.text());});
page.on('response',response=>{
 if(response.request().resourceType()==='fetch' && /\/certificates\/[^/]+\/pdf$/.test(new URL(response.url()).pathname))
  pdfResponses.push({status:response.status(),contentType:response.headers()['content-type']});
});
page.on('download',download=>downloadEvents.push({filename:download.suggestedFilename()}));
console.log('Browser:',browser.version(),'| Node:',process.version,'| Origem:',origin);
let list=certificates, detail=details, pdfStatus=200, listStatus=200, pdfCalls=0;
// PDF mínimo válido com offsets/xref; continua sendo apenas uma fixture de transporte.
const objects=[
 '<< /Type /Catalog /Pages 2 0 R >>',
 '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
 '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 200 200] /Resources << >> /Contents 4 0 R >>',
 '<< /Length 0 >>\nstream\nendstream',
];
let pdfText='%PDF-1.4\n';const offsets=[0];
for(const [index,object] of objects.entries()){offsets.push(Buffer.byteLength(pdfText));pdfText+=`${index+1} 0 obj\n${object}\nendobj\n`;}
const xref=Buffer.byteLength(pdfText);
pdfText+=`xref\n0 ${offsets.length}\n0000000000 65535 f \n`+offsets.slice(1).map(offset=>`${String(offset).padStart(10,'0')} 00000 n \n`).join('')+`trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
const pdf=Buffer.from(pdfText);
let verification={valid:true,code:details.verificationCode,...details.payloadSnapshot,issuedAt:details.issuedAt}, verifyStatus=200;
await context.route('**/certificates/**',async route=>{
 const request=route.request();
 const path=new URL(request.url()).pathname;
 // O glob também alcança /src/ui/screens/certificates/*.tsx no Vite dev.
 // Esses módulos não são chamadas autenticadas da API.
 if(!['fetch','xhr'].includes(request.resourceType()) || !/\/certificates\/(?:me|verify\/[^/]+|[^/]+(?:\/pdf)?)$/.test(path))return route.fallback();
 if(path.includes('/verify/')) {assert.equal(route.request().headers().authorization,undefined);return route.fulfill({status:verifyStatus,json:verification});}
 assert.equal(route.request().headers().authorization,'Bearer test-student');
 if(path.endsWith('/me'))return route.fulfill({status:listStatus,json:list});
 if(path.endsWith('/pdf')) {pdfCalls++;await new Promise(r=>setTimeout(r,300));return route.fulfill({status:pdfStatus,contentType:pdfStatus===200?'application/pdf':'application/json',body:pdfStatus===200?pdf:'{}'});}
 return route.fulfill({json:detail});
});
const noOverflow=async()=>assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
try {
 await page.goto(origin+'/certificados');
 assert.equal(await page.locator('script[src*="/@vite/client"]').count(),0,
  'Este teste decodifica o QR usando dist/assets. Use npm run build e npm run preview -- --host 127.0.0.1 --port 5173 --strictPort; encerre o servidor dev nessa porta.');
 await page.getByText('Visualizar certificado',{exact:true}).waitFor();await noOverflow();
 if(screenshotDir)await page.screenshot({path:screenshotDir+'/certificados-mobile.png',fullPage:true});
 await page.getByText('Visualizar certificado',{exact:true}).click();await page.getByRole('article',{name:'Certificado de participação'}).waitFor();await noOverflow();
 assert.ok((await page.getByRole('article').innerText()).includes('05/10/2026'));
 if(screenshotDir)await page.screenshot({path:screenshotDir+'/certificado-mobile.png',fullPage:true});
 const qr=await page.getByTestId('certificate-qr').screenshot();
 const moduleFile=readdirSync('dist/assets').find(name=>name.endsWith('.js')&&/export\{[^}]* as Html5Qrcode,/.test(readFileSync('dist/assets/'+name,'utf8')));
 assert.ok(moduleFile,'Build precisa conter a biblioteca real de leitura');
 const decoded=await page.evaluate(async({base64,moduleUrl})=>{
  const {Html5Qrcode}=await import(moduleUrl);const host=document.createElement('div');host.id='test-qr-reader';document.body.append(host);
  const reader=new Html5Qrcode(host.id);try{return await reader.scanFile(new File([Uint8Array.from(atob(base64),c=>c.charCodeAt(0))],'qr.png',{type:'image/png'}),false);}finally{reader.clear();host.remove();}
 },{base64:qr.toString('base64'),moduleUrl:'/assets/'+moduleFile});
 assert.equal(decoded,origin+'/certificado/verificar/'+details.verificationCode);
 // Promise.all observa a rejeição desde o início; não deixa um timeout sem catch
 // enquanto outra asserção/click ainda está pendente. Continua exigindo download real.
 const [download]=await Promise.all([
  page.waitForEvent('download',{timeout:30000}),
  (async()=>{
   await page.getByRole('button',{name:'Baixar certificado',exact:true}).click();
   await page.getByRole('status').filter({hasText:'Download solicitado.'}).waitFor({timeout:10000});
   assert.equal(pdfCalls,1,'O clique deve fazer apenas uma requisição de PDF');
   assert.match(await page.getByRole('link',{name:'abra o PDF',exact:true}).getAttribute('href'),/^blob:/);
  })(),
 ]);
 assert.equal(await download.failure(),null,'O navegador iniciou o download, mas não o concluiu');
 const stream=await download.createReadStream();assert.ok(stream,'Download não disponibilizou um stream');
 const chunks=[];for await(const chunk of stream)chunks.push(chunk);
 assert.deepEqual(Buffer.concat(chunks),pdf);assert.equal(pdfCalls,1);
 assert.match(download.suggestedFilename(),/^certificado-.*\.pdf$/);
 pdfStatus=500;await page.getByRole('button',{name:'Baixar certificado',exact:true}).click();await page.getByRole('alert').filter({hasText:'Não foi possível baixar'}).waitFor();
 await page.setViewportSize({width:1280,height:900});await noOverflow();if(screenshotDir)await page.screenshot({path:screenshotDir+'/certificado-desktop.png',fullPage:true});
 detail={...details,revokedAt:details.issuedAt};await page.reload();await page.getByText('CERTIFICADO REVOGADO',{exact:true}).waitFor();assert.equal(await page.getByRole('button',{name:'Baixar certificado',exact:true}).isDisabled(),true);
 list=[];await page.goto(origin+'/certificados');await page.getByRole('heading',{name:'Nenhum certificado disponível'}).waitFor();
 listStatus=500;await page.reload();await page.getByText(/Não foi possível carregar os certificados/).waitFor();
 await page.evaluate(()=>localStorage.clear());await page.goto(decoded);await page.getByRole('heading',{name:'Certificado válido',exact:true}).waitFor();assert.equal(await page.evaluate(()=>localStorage.getItem('token')),null);assert.ok(!(await page.locator('main').innerText()).includes('RA-EXEMPLO'));
 verification={valid:false,revoked:true,code:details.verificationCode,message:'Revogado'};await page.reload();await page.getByRole('heading',{name:'Certificado revogado',exact:true}).waitFor();assert.equal(await page.getByText('Pessoa Exemplo',{exact:true}).count(),0);
 verifyStatus=404;await page.reload();await page.getByText(/Certificado não encontrado para este código/).waitFor();
 verifyStatus=500;await page.reload();await page.getByText(/a validade não foi confirmada/).waitFor();
 assert.deepEqual(errors,[]);console.log('PASS: lista, vazio, erros HTTP, responsividade, QR decodificado pela biblioteca real, download de bytes, revogação e verificação pública sem login.');
} catch(error) {
 const directory=process.env.DIAGNOSTICS_DIR || mkdtempSync(join(tmpdir(),'certificates-browser-'));
 mkdirSync(directory,{recursive:true});
 const ui=await page.evaluate(()=>({
  url:location.href,
  alerts:[...document.querySelectorAll('[role="alert"]')].map(node=>node.textContent),
  statuses:[...document.querySelectorAll('[role="status"]')].map(node=>node.textContent),
  pdfLink:[...document.querySelectorAll('a')].find(node=>node.textContent==='abra o PDF')?.getAttribute('href')??null,
  buttons:[...document.querySelectorAll('button')].map(node=>({text:node.textContent,disabled:node.disabled})),
 })).catch(()=>null);
 writeFileSync(join(directory,'diagnostico.json'),JSON.stringify({error:String(error),browser:browser.version(),node:process.version,origin,pdfCalls,pdfResponses,downloadEvents,warnings,errors,ui},null,2));
 await page.screenshot({path:join(directory,'falha.png'),fullPage:true}).catch(()=>{});
 await context.tracing.stop({path:join(directory,'trace.zip')}).catch(()=>{});
 console.error('Diagnóstico salvo em:',directory,'\nAbra o trace com: npx playwright show-trace "'+join(directory,'trace.zip')+'"');
 throw error;
} finally {await browser.close();}

