import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import crypto from 'node:crypto';

test('individual access fails closed and revocation invalidates an existing cookie', async () => {
  const records = new Set();
  const reads = [];
  const module = new vm.SourceTextModule(await readFile(new URL('../lib/auth.js', import.meta.url), 'utf8'), { context: vm.createContext({ Buffer, process, Date }) });
  await module.link(async name => {
    const exports = name === 'node:crypto' ? { default: crypto } : { get: async (path, options) => { reads.push(options); return records.has(path) ? { statusCode: 200 } : null; } };
    return new vm.SyntheticModule(Object.keys(exports), function () { for (const [key, value] of Object.entries(exports)) this.setExport(key, value); }, { context: module.context });
  });
  await module.evaluate();
  const { codePath, hasSession, verifyAccessCode } = module.namespace;
  const code = crypto.randomBytes(24).toString('hex');
  const request = { cookies: { get: () => ({ value: code }) } };
  assert.equal(await verifyAccessCode(undefined), false);
  assert.equal(await verifyAccessCode('old-shared-password'), false);
  assert.equal(await hasSession(request, 'album'), false);
  records.add(codePath(code));
  assert.equal(await hasSession(request, 'album'), true);
  assert.equal(await verifyAccessCode(crypto.randomBytes(24).toString('hex')), false);
  records.delete(codePath(code));
  assert.equal(await hasSession(request, 'album'), false);
  assert.ok(reads.every(options => options.access === 'private' && options.useCache === false));
});
