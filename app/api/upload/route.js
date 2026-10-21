import { albumStorageOptions } from '../../../lib/album-storage';
import { handleUpload } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { hasSession } from '../../../lib/auth';
import { trackMap } from '../../../lib/tracks';

export async function POST(request) {
  if (!(await hasSession(request, 'admin'))) return NextResponse.json({ error: 'Aksè admin obligatwa.' }, { status: 401 });
  try {
    const result = await handleUpload({ ...albumStorageOptions(), body: await request.json(), request,
      onBeforeGenerateToken: async (pathname) => {
        const id = pathname.match(/^hegemonie\/([a-z0-9-]+)\.m4a$/)?.[1];
        if (!id || !trackMap.has(id)) throw new Error('Non fichye a pa otorize.');
        return { addRandomSuffix: false, allowOverwrite: true, allowedContentTypes: ['audio/mp4', 'audio/mpeg', 'audio/aac', 'audio/x-m4a', 'audio/wav', 'audio/x-wav', 'audio/wave', 'audio/vnd.wave'] };
      },
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Upload pa mache.' }, { status: 400 });
  }
}
