// Upload / resolve / hapus objek video di Supabase Storage.
// Pendamping app/api/r2/* — pola sama, target storage berbeda.
//
// KENAPA ADA: cloud-sync.js membuat Supabase client dengan `persistSession: false`,
// jadi klien itu TIDAK PERNAH membawa sesi user — semua permintaan storage
// berangkat sebagai `anon`. Bucket "videos" cuma punya policy INSERT untuk role
// `authenticated` dengan syarat path `{owner_id}/{file}` (0001_videos_schema.sql),
// sehingga upload langsung dari browser SELALU ditolak RLS. Gejalanya diam:
// aplikasi jatuh ke "video disimpan lokal saja", database mencatat 9 video
// ber-URL blob:, dan bucket-nya kosong melompong.
//
// Jalur ini memakai service role DI SERVER untuk menerbitkan signed upload URL;
// browser lalu PUT langsung ke URL itu (lolos batas body 4.5 MB Vercel). Kunci
// service role tidak pernah sampai ke browser, dan PATH ditentukan server —
// bukan dikirim klien — supaya tidak bisa dipakai menimpa file akun lain.
//
//   POST   { id, contentType?, sizeBytes? } -> { uploadUrl, token, path, publicUrl }
//   GET    ?id=<id>                         -> { path, publicUrl }
//   DELETE ?id=<id>                         -> { removed: [...] }
//
// 401 not_authenticated · 403 id milik akun lain · 404 not_found
// 413 file_too_large · 503 service_unavailable (service role belum di-set)

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyVideoOwnership } from '@/lib/r2/ownership';
import { jsonError, jsonOk } from '@/lib/api/responses';
import { VIDEO_BUCKET, videoStorageKey } from '@/lib/storage/paths';

const BUCKET = VIDEO_BUCKET;
// Batas kewarasan di sisi kita. Bucket Supabase punya batasnya sendiri
// (setelan project) dan akan menolak lebih dulu kalau lebih ketat — pesannya
// diteruskan apa adanya ke user oleh cloud-sync.
const MAX_BYTES = 500 * 1024 * 1024;
const TTL_SECONDS = 300;

type Konteks = {
  admin: NonNullable<ReturnType<typeof createAdminClient>>;
  userId: string;
};

// Auth + service role sekaligus: ketiga handler butuh keduanya.
async function siapkan(): Promise<Konteks | Response> {
  const admin = createAdminClient();
  if (!admin) {
    return jsonError('service_unavailable', 503, {
      message: 'SUPABASE_SERVICE_ROLE_KEY belum di-set — upload ke storage tidak bisa dijalankan.',
    });
  }
  let userId: string | null = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    userId = data.user?.id || null;
  } catch {
    return jsonError('auth_unavailable', 503);
  }
  if (!userId) return jsonError('not_authenticated', 401);
  return { admin, userId };
}

function idDariQuery(req: Request): string {
  return (new URL(req.url).searchParams.get('id') || '').trim();
}

// Cari file milik user untuk satu id. Dipakai GET & DELETE; ekstensi tidak
// selalu diketahui pemanggil (mp4/webm/mov), jadi folder owner-nya yang disisir.
async function cariFile(
  ctx: Konteks,
  id: string,
): Promise<{ path: string; publicUrl: string } | null> {
  const { data } = await ctx.admin.storage
    .from(BUCKET)
    .list(ctx.userId, { limit: 100, search: `${id}.` });
  const hit = (data || []).find((f) => f.name.startsWith(`${id}.`));
  if (!hit) return null;
  const path = `${ctx.userId}/${hit.name}`;
  const { data: pub } = ctx.admin.storage.from(BUCKET).getPublicUrl(path);
  return { path, publicUrl: pub?.publicUrl || '' };
}

