// R2 server-proxy upload untuk file KECIL (≤ 4 MB) — 29 Jul 2026.
//
// Kenapa endpoint ini ada: browser → R2 presigned PUT butuh CORS di bucket.
// CORS bucket hanya diset untuk domain prod (https://playly-dashboard.vercel.app)
// via dashboard Cloudflare — API token R2 yang tersedia TIDAK punya izin ubah
// CORS (AccessDenied), jadi origin lain (localhost dev, domain backup) selalu
// gagal CORS saat PUT. Upload lewat server tidak kena CORS sama sekali.
//
// Batas 4 MB karena body melewati fungsi Vercel (limit ~4.5 MB). File video
// besar TETAP wajib jalur presigned PUT (/api/r2/sign-upload) — endpoint ini
// untuk backsound audio, logo watermark, thumbnail, dsb.
//
// Request:
//   POST /api/r2/put-object?id=<videoId|id-bgm|ve-logo-id>&contentType=<mime>
//   Body: binary mentah (isi file)
//
// Response 200: { ok: true, url, key }
// Response 400: missing_id / empty_body
// Response 401: not_authenticated
// Response 403: forbidden_not_owner
// Response 413: file_too_large
// Response 503: r2_unavailable / auth_unavailable / service_unavailable

import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getR2Config, videoObjectKey, publicUrlFor } from '@/lib/r2/client';
import { verifyVideoOwnership } from '@/lib/r2/ownership';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { jsonError, jsonOk } from '@/lib/api/responses';

const MAX_PROXY_BYTES = 4 * 1024 * 1024; // 4 MB — di bawah limit body Vercel 4.5 MB

export async function POST(req: Request) {
  const r2 = getR2Config();
  if (!r2) {
    return jsonError('r2_unavailable', 503);
  }

  // Auth check — sama seperti sign-upload: anon tidak boleh upload.
  let authUserId: string | null = null;
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    authUserId = authUser?.id || null;
  } catch {
    return jsonError('auth_unavailable', 503);
  }
  if (!authUserId) {
    return jsonError('not_authenticated', 401);
  }

  const url = new URL(req.url);
  const id = String(url.searchParams.get('id') || '').trim();
  if (!id) {
    return jsonError('missing_id', 400);
  }
  const contentType = String(
    url.searchParams.get('contentType') || req.headers.get('content-type') || 'application/octet-stream',
  );

  const buf = await req.arrayBuffer();
  if (!buf || buf.byteLength === 0) {
    return jsonError('empty_body', 400);
  }
  if (buf.byteLength > MAX_PROXY_BYTES) {
    return jsonError('file_too_large', 413, { maxBytes: MAX_PROXY_BYTES });
  }

  // ANTI-IDOR — sama persis dengan sign-upload (id legacy non-uuid → izinkan,
  // lihat lib/r2/ownership.ts).
  const admin = createAdminClient();
  if (!admin) {
    return jsonError('service_unavailable', 503, {
      message: 'SUPABASE_SERVICE_ROLE_KEY belum di-set — verifikasi kepemilikan tidak bisa dijalankan.',
    });
  }
  const verdict = await verifyVideoOwnership(admin, id, authUserId);
  if (!verdict.ok) {
    return jsonError(verdict.error, verdict.status, {
      message: verdict.message || 'Id video ini sudah dipakai akun lain.',
    });
  }

  const key = videoObjectKey(id, contentType);
  try {
    await r2.client.send(
      new PutObjectCommand({
        Bucket: r2.bucket,
        Key: key,
        Body: Buffer.from(buf),
        ContentType: contentType,
      }),
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('[r2/put-object] put failed:', msg);
    return jsonError('put_failed', 500, { message: msg });
  }

  return jsonOk({ url: publicUrlFor(r2, key), key });
}
