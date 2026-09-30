import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { presenceEventId, parsePresenceUrlOrToken, getAttendanceQrPreview, confirmAttendanceReference, scanAttendance, getScanAttendance } from '../src/api/attendance/scanAttendance.ts';
import { responseFeedback, errorFeedback, cameraErrorMessage } from '../src/ui/screens/scanner/scanFeedback.ts';
import ScanResultCard from '../src/ui/screens/scanner/ScanResultCard.tsx';

const id = '11111111-1111-4111-8111-111111111111';
const claims = { eventId: id, checkpoint: 'CHECK_IN', checkpointVersion: 2, jti: 'test-id', iat: 1, exp: 21 };
const encode = data => Buffer.from(JSON.stringify(data)).toString('base64url');
const token = payload => encode({alg:'HS256',typ:'JWT'}) + '.' + encode(payload) + '.signature';
const valid = token(claims);
const success = {success:true,type:'CHECK_IN',status:'CHECKED_IN',eventTitle:'Palestra',timestamp:'2026-09-29T15:00:00Z',message:'ok'};
const html = result => renderToStaticMarkup(h(MemoryRouter, null, h(ScanResultCard, {result, onRetry(){}})));

test('parsePresenceUrlOrToken reconhece link curto autorizado, URL completa e JWT legado, rejeitando domínios maliciosos', () => {
  const ref = 'abcdefghijk12345678901';
  assert.deepEqual(parsePresenceUrlOrToken(`/p/${ref}`), { type: 'reference', reference: ref });
  assert.deepEqual(parsePresenceUrlOrToken(`https://carteirinha-digital-front-end-aluno.vercel.app/p/${ref}`), { type: 'reference', reference: ref });
  assert.deepEqual(parsePresenceUrlOrToken(valid), { type: 'jwt', token: valid });

  // Rejeita origens externas maliciosas
  assert.equal(parsePresenceUrlOrToken(`https://phishing.site/p/${ref}`), null);
  assert.equal(parsePresenceUrlOrToken(`https://attacker.com/p/${ref}`), null);
  assert.equal(parsePresenceUrlOrToken('not-a-token'), null);
});

test('aceita formato de presença; expiração e assinatura ficam no servidor', () => {
  assert.equal(presenceEventId(valid), id);
  for (const value of ['https://fatec/valida/token','JWT_PRESENCA_FICTICIO','abc.def.ghi',token({sub:'RA'}), token({...claims,checkpoint:undefined,type:'CHECK_IN'}),token({...claims,checkpointVersion:0})]) {
    assert.equal(presenceEventId(value), null);
  }
});

test('feedback de entrada e saída usa horários do servidor e não promete certificado emitido', () => {
  const input = responseFeedback(success);
  assert.equal(input.checkInAt,success.timestamp);
  assert.match(html(input),/Entrada registrada!/);
  const output = responseFeedback({...success,type:'CHECK_OUT',status:'CONFIRMED'});
  assert.match(html(output),/Presença confirmada!/);
  assert.match(html(output),/Ver certificados/);
  assert.doesNotMatch(html(output),/certificado está disponível/);
});

test('duplicidade é informativa e timestamp de tentativa não vira horário de presença', () => {
  for (const code of ['ALREADY_CHECKED_IN','ALREADY_CHECKED_OUT']) {
    const result = responseFeedback({success:false,code,timestamp:success.timestamp,message:'duplicado'});
    assert.equal(result.tone,'info');
    assert.equal(result.checkInAt,undefined); assert.equal(result.checkOutAt,undefined);
    assert.match(html(result),/já registrada/);
  }
});

test('erros HTTP, expiração, checkpoint fechado, saída sem entrada e rede', () => {
  for (const code of ['QR_EXPIRED','CHECKPOINT_CLOSED','INVALID_QR_TOKEN']) {
    assert.match(html(errorFeedback({status:'400',code})),/QR Code inválido/);
  }
  assert.match(html(errorFeedback({status:'400',message:'Nenhuma entrada encontrada'})),/Não foi possível registrar a saída/);
  assert.match(html(errorFeedback({code:'CHECK_IN_REQUIRED'})),/Nenhuma entrada encontrada/);
  assert.match(html(errorFeedback({status:'401'})),/Entrar novamente/);
  assert.match(html(errorFeedback({status:'403'})),/Acesso não autorizado/);
  assert.match(html(errorFeedback({status:'404'})),/Registro indisponível/);
  assert.match(html(errorFeedback({status:'409',code:'RA_REUSE_HISTORY_CONFLICT'})),/regularizar/);
  for (const error of [new TypeError('offline'),{status:'500'},new DOMException('timeout','AbortError')]) {
    assert.match(html(errorFeedback(error)),/pode ter chegado ao servidor/);
    assert.doesNotMatch(html(errorFeedback(error)),/Presença confirmada!/);
  }
});

