'use client';
import { useState } from 'react';
import { tracks } from '../../lib/tracks';

export default function AlbumClient() {
  const [password, setPassword] = useState(''); const [unlocked, setUnlocked] = useState(false); const [error, setError] = useState('');
  async function unlock(event) {
    event.preventDefault(); setError('');
    const response = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password, role: 'album' }) });
    if (!response.ok) return setError('Kòd la pa valab oswa aksè a retire.');
    setUnlocked(true); setPassword('');
  }
  if (!unlocked) return <main className="gate"><p className="eyebrow">DERLY HUNCHO</p><h1>HÉGÉMONIE</h1><p>Antre kòd aksè Derly Huncho ba ou a.</p><form onSubmit={unlock}><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Kòd aksè" required /><button>Antre nan album nan</button></form>{error && <p className="error">{error}</p>}</main>;
  return <main className="album"><p className="eyebrow">DERLY HUNCHO</p><h1>HÉGÉMONIE</h1><p className="intro">Album prive</p><ol>{tracks.map(([id, name], index) => <li key={id}><span>{String(index + 1).padStart(2, '0')} — {name}</span><audio controls controlsList="nodownload" preload="metadata" src={`/api/stream?track=${id}`} /></li>)}</ol></main>;
}
