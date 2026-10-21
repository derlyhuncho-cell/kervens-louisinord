'use client';
import { useEffect, useState } from 'react';
export default function AccessCodes() {
  const [records, setRecords] = useState([]);
  const [label, setLabel] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function load() {
    try { const r = await fetch('/api/access-codes', { cache: 'no-store' }); if (!r.ok) throw new Error(); setRecords(await r.json()); }
    catch { setError('Pa ka li lis aksè a.'); }
  }
  useEffect(() => { load(); }, []);
  async function create(e) {
    e.preventDefault(); setBusy(true); setError(''); setCode('');
    try { const r = await fetch('/api/access-codes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ label }) }); if (!r.ok) throw new Error(); setCode((await r.json()).code); setLabel(''); await load(); }
    catch { setError('Pa ka kreye kòd la.'); } finally { setBusy(false); }
  }
  async function revoke(id) {
    if (!confirm('Retire aksè moun sa a?')) return;
    setBusy(true); setError('');
    try { const r = await fetch('/api/access-codes', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }); if (!r.ok) throw new Error(); await load(); }
    catch { setError('Pa ka retire aksè a.'); } finally { setBusy(false); }
  }
  return <section><h2>Kòd aksè endividyèl</h2><p>Kòd yo pa ekspire. Retire aksè a isit la lè ou vle. Yon moun ka toujou pataje kòd li oswa anrejistre mizik li tande.</p><form onSubmit={create}><input aria-label="Non moun nan" placeholder="Non moun nan" value={label} maxLength={100} onChange={e => setLabel(e.target.value)} required /><button disabled={busy}>Kreye kòd</button></form>{code && <p role="status">Kopye kòd sa a kounye a; li parèt yon sèl fwa: <code style={{ overflowWrap: 'anywhere' }}>{code}</code></p>}{error && <p role="alert">{error}</p>}<ul>{records.map(r => <li key={r.id}>{r.label} <button disabled={busy} onClick={() => revoke(r.id)}>Retire aksè</button></li>)}</ul><p>Revokasyon bloke nouvo lekti; li pa ka efase odyo ki deja chaje sou aparèy moun nan.</p></section>;
}