export async function POST(req: Request) {
  const ctx = await siapkan();
  if (ctx instanceof Response) return ctx;

  let body: { id?: string; contentType?: string; sizeBytes?: number };
  try {
    body = await req.json();
  } catch {
    return jsonError('bad_json', 400);
  }

  const id = String(body.id || '').trim();
  if (!id) return jsonError('missing_id', 400);

  // Batas bucket ditanyakan ke Supabase, bukan ditebak: nilainya ikut paket dan
  // bisa diubah kapan saja lewat dashboard. Ditolak SEBELUM signed URL terbit
  // supaya klien tidak mengunggah puluhan MB hanya untuk ditolak di akhir, dan
  // supaya klien tahu angkanya — itu yang dipakai untuk memutuskan mengecilkan.
  let batasBucket = MAX_BYTES;
  try {
    const { data: bucket } = await ctx.admin.storage.getBucket(BUCKET);
    if (bucket?.file_size_limit) batasBucket = Math.min(MAX_BYTES, bucket.file_size_limit);
  } catch {
    // Gagal membaca setelan bucket bukan alasan menolak upload — pakai batas kita.
  }
  const ukuran = Number(body.sizeBytes) || 0;
  if (ukuran > batasBucket) {
    return jsonError('file_too_large', 413, {
      maxBytes: batasBucket,
      message:
        'File ' + (ukuran / 1048576).toFixed(1) + ' MB melebihi batas ' +
        Math.floor(batasBucket / 1048576) + ' MB di storage.',
    });
  }

  // ANTI-IDOR, sama seperti jalur R2: tanpa ini user login bisa meminta URL
  // upload untuk id video ORANG LAIN lalu menimpa filenya.
  const verdict = await verifyVideoOwnership(ctx.admin, id, ctx.userId);
  if (!verdict.ok) {
    return jsonError(verdict.error, verdict.status, {
      message: verdict.message || 'Id video ini sudah dipakai akun lain.',
    });
  }

  // Konvensi wajib policy videos_storage_insert_own:
  //   auth.uid()::text = (storage.foldername(name))[1]
  const path = videoStorageKey(ctx.userId, id, body.contentType);
  const { data, error } = await ctx.admin.storage
    .from(BUCKET)
    .createSignedUploadUrl(path, { upsert: true });
  if (error || !data) {
    return jsonError('sign_failed', 500, { message: error?.message || 'gagal membuat signed URL' });
  }

  const { data: pub } = ctx.admin.storage.from(BUCKET).getPublicUrl(path);
  return jsonOk({
    uploadUrl: data.signedUrl,
    token: data.token,
    path,
    publicUrl: pub?.publicUrl || null,
    expiresIn: TTL_SECONDS,
  });
}

export async function GET(req: Request) {
  const ctx = await siapkan();
  if (ctx instanceof Response) return ctx;
  const id = idDariQuery(req);
  if (!id) return jsonError('missing_id', 400);
  const hit = await cariFile(ctx, id);
  if (!hit) return jsonError('not_found', 404);
  return jsonOk(hit);
}

export async function DELETE(req: Request) {
  const ctx = await siapkan();
  if (ctx instanceof Response) return ctx;
  const id = idDariQuery(req);
  if (!id) return jsonError('missing_id', 400);

  // Hanya menyisir folder milik user sendiri, jadi file akun lain tak terjangkau
  // walau id-nya ditebak. Variant hasil transcode ikut terhapus (<id>_720p.mp4).
  const { data } = await ctx.admin.storage
    .from(BUCKET)
    .list(ctx.userId, { limit: 100, search: id });
  const target = (data || [])
    .filter((f) => f.name.startsWith(`${id}.`) || f.name.startsWith(`${id}_`))
    .map((f) => `${ctx.userId}/${f.name}`);
  if (!target.length) return jsonOk({ removed: [] });

  const { error } = await ctx.admin.storage.from(BUCKET).remove(target);
  if (error) return jsonError('delete_failed', 500, { message: error.message });
  return jsonOk({ removed: target });
}
