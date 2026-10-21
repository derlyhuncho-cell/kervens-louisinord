import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

test('audio endpoint forwards ranges, returns 206, and checks access first', async () => {
  let authorized = true;
  const calls = [];
  const context = vm.createContext({ Response, Headers, URL });
  const module = new vm.SourceTextModule(await readFile(new URL('../app/api/stream/route.js', import.meta.url), 'utf8'), { context });
  await module.link(name => {
    const exports = name.includes('album-storage') ? { albumStorageOptions: () => ({ token: 'test-private' }) }
      : name.includes('auth') ? { hasSession: async () => authorized }
      : name.includes('tracks') ? { trackMap: new Map([['fe-bagay', 'FÈ BAGAY']]) }
      : name === 'next/server' ? { NextResponse: Response }
      : { head: async () => ({ size: 10, contentType: 'audio/mpeg' }), get: async (path, options) => {
        calls.push(options);
        const range = options.headers?.Range;
        return { stream: new Response(range ? 'ab' : 'abcdefghij').body, blob: { contentType: 'audio/mpeg' }, headers: new Headers(range ? { 'content-range': 'bytes 0-1/10', 'content-length': '2' } : { 'content-length': '10' }) };
      } };
    return new vm.SyntheticModule(Object.keys(exports), function () { for (const [key,value] of Object.entries(exports)) this.setExport(key,value); }, { context });
  });
  await module.evaluate();
  const request = range => ({ url: 'https://example.test/api/stream?track=fe-bagay', headers: new Headers(range ? { Range: range } : {}) });
  const partial = await module.namespace.GET(request('bytes=0-1'));
  assert.equal(partial.status, 206);
  assert.equal(partial.headers.get('content-range'), 'bytes 0-1/10');
  assert.equal(partial.headers.get('content-length'), '2');
  assert.equal(await partial.text(), 'ab');
  assert.equal(calls[0].headers.Range, 'bytes=0-1');
  assert.equal(calls[0].token, 'test-private');
  const full = await module.namespace.GET(request());
  assert.equal(full.status, 200);
  assert.equal(await full.text(), 'abcdefghij');
  for (const range of ['bytes=10-', 'bytes=3-1', 'bytes=-0', 'bytes=0-1,3-4']) {
    const response = await module.namespace.GET(request(range));
    assert.equal(response.status, 416);
    assert.equal(response.headers.get('content-range'), 'bytes */10');
  }
  authorized = false;
  const count = calls.length;
  assert.equal((await module.namespace.GET(request('bytes=0-1'))).status, 401);
  assert.equal(calls.length, count);
});
