'use client';
import { useState } from 'react';
import { upload } from '@vercel/blob/client';
import { tracks } from '../../lib/tracks';

export default function AdminClient() {
  const [password, setPassword] = useState(''); const [authenticated, setAuthenticated] = useState(false); const [status, setStatus] = useState('');
  async function signIn(event) {
    event.preventDefault(); setStatus('');
    const response = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password, role: 'admin' }) });
    if (!response.ok) return setStatus('Modpas admin lan pa kòrèk.');
    setAuthenticated(true); setPassword('');
  }
  async function send(id, file) {
    if (!file) return; setStatus(`Upload ${file.name} ap kòmanse...`);
    try { await upload(`hegemonie/${id}.m4a`, file, { access: 'private', handleUploadUrl: '/api/upload' }); setStatus(`${file.name} telechaje.`); }
    catch { setStatus('Upload la pa mache. Eseye ankò.'); }
  }
  if (!authenticated) return <main className="gate"><p className="eyebrow">ADMIN</p><h1>HÉGÉMONIE</h1><p>Antre modpas admin lan pou telechaje mizik yo.</p><form onSubmit={signIn}><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Modpas admin" required /><button>Kontinye</button></form>{status && <p className="error">{status}</p>}</main>;
  return <main className="album"><p className="eyebrow">ADMIN — PRIVATE BLOB</p><h1>Telechaje mizik yo</h1><p className="intro">Chwazi fichye a pou chak trak. Fichye yo ale dirèk nan depo prive a.</p><ol>{tracks.map(([id, name], index) => <li className="upload" key={id}><label><span>{String(index + 1).padStart(2, '0')} — {name}</span><input type="file" accept="audio/mp4,audio/mpeg,audio/aac,.m4a,.mp3" onChange={(e) => send(id, e.target.files?.[0])} /></label></li>)}</ol>{status && <p className="notice">{status}</p>}</main>;
}
