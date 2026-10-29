/* Restricted attendance queue: no access token or coordinates are persisted. */
(function (scope) {
  const DB = 'student-presence-v1';
  async function database() {
    return new Promise((resolve, reject) => {
      const r = indexedDB.open(DB, 1);
      r.onupgradeneeded = () => { r.result.createObjectStore('attempts', { keyPath: 'requestId' }); r.result.createObjectStore('control'); };
      r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error);
    });
  }
  async function store(name, mode, operation) {
    const db = await database();
    try { return await new Promise((resolve, reject) => {
      const tx = db.transaction(name, mode); const r = operation(tx.objectStore(name));
      tx.oncomplete = () => resolve(r.result); tx.onerror = () => reject(tx.error); tx.onabort = () => reject(tx.error);
    }); } finally { db.close(); }
  }
  const queue = {
    list: () => store('attempts', 'readonly', s => s.getAll()),
    put: value => store('attempts', 'readwrite', s => s.put(value)),
    control: () => store('control', 'readonly', s => s.get('active')),
    authorize: value => store('control', 'readwrite', s => s.put(value, 'active')),
  };
  async function disableGeneration(generation) {
    const db = await database();
    try { await new Promise((resolve, reject) => {
      const tx = db.transaction('control', 'readwrite'); const store = tx.objectStore('control'); const read = store.get('active');
      read.onsuccess = () => { if (read.result?.generation === generation) store.put(null, 'active'); };
      tx.oncomplete = resolve; tx.onerror = () => reject(tx.error); tx.onabort = () => reject(tx.error);
    }); } finally { db.close(); }
  }
  async function request(path, body) {
    const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const r = await fetch('/api/attendances/offline/' + path, { method: 'POST', credentials: 'same-origin', cache: 'no-store', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: controller.signal });
      const data = await r.json(); if (!r.ok) throw Object.assign(new Error(data.message || 'Não foi possível enviar.'), { status: r.status, code: data.code }); return data;
    } finally { clearTimeout(timer); }
  }
  async function flush() {
    const run = async () => {
      const active = await queue.control(); if (!active || active.expiresAt <= Date.now()) return;
      for (const item of await queue.list()) {
        if (item.accountId !== active.accountId || item.locationRequired !== false || ['confirmed','rejected','login','gps'].includes(item.state) || item.nextAt > Date.now()) continue;
        const current = await queue.control(); if (!current || current.generation !== active.generation) return;
        try {
          // Always check committed receipts before submitting, including after a lost response.
          item.state = 'checking'; await queue.put(item);
          const status = await request('status', { accountId: item.accountId, requestIds: [item.requestId] });
          let receipt = status.receipts.find(r => r.requestId === item.requestId);
          if (!receipt) {
            const stillActive = await queue.control(); if (!stillActive || stillActive.generation !== active.generation) return;
            item.state = 'submitting'; await queue.put(item);
            receipt = await request('submit', { requestId: item.requestId, accountId: item.accountId, reference: item.reference, scannedAt: item.scannedAt });
          }
          if (!receipt || receipt.requestId !== item.requestId || receipt.accountId !== item.accountId || receipt.status !== 'confirmed' || !receipt.result) throw new Error('Resposta incompleta.');
          item.state = 'confirmed'; item.result = receipt.result; item.message = receipt.message;
        } catch (error) {
          if (error.status === 401 || error.status === 403) { item.state = 'login'; item.message = 'Entre novamente para concluir.'; await disableGeneration(active.generation); }
          else if (error.code === 'LOCATION_REQUIRED') { item.state = 'gps'; item.locationRequired = true; }
          else if (error.status >= 400 && error.status < 500 && ![408,429].includes(error.status)) { item.state = 'rejected'; item.message = error.message; }
          else { item.state = 'unknown'; item.attempts = (item.attempts || 0) + 1; item.nextAt = Date.now() + Math.min(60000, 2000 * 2 ** Math.min(item.attempts, 5)); }
        }
        await queue.put(item);
      }
    };
    if (scope.navigator?.locks) return scope.navigator.locks.request('student-presence', run);
    return run(); // Backend requestId also protects browsers without Web Locks.
  }
  scope.presenceQueue = { ...queue, flush, request, disableGeneration };
  if (typeof scope.skipWaiting === 'function') {
    scope.addEventListener('sync', event => { if (event.tag === 'student-presence') event.waitUntil(flush().then(async () => { const items = await queue.list(); const active = await queue.control(); if (active && active.expiresAt > Date.now() && items.some(i => i.accountId === active.accountId && ['unknown','waiting','checking','submitting'].includes(i.state) && i.locationRequired === false)) throw new Error('Retry pending'); })); });
  }
})(globalThis);