test('permissões e câmera indisponível têm orientação útil', () => {
  assert.match(cameraErrorMessage({name:'NotAllowedError'}),/Permissão de câmera negada/);
  assert.match(cameraErrorMessage({name:'NotFoundError'}),/Nenhuma câmera/);
  assert.match(cameraErrorMessage({name:'NotReadableError'}),/ocupada/);
});

test('scan envia apenas qrToken com Bearer, não usa fixtures e propaga falhas', async () => {
  const originalFetch = globalThis.fetch;
  const originalStorage = globalThis.localStorage;
  globalThis.localStorage = { getItem: () => 'student-jwt' };
  const calls=[];
  process.env.VITE_USE_MOCK='true';
  globalThis.fetch=async (url,options) => { calls.push({url,options}); return Response.json(success); };
  try {
    const signal=new AbortController().signal;
    assert.deepEqual(await scanAttendance(valid,signal),success);
    assert.equal(calls[0].url,'http://api.test/attendances/scan');
    assert.equal(calls[0].options.method,'POST');
    assert.equal(calls[0].options.headers.Authorization,'Bearer student-jwt');
    assert.deepEqual(JSON.parse(calls[0].options.body),{qrToken:valid});
    assert.equal(calls[0].options.signal,signal);
    await assert.rejects(scanAttendance('https://fatec/valida/token'));
    assert.equal(calls.length,1);
    globalThis.localStorage={getItem:()=>null};
    await assert.rejects(scanAttendance(valid),e=>e.status==='401');
    assert.equal(calls.length,1);
    globalThis.localStorage={getItem:()=> 'student-jwt'};
    for (const status of [400,401,403,404,409,429,500]) {
      globalThis.fetch=async()=>Response.json({message:'erro',code:'TEST'}, {status});
      await assert.rejects(scanAttendance(valid),e=>e.status===String(status));
    }
    globalThis.fetch=async()=>Response.json({success:true});
    await assert.rejects(scanAttendance(valid),e=>e.code==='INVALID_RESPONSE');
    globalThis.fetch=async()=>{throw new TypeError('network')};
    await assert.rejects(scanAttendance(valid));
    globalThis.fetch=async()=>Response.json([{eventId:id,checkInAt:success.timestamp}]);
    assert.equal((await getScanAttendance(id,signal)).checkInAt,success.timestamp);
  } finally {
    globalThis.fetch=originalFetch; globalThis.localStorage=originalStorage; delete process.env.VITE_USE_MOCK;
  }
});

test('prévia e confirmação por referência usam Bearer, GET para prévia e POST apenas no toque', async () => {
  const originalFetch = globalThis.fetch;
  const originalStorage = globalThis.localStorage;
  globalThis.localStorage = { getItem: () => 'student-jwt' };
  const calls = [];
  process.env.VITE_USE_MOCK = 'true';
  const previewData = {
    event: { id, title: 'Palestra de Inovação', speaker: 'Profa. Dra.', location: 'Auditório' },
    checkpoint: { type: 'CHECK_IN' },
    expiresAt: '2026-10-01T20:00:20Z',
    serverTime: '2026-10-01T20:00:00Z',
  };

  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    if (url.includes('/attendances/qr/')) {
      return Response.json(previewData);
    }
    return Response.json(success);
  };

  try {
    const ref = 'abcdefghijk12345678901';
    const previewResult = await getAttendanceQrPreview(ref);
    assert.deepEqual(previewResult, previewData);
    assert.equal(calls[0].url, `http://api.test/attendances/qr/${ref}`);
    assert.equal(calls[0].options.method, 'GET');
    assert.equal(calls[0].options.headers.Authorization, 'Bearer student-jwt');

    const confirmResult = await confirmAttendanceReference(ref);
    assert.deepEqual(confirmResult, success);
    assert.equal(calls[1].url, 'http://api.test/attendances/scan-reference');
    assert.equal(calls[1].options.method, 'POST');
    assert.equal(calls[1].options.headers.Authorization, 'Bearer student-jwt');
    assert.deepEqual(JSON.parse(calls[1].options.body), { qrReference: ref });
  } finally {
    globalThis.fetch = originalFetch;
    globalThis.localStorage = originalStorage;
    delete process.env.VITE_USE_MOCK;
  }
});
