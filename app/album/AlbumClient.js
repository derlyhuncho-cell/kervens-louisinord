'use client';
import { useState } from 'react';
import { tracks } from '../../lib/tracks';

export default function AlbumClient() {
  const [password, setPassword] = useState(''); const [unlocked, setUnlocked] = useState(false); const [error, setError] = useState('');
  async function unlock(event) {
    event.preventDefault(); setError('');
    const response = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password, role: 'album' }) });
    if (!response.ok) return setError('Modpas la pa kòrèk.');
    setUnlocked(true); setPassword('');
  }
  if (!unlocked) return <main className="gate"><p className="eyebrow">DERLY HUNCHO</p><h1>HÉGÉMONIE</h1><p>Antre modpas ou resevwa apre acha a.</p><form onSubmit={unlock}><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Modpas" required /><button>Antre nan album nan</button></form>{error && <p className="error">{error}</p>}</main>;
  return <main className="album"><p className="eyebrow">DERLY HUNCHO</p><h1>HÉGÉMONIE</h1><p className="intro">Album prive</p><ol>{tracks.map(([id, name], index) => { const visible = index === 1 || index === 2; return <li key={id}><span>{String(index + 1).padStart(2, '0')} — {visible ? name : 'Track kache'}</span><audio controls preload="metadata" src={`/api/stream?track=${id}`} /></li>; })}</ol></main>;
}
