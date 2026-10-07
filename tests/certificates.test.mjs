import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { certificateService as service, publicCertificateUrl, certificateFilename, savePdfBlob, releasePdfUrl } from '../src/api/certificate/certificateService.ts';
import { certificatesMock as list, certificateDetailsMock as details } from '../src/mocks/certificates.mock.ts';
import CertificateDocument from '../src/ui/screens/certificates/CertificateDocument.tsx';
import { formatCertificateDate, certificateError } from '../src/ui/screens/certificates/certificatePresentation.ts';
globalThis.localStorage = {getItem:()=> 'student-token'};
const json = data => new Response(JSON.stringify(data), {headers:{'Content-Type':'application/json'}});
const verification = {valid:true,code:details.verificationCode,...details.payloadSnapshot,issuedAt:details.issuedAt};
test('lista e detalhes usam Bearer, no-store e AbortSignal',async()=>{
 const controller=new AbortController(); const calls=[];
 globalThis.fetch=async(url,options)=>{calls.push([url,options]);return json(url.endsWith('/me')?list:details);};
 assert.deepEqual(await service.list(controller.signal),list);
 assert.deepEqual(await service.details(details.id,controller.signal),details);
 for(const [url,options] of calls){assert.match(url,/^http:\/\/api.test\/certificates\//);assert.equal(options.headers.Authorization,'Bearer student-token');assert.equal(options.cache,'no-store');assert.equal(options.signal,controller.signal);}
});
test('erros HTTP não são substituídos por fixtures',async()=>{
 for(const status of [401,403,404,409,500]) {globalThis.fetch=async()=>new Response('{}',{status}); await assert.rejects(service.list(),error=>error.status===String(status));}
 globalThis.fetch=async()=>{throw new TypeError('offline');};await assert.rejects(service.list());
});
test('rejeita respostas malformadas e detalhe de outro id',async()=>{
 for(const value of [{},[{...list[0],eventDate:'2026-02-30'}]]){globalThis.fetch=async()=>json(value);await assert.rejects(service.list(),e=>e.code==='INVALID_RESPONSE');}
 globalThis.fetch=async()=>json({...details,id:'outro'});await assert.rejects(service.details(details.id),e=>e.code==='INVALID_RESPONSE');
});
test('PDF preserva bytes e rejeita JSON/HTML retornados com HTTP 200',async()=>{
 const bytes='%PDF-1.4\nfixture\n%%EOF';globalThis.fetch=async()=>new Response(bytes,{headers:{'Content-Type':'application/pdf'}});
 assert.equal(await(await service.pdf(details.id)).text(),bytes);
 for(const [body,type] of [['{}','application/json'],['<html>','application/pdf']]){globalThis.fetch=async()=>new Response(body,{headers:{'Content-Type':type}});await assert.rejects(service.pdf(details.id),e=>e.code==='INVALID_RESPONSE');}
});
test('verificação pública não transmite JWT, aceita revogação e não presume validade',async()=>{
 let options;globalThis.fetch=async(url,opt)=>{options=opt;assert.ok(url.endsWith('/verify/'+verification.code));return json(verification);};
 assert.equal((await service.verify(verification.code)).valid,true);assert.equal(options.headers.Authorization,undefined);assert.equal(options.cache,'no-store');
 globalThis.fetch=async()=>json({valid:false,revoked:true,code:verification.code,message:'Revogado'});assert.equal((await service.verify(verification.code)).valid,false);
 globalThis.fetch=async()=>json({...verification,code:'outro'});await assert.rejects(service.verify(verification.code));
});
test('datas não mudam de dia pelo fuso; URL e nome de arquivo são codificados',()=>{
 assert.equal(formatCertificateDate('2026-10-05'),'05/10/2026');
 assert.equal(publicCertificateUrl('ABC/123','https://aluno.example'),'https://aluno.example/certificado/verificar/ABC%2F123');
 assert.throws(()=>publicCertificateUrl('x','javascript:alert(1)'));
 assert.equal(certificateFilename('../../code'),'certificado-______code.pdf');
 assert.match(certificateError({status:403}),/permissão/);assert.match(certificateError({},'verify'),/não foi confirmada/);
});
test('documento usa snapshot e contém QR e código textual, com marca de revogação',()=>{
 const html=renderToStaticMarkup(h(CertificateDocument,{certificate:details,verificationUrl:'https://aluno.example/certificado/verificar/'+details.verificationCode}));
 for(const value of ['Pessoa Exemplo','05/10/2026','2 horas',details.verificationCode,'certificate-qr','Centro Estadual de Educação Tecnológica Paula Souza'])assert.ok(html.includes(value));
 const revoked=renderToStaticMarkup(h(CertificateDocument,{certificate:{...details,revokedAt:details.issuedAt},verificationUrl:'https://example.com'}));assert.match(revoked,/CERTIFICADO REVOGADO/);
});
test('download cria link blob, remove link e libera URL com atraso',()=>{
 const calls=[];const originalCreate=URL.createObjectURL, originalRevoke=URL.revokeObjectURL;
 URL.createObjectURL=()=> 'blob:test';URL.revokeObjectURL=url=>calls.push(url);
 const anchor={click(){calls.push('click');},remove(){calls.push('remove');}};
 globalThis.document={createElement:()=>anchor,body:{append(){calls.push('append');}}};globalThis.window={setTimeout(callback,delay){assert.equal(delay,60000);callback();}};
 try {assert.equal(savePdfBlob(new Blob(['%PDF-']), 'certificado.pdf'),'blob:test');assert.equal(anchor.download,'certificado.pdf');releasePdfUrl('blob:test');assert.deepEqual(calls,['append','click','remove','blob:test']);}
 finally{URL.createObjectURL=originalCreate;URL.revokeObjectURL=originalRevoke;}
});

test('modo mock é explícito, clona fixtures e não gera PDF nem autentica por fixture',async()=>{
 process.env.VITE_USE_MOCK='true';
 try {
  const {certificateService:mock}=await import('../src/api/certificate/certificateService.ts?mock-test');
  const result=await mock.list();result[0].eventTitle='alterado';assert.equal((await mock.list())[0].eventTitle,list[0].eventTitle);
  await assert.rejects(mock.details('outro'),e=>e.status==='404');await assert.rejects(mock.pdf(details.id),e=>e.code==='MOCK_PDF_UNAVAILABLE');
  let fetched=false;globalThis.fetch=async()=>{fetched=true;return json(verification);};await mock.verify(verification.code);assert.equal(fetched,true);
 } finally {process.env.VITE_USE_MOCK='false';}
});

test('404 público da issue 27 é exibido como certificado não encontrado',async()=>{
 globalThis.fetch=async()=>new Response(JSON.stringify({valid:false,message:'Certificado não encontrado'}),{status:404,headers:{'Content-Type':'application/json'}});
 await assert.rejects(service.verify('FATEC-EVT-9A4B12'),error=>error.status==='404' && certificateError(error,'verify').startsWith('Certificado não encontrado'));
});
