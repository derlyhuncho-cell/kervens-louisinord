import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
test('upload MIME follows source file rather than .m4a storage key', async () => {
  const module = new vm.SourceTextModule(await readFile(new URL('../lib/audio-content-type.js', import.meta.url), 'utf8'));
  await module.link(() => {}); await module.evaluate();
  const type = module.namespace.audioContentType;
  assert.equal(type({ name: 'FENK KARE NAN TCHUP.mp3', type: '' }), 'audio/mpeg');
  assert.equal(type({ name: 'MASTER.WAV', type: 'audio/mp4' }), 'audio/wav');
  assert.equal(type({ name: 'track.m4a' }), 'audio/mp4');
  assert.equal(type({ name: 'track.aac' }), 'audio/aac');
  assert.throws(() => type({ name: 'track.exe' }), /sipòte/);
});
