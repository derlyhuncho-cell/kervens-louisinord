// Blob infers from the storage key unless contentType is explicit.
// Album keys retain .m4a for compatibility, regardless of uploaded format.
export function audioContentType(file) {
  const extension = file.name.split('.').pop().toLowerCase();
  const types = { mp3: 'audio/mpeg', wav: 'audio/wav', m4a: 'audio/mp4', aac: 'audio/aac' };
  const type = types[extension];
  if (!type) throw new Error('Fòma fichye a pa sipòte.');
  return type;
}
