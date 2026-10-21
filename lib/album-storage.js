// Never fall back to the default Blob store: it holds public assets.
export function albumStorageOptions() {
  const token = process.env.CHO_READ_WRITE_TOKEN;
  if (!token) throw new Error('Private album storage is not configured.');
  return { token };
}
