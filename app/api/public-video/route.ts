// Public video metadata endpoint — pengganti lookup kv.playly-state-* (kosong
// sejak state pindah ke tabel user_state owner-only di migrasi B3/B5).
// Dipakai watch-init.js & embed-init.js untuk link publik tanpa login.
//
// GET /api/public-video?id=<videoId>
//   200 { ok:true, id, title, creator, thumb, videoUrl, duration, viewsNum, ... }
//   404 { ok:false, error:"not_found" } — id tak dikenal ATAU video privat/draft/terjadwal.
//
// Privasi: hanya visibility public|unlisted + adminStatus != draft + tidak
// terjadwal masa depan (gerbang sama dgn watch-init 26 Jul 2026). Response
// disanitasi (hanya field yang dibutuhkan player publik — BUKAN state blob).

import { createAdminClient } from '@/lib/supabase/admin';
import { jsonError, jsonOk } from '@/lib/api/responses';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const idRaw = (searchParams.get('id') || '').trim();
  if (!idRaw) return jsonError('missing_id', 400);
  // id video = timestamp numerik di JSON state; query string beri string →
  // koersi ke Number bila numerik, kalau tidak jsonb containment tak pernah cocok.
  const id: string | number = /^\d+$/.test(idRaw) ? Number(idRaw) : idRaw;

  const admin = createAdminClient();
  if (!admin) return jsonError('service_unavailable', 503, {
    message: 'SUPABASE_SERVICE_ROLE_KEY belum di-set.',
  });

  // Cari video di state.myVideos semua user (jsonb containment on nested array).
  const { data, error } = await admin
    .from('user_state')
    .select('user_id, state')
    .contains('state', { myVideos: [{ id }] })
    .limit(1)
    .maybeSingle();

  if (error) return jsonError(error.message, 500);

  const state: any = data?.state;
  const v = Array.isArray(state?.myVideos)
    ? state.myVideos.find((x: any) => x && x.id === id)
    : null;
  if (!v) return jsonError('not_found', 404);

  // Gate privasi — hanya Publik/Unlisted yang published & tak terjadwal.
  const vis = String(v.visibility || 'public').toLowerCase();
  const st = String(v.adminStatus || 'published').toLowerCase();
  const inFuture = !!(v.scheduledAt && Date.parse(v.scheduledAt) > Date.now());
  if ((vis !== 'public' && vis !== 'unlisted') || st === 'draft' || inFuture) {
    return jsonError('not_found', 404);
  }

  return jsonOk({
    id: v.id,
    title: v.title || 'Video',
    creator: v.creator || v.uploader || 'creator',
    thumb: v.thumb || null,
    videoUrl: v.videoUrl || null,
    duration: v.duration || null,
    viewsNum: v.viewsNum ?? v.views ?? 0,
    likes: v.likesNum ?? v.likes ?? 0,
    createdAt: v.createdAt ?? v.uploadedAt ?? null,
    videoEdit: v.videoEdit ?? null,
    wmLogo: v.wmLogo ?? null,
    desc: v.desc ?? null,
    category: v.category ?? null,
  });
}
