// R2 presigned upload endpoint — v547 (2026-05-25).
//
// Client request URL ini → server generate presigned PUT URL → client PUT
// file langsung ke R2 (bypass Vercel 4.5MB body limit, file gak masuk fungsi).
//
// Request:
//   POST /api/r2/sign-upload
//   { id: string, contentType?: string, sizeBytes?: number }
//
// Response 200:
//   { ok: true, uploadUrl, publicUrl, key, expiresIn }
//
// Response 503: { ok: false, error: "r2_unavailable" } — env vars hilang
// Response 401: { ok: false, error: "not_authenticated" } — anon disallowed
// Response 413: { ok: false, error: "file_too_large", maxBytes } — > size cap
// Response 400: bad request body
//
// Auth: cookie-auth via createClient (lib/supabase/server). Anonymous user
// nggak boleh upload (cegah abuse R2 quota). Authenticated user OK.
//
// Size cap: 500 MB per file (R2 free tier 10 GB total, lim per-file).

import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getR2Config, publicUrlFor } from '@/lib/r2/client';
import { videoStorageKey } from '@/lib/storage/paths';
import { claimVideoOwnership, verifyVideoOwnership } from '@/lib/r2/ownership';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { jsonError, jsonOk } from '@/lib/api/responses';

const MAX_BYTES = 500 * 1024 * 1024; // 500 MB
const PRESIGN_TTL_SECONDS = 300; // 5 menit cukup untuk upload commit

type SignUploadBody = {
  id?: string;
  contentType?: string;
  sizeBytes?: number;
};

export async function POST(req: Request) {
  const r2 = getR2Config();
  if (!r2) {
    return jsonError('r2_unavailable', 503);
  }

  // Auth check — anonymous tidak boleh upload.
  let authUserId: string | null = null;
  let authUserEmail: string | null = null; // hanya untuk pengecualian admin (moderasi)
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    authUserId = authUser?.id || null;
    authUserEmail = authUser?.email || null;
  } catch {
    // Supabase env hilang — treat sbg degraded; tolak upload.
    return jsonError('auth_unavailable', 503);
  }
  if (!authUserId) {
    return jsonError('not_authenticated', 401);
  }

  let body: SignUploadBody;
  try {
    body = await req.json();
  } catch {
    return jsonError('bad_json', 400);
  }

  const id = String(body.id || '').trim();
  if (!id) {
    return jsonError('missing_id', 400);
  }

  // ANTI-IDOR (v-sec 2026-07-07): key R2 = "videos/{id}.{ext}" deterministik dari
  // id. Tanpa cek ini, user login bisa minta presigned-PUT untuk id video ORANG
  // LAIN lalu MENIMPA (overwrite) file-nya. Verifikasi via service-role:
  //   - baris ADA + pemilik BEDA → tolak 403 (blokir overwrite video orang)
  //   - baris TIDAK ADA (upload baru) / pemilik SAMA (re-upload sendiri) → izinkan
  //   - id legacy non-uuid (timestamp, "<id>-bgm", "ve-logo-<id>") → izinkan
  //     (22P02 — tak mungkin ada barisnya; lihat lib/r2/ownership.ts)
  const admin = createAdminClient();
  if (!admin) {
    return jsonError('service_unavailable', 503, {
      message: 'SUPABASE_SERVICE_ROLE_KEY belum di-set — verifikasi kepemilikan tidak bisa dijalankan.',
    });
  }
  const verdict = await verifyVideoOwnership(admin, id, authUserId, authUserEmail);
  if (!verdict.ok) {
    return jsonError(verdict.error, verdict.status, {
      message: verdict.message || 'Id video ini sudah dipakai akun lain.',
    });
  }
  await claimVideoOwnership(admin, id, authUserId);

  const sizeBytes = Number(body.sizeBytes) || 0;
  if (sizeBytes > MAX_BYTES) {
    return jsonError('file_too_large', 413, { maxBytes: MAX_BYTES });
  }

  const contentType = String(body.contentType || 'video/mp4');
  const key = videoStorageKey(authUserId, id, contentType);

  // v548 (2026-05-26): minimal PutObjectCommand — no CacheControl.
  // CacheControl di signed payload bikin browser harus echo header
  // `Cache-Control: public, max-age=604800` di PUT, kalau gak → signature
  // mismatch. Set cache via bucket-level metadata atau lifecycle policy
  // kalau perlu (deferred — R2 default CDN cache cukup untuk MVP).
  const cmd = new PutObjectCommand({
    Bucket: r2.bucket,
    Key: key,
    ContentType: contentType,
  });

  let uploadUrl: string;
  try {
    uploadUrl = await getSignedUrl(r2.client, cmd, {
      expiresIn: PRESIGN_TTL_SECONDS,
      // v548: unhoistableHeaders kosong + signableHeaders minimal supaya
      // signature SDK match dgn header browser fetch (cuma Content-Type +
      // Host). Tanpa ini, SDK auto-sign x-amz-checksum-* atau Cache-Control
      // yang browser ga reproduce → 403/Failed to fetch.
      signableHeaders: new Set(['host', 'content-type']),
    });
    // v549 diagnostic: log first 120 chars + length untuk debug invisible
    // chars / malformed URLs di Vercel function logs.
    console.log('[r2/sign-upload] url len=', uploadUrl.length, 'preview=', uploadUrl.slice(0, 120));
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('[r2/sign-upload] presign failed:', msg);
    return jsonError('presign_failed', 500, { message: msg });
  }

  return jsonOk({
    uploadUrl,
    publicUrl: publicUrlFor(r2, key),
    key,
    expiresIn: PRESIGN_TTL_SECONDS,
  });
}
