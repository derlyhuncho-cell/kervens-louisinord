# kervens-louisinord
## Private album

The private HÉGÉMONIE Blob store (`CHO_READ_WRITE_TOKEN`, connected with the `CHO` prefix) stores audio and hashed access-code records. `ADMIN_PASSWORD` protects `/admin`. Never expose these values to the browser. The old shared `ALBUM_PASSWORD` no longer grants listener access.

In `/admin`, create a code with a recipient label and copy it immediately: raw codes are only displayed once. Codes have no expiry. Deleting a code blocks subsequent stream requests, including existing sessions; audio already buffered or copied cannot be recalled. A code is a bearer credential, not an identity check, so recipients can share it. Browser cookies last 30 days; the same unrevoked code can be entered again.

Upload the matching audio file for each of the nine tracks. Multipart uploads accept WAV, MP3, AAC and M4A. Audio keeps the existing internal `.m4a` storage keys for compatibility; playback uses the uploaded MIME type, not the key extension. WAV playback depends on the browser and encoding; MP3 is preferable for broad device compatibility.

Verify locally with `npm ci`, `npm run build`, and `node --experimental-vm-modules --test tests/access.test.mjs`. The regression test mocks storage and checks revoked codes cannot reuse an existing cookie. Live private-store uploads and playback require deployment verification; they are not covered by that test.
