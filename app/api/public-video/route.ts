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
//
// CORS (2026-08-06): endpoint ini SENGAJA dibuka lintas-origin (Access-Control-
// Allow-Origin: *) supaya proyek/situs LAIN (mis. Dramaku/NovelAksara/lk21) bisa
// memanggilnya lewat fetch() dari domainnya sendiri untuk menampilkan video Playly.
// AMAN (rak owasp §1): wildcard * berbahaya HANYA bila digabung
// Access-Control-Allow-Credentials:true (ikut kirim cookie) — di sini TIDAK: endpoint
// tanpa login/cookie, dan data yang dikembalikan HANYA metadata video yang MEMANG
// sudah publik (lolos gate public/unlisted) — tanpa email/PII/state privat.

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { jsonError, jsonOk } from '@/lib/api/responses';
import { rateLimitAsync, clientIp } from '@/lib/api/rate-limit';

// Header CORS terbuka (data publik, TANPA credentials) — dipasang ke SEMUA respons.
const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};
function withCors(res: NextResponse): NextResponse {
  for (const [k, v] of Object.entries(CORS_HEADERS)) res.headers.set(k, v);
  return res;
}

// Preflight (browser kirim OPTIONS sebelum GET lintas-origin dgn header non-simple).
export function OPTIONS(): NextResponse {
  return withCors(new NextResponse(null, { status: 204 }));
}

export async function GET(req: Request) {
  // Rate-limit ringan per-IP (embed page memanggil 1x/load → batas longgar).
  const rl = await rateLimitAsync(clientIp(req), 120, 60_000);
  if (!rl.ok) {
    const r = withCors(jsonError('rate_limited', 429));
    r.headers.set('Retry-After', String(rl.retryAfter));
    return r;
  }
  const { searchParams } = new URL(req.url);
  const idRaw = (searchParams.get('id') || '').trim();
  if (!idRaw) return withCors(jsonError('missing_id', 400));
  // id video = timestamp numerik di JSON state; query string beri string →
  // koersi ke Number bila numerik, kalau tidak jsonb containment tak pernah cocok.
  const id: string | number = /^\d+$/.test(idRaw) ? Number(idRaw) : idRaw;

  const admin = createAdminClient();
  if (!admin) return withCors(jsonError('service_unavailable', 503, {
    message: 'SUPABASE_SERVICE_ROLE_KEY belum di-set.',
  }));

  // Cari video di state.myVideos semua user (jsonb containment on nested array).
  const { data, error } = await admin
    .from('user_state')
    .select('user_id, state')
    .contains('state', { myVideos: [{ id }] })
    .limit(1)
    .maybeSingle();

  if (error) return withCors(jsonError(error.message, 500));

  const state: any = data?.state;
  const v = Array.isArray(state?.myVideos)
    ? state.myVideos.find((x: any) => x && x.id === id)
    : null;
  if (!v) return withCors(jsonError('not_found', 404));

  // Gate privasi — hanya Publik/Unlisted yang published & tak terjadwal.
  const vis = String(v.visibility || 'public').toLowerCase();
  const st = String(v.adminStatus || 'published').toLowerCase();
  const inFuture = !!(v.scheduledAt && Date.parse(v.scheduledAt) > Date.now());
  if ((vis !== 'public' && vis !== 'unlisted') || st === 'draft' || inFuture) {
    return withCors(jsonError('not_found', 404));
  }

  return withCors(jsonOk({
    id: v.id,
    title: v.title || 'Video',
    creator: v.creator || v.uploader || 'creator',
    thumb: v.thumb || null,
    videoUrl: v.videoUrl || null,
    variants: v.variants || {},
    duration: v.duration || null,
    viewsNum: v.viewsNum ?? v.views ?? 0,
    likes: v.likesNum ?? v.likes ?? 0,
    createdAt: v.createdAt ?? v.uploadedAt ?? null,
    videoEdit: v.videoEdit ?? null,
    wmLogo: v.wmLogo ?? null,
    desc: v.desc ?? null,
    category: v.category ?? null,
    // Subtitle (Fase 2): sudah tersimpan di myVideos saat upload. Expose ke
    // viewer link publik supaya CC muncul lintas-perangkat tanpa tabel terpisah.
    // Aman: video ini sudah lolos gate publik/unlisted di atas; VTT = teks caption
    // yang memang untuk ditonton (bukan data sensitif).
    subtitleVtt: v.subtitleVtt ?? null,
    subtitleLang: v.subtitleLang ?? null,
    // Embed siap-pakai (path relatif ke origin Playly) — memudahkan proyek luar.
    embedUrl: `/id/${v.id}/embed`,
  }));
}
