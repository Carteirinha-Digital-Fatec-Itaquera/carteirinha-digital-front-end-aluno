// Isolated visual evidence with explicit HTTP fixtures; never integration proof.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { eventsMock } from '../src/mocks/events.mock.ts';
import { certificatesMock, certificateDetailsMock } from '../src/mocks/certificates.mock.ts';
const origin=process.env.TEST_ORIGIN || 'http://127.0.0.1:5173';
const phase=process.env.DESIGN_PHASE || 'after';
const dir=`docs/design/evidence/${phase}`;
mkdirSync(dir,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const context=await browser.newContext({serviceWorkers:'block'});
const student={name:'Aluno Exemplo',ra:'0000000000000',course:'Desenvolvimento de Software Multiplataforma',photoStatus:'APPROVED',photo:'/perfil_default.png',qrcode:'visual-fixture',status:'ACTIVE',admission:'2025-02-01',dueDate:'2027-12-31',birthDate:'2000-01-01',rg:'00.000.000-0',cpf:'000.000.000-00'};
await context.addInitScript(({student})=>{
  if(location.pathname.startsWith('/valida/')||location.pathname.startsWith('/certificado/verificar/')) {localStorage.clear();return;}
const mockHeader = btoa(
  JSON.stringify({
    alg: 'none',
    typ: 'JWT',
  })
);

const mockPayload = btoa(
  JSON.stringify({
    sub: student.ra,
  })
);

localStorage.setItem(
  'token',
  `${mockHeader}.${mockPayload}.test-signature`
);
  localStorage.setItem('@Carteirinha:profile',JSON.stringify(student));
  localStorage.setItem('mustChangePassword',location.pathname==='/first-access'?'false':'true');
},{student});
let mode='normal';
await context.route('**/*',async route=>{
 const req=route.request();
 if(!['fetch','xhr'].includes(req.resourceType()) || new URL(req.url()).origin===origin)return route.continue();
 const path=new URL(req.url()).pathname;
 if(mode==='error')return route.fulfill({status:500,json:{message:'Falha de teste visual'}});
 if(mode==='loading')await new Promise(r=>setTimeout(r,3000));
 let data={};
 if(path.includes('/estudantes/'))data=student;
 else if(path==='/events')data=mode==='empty'?[]:eventsMock;
 else if(path==='/attendances/me')data=[];
 else if(path==='/certificates/me')data=mode==='empty'?[]:certificatesMock;
 else if(path.includes('/certificates/verify/'))data={valid:true,code:certificateDetailsMock.verificationCode,...certificateDetailsMock.payloadSnapshot};
 else if(path.includes('/certificates/'))data=certificateDetailsMock;
 else if(path.includes('/attendances/qr/'))data={event:{id:'visual',title:'Arquitetura de Software na Prática',speaker:'Docente Exemplo',location:'Auditório'},checkpoint:{type:'CHECK_IN'}};
 return route.fulfill({json:data});
});
const page=await context.newPage();
const errors=[]; page.on('pageerror',e=>errors.push(e.message));
const routes=[['login','/login'],['primeiro-acesso','/first-access'],['recuperacao','/PasswordRecovery'],['reset','/reset-password?token=visual&id=visual&type=student'],['reset-invalido','/reset-password'],['menu','/MainMenu'],['carteirinha','/DigitalStudentCard'],['qr','/qrCodeScan'],['foto','/UploadImage'],['config','/config'],['ajuda','/Help'],['eventos','/eventos'],['scanner','/eventos/scanner'],['presenca','/p/visual-reference'],['certificados','/certificados'],['certificado','/certificado/55555555-5555-4555-8555-555555555555'],['verificar','/certificado/verificar/visual'],['validar','/valida/visual']];
const results=[];
for(const width of [360,390,412,768,1366,1920]) {
 await page.setViewportSize({width,height:900});
 for(const [name,path] of routes) {
  await page.goto(origin+path);await page.waitForTimeout(250);
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(img=>img.decode().catch(()=>{})));});
  await page.screenshot({path:`${dir}/${name}-${width}.png`,fullPage:true});
  results.push({name,width,overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});
 }
}
if(phase==='after') {
 await page.setViewportSize({width:390,height:844});
 for(const state of ['empty','error','loading']) {
  mode=state;
  for(const [name,path] of routes.filter(([name])=>['eventos','certificados','verificar','validar','presenca'].includes(name))) {
   if(state==='empty'&&!['eventos','certificados'].includes(name))continue;
   await page.goto(origin+path);await page.waitForTimeout(150);
   await page.screenshot({path:`${dir}/${name}-${state}.png`,fullPage:true});
  }
 }
 mode='normal';
 await page.goto(origin+'/config');
 await page.getByRole('button',{name:/Acessibilidade Visual/}).click();
 await page.screenshot({path:`${dir}/config-acessibilidade.png`,fullPage:true});
 for(const [name,path] of routes.filter(([name])=>['login','foto','config','eventos','certificados'].includes(name))) {
  await page.goto(origin+path);
  await page.addStyleTag({content:'html { font-size: 200%; }'});
  await page.screenshot({path:`${dir}/${name}-texto-200.png`,fullPage:true});
  results.push({name,width:390,textZoom:'200%',overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});
 }
 await page.goto(origin+'/login');
 await page.getByLabel('E-mail institucional',{exact:true}).fill('visual@fatec.sp.gov.br');
 await page.getByLabel('Senha',{exact:true}).fill('visual-password');
 await page.getByRole('button',{name:'Mostrar senha',exact:true}).click();
 assert.equal(await page.getByLabel('Senha',{exact:true}).getAttribute('type'),'text');
 await page.getByRole('button',{name:'Ocultar senha',exact:true}).click();
 await page.goto(origin+'/config');
 const trigger=page.getByRole('button',{name:/Acessibilidade Visual/});
 await trigger.focus();await page.keyboard.press('Enter');
 await page.getByRole('dialog',{name:'Acessibilidade visual',exact:true}).waitFor();
 await page.keyboard.press('Tab');
 assert.equal(await page.evaluate(()=>!!document.activeElement.closest('dialog')),true);
 await page.screenshot({path:`${dir}/config-foco-modal.png`,fullPage:true});
 await page.keyboard.press('Escape');
 assert.equal(await page.getByRole('dialog').count(),0);
 assert.equal(await trigger.evaluate(el=>el===document.activeElement),true);
 await page.goto(origin+'/reset-password?token=visual&id=visual&type=student');
 await page.getByLabel('Nova senha',{exact:true}).fill('abcdef');
 await page.getByLabel('Repita a nova senha',{exact:true}).fill('diferente');
 await page.getByRole('button',{name:'Redefinir Senha',exact:true}).click();
 await page.getByRole('dialog',{name:'Não foi possível concluir'}).waitFor();
 await page.screenshot({path:`${dir}/senha-erro-validacao.png`,fullPage:true});
 await page.keyboard.press('Escape');
 assert.equal(await page.getByRole('dialog').count(),0);
 for(const viewport of [{width:844,height:390},{width:390,height:420}]) {
  await page.setViewportSize(viewport);
  for(const [name,path] of routes.filter(([name])=>['login','foto','config','scanner'].includes(name))) {
   await page.goto(origin+path);await page.waitForTimeout(150);
   await page.screenshot({path:`${dir}/${name}-${viewport.width}x${viewport.height}.png`,fullPage:true});
   results.push({name,...viewport,overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});
  }
 }
 assert.deepEqual(results.filter(r=>r.overflow),[],'Não deve haver overflow horizontal');
 assert.deepEqual(errors,[],'Não deve haver erro JavaScript');
}
writeFileSync(`${dir}/results.json`,JSON.stringify({fixtureOnly:true,results,errors},null,2));
console.log(JSON.stringify({phase,captures:results.length,overflow:results.filter(r=>r.overflow),errors}));
await browser.close();
