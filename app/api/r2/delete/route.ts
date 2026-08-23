// R2 delete endpoint — v547 (2026-05-25).
//
// Hapus video object dari R2. Server-side karena delete ops tidak butuh
// body besar (cuma metadata) — direct call dari Next.js function aman.
//
// Request:
//   POST /api/r2/delete
//   { id: string, contentType?: string }   — server derive key dari id+ct
//   atau:
//   { key: string }                        — explicit key (kalau client tahu)
//
// Response 200: { ok: true }
// Response 503: r2_unavailable
// Response 401: not_authenticated
// Response 400: bad request

import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getR2Config } from '@/lib/r2/client';
import { videoStorageKey } from '@/lib/storage/paths';
import { verifyVideoOwnership } from '@/lib/r2/ownership';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { jsonError, jsonOk } from '@/lib/api/responses';

type DeleteBody = {
  id?: string;
  contentType?: string;
  key?: string;
};

export async function POST(req: Request) {
  const r2 = getR2Config();
  if (!r2) {
    return jsonError('r2_unavailable', 503);
  }

  // Auth check — anon nggak boleh delete.
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

  let body: DeleteBody;
  try {
    body = await req.json();
  } catch {
    return jsonError('bad_json', 400);
  }

  // Tentukan id video + key. Key R2 = "videos/{id}.{ext}" (TANPA folder pemilik),
  // jadi kepemilikan HARUS diverifikasi via tabel (tak bisa dari path). Kalau
  // client kirim key eksplisit, ambil id dari key itu untuk verifikasi.
  let key = String(body.key || '').trim();
  let vidId = String(body.id || '').trim();
  if (!vidId && key) {
    const m = key.match(/^videos\/([^/.]+)/);
    if (m) vidId = m[1];
  }
  if (!vidId) {
    return jsonError('missing_id_or_key', 400);
  }

  // ANTI-IDOR (v-sec 2026-07-07): sebelumnya endpoint ini hanya cek "sudah
  // login?" — TIDAK cek "video ini milikmu?". Akibatnya user login mana pun
  // bisa menghapus file video milik orang lain hanya dengan tahu id-nya (id
  // terekspos di halaman /watch publik). Sekarang verifikasi kepemilikan via
  // service-role (bypass RLS supaya bisa melihat video privat orang lain juga):
  //   - baris ADA + pemilik BEDA  → tolak 403 (blokir IDOR)
  //   - baris ADA + pemilik SAMA  → lanjut hapus
  //   - baris TIDAK ADA           → izinkan (idempoten; row hilang = video tak
  //     pernah ada / sudah dihapus pemiliknya via jalur Supabase paralel. Orang
  //     lain tak bisa membuat kondisi ini untuk video bukan miliknya karena RLS
  //     mencegahnya menghapus baris video orang).
  //   - id legacy non-uuid (timestamp, "<id>-bgm", "ve-logo-<id>") → izinkan
  //     (22P02 — tak mungkin ada barisnya; lihat lib/r2/ownership.ts)
  const admin = createAdminClient();
  if (!admin) {
    return jsonError('service_unavailable', 503, {
      message: 'SUPABASE_SERVICE_ROLE_KEY belum di-set — verifikasi kepemilikan tidak bisa dijalankan.',
    });
  }
  const verdict = await verifyVideoOwnership(admin, vidId, authUserId);
  if (!verdict.ok) {
    return jsonError(verdict.error, verdict.status, {
      message: verdict.message || 'Video ini bukan milikmu.',
    });
  }

  if (!key) {
    key = videoStorageKey(authUserId, vidId, body.contentType);
  }

  // Safety: scope key to videos/ prefix supaya endpoint ini gak bisa
  // di-abuse hapus object lain (kalau bucket nanti shared multi-prefix).
  if (!key.startsWith('videos/')) {
    return jsonError('invalid_key_scope', 400);
  }

  try {
    await r2.client.send(
      new DeleteObjectCommand({
        Bucket: r2.bucket,
        Key: key,
      }),
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // R2 DeleteObject = idempotent (404 / not-found gak throw biasanya),
    // tapi tetap surface error lain.
    console.warn('[r2/delete] failed:', msg);
    return jsonError('delete_failed', 500, { message: msg });
  }

  return jsonOk({ key });
}
