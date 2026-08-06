// Partner Video Search API — cari video Playly BY JUDUL untuk proyek/situs LAIN.
//
// GET /api/videos?title=<q>&limit=<n>
//   Header: X-Playly-Key: <api key>   (ATAU query ?key=<api key>)
//   200 { ok:true, count, videos:[{ id, title, thumb, duration, createdAt, embedUrl, videoUrl }] }
//   401 { ok:false, error:"missing_key" | "invalid_key" }
//
// MODEL AKSES (multi-tenant, pola standar API konten): tiap proyek mitra punya
// API KEY. Key terikat ke SATU akun Playly (disimpan di user_state.state.apiKey).
// Pencarian HANYA mengembalikan video milik akun pemegang key itu (mis. key Dramaku
// → akun Raden → cuma video Raden). Judul dicocokkan "MENGANDUNG" (case-insensitive).
//
// Privasi: hanya video visibility public|unlisted + published + tak terjadwal masa
// depan (gate sama dgn /api/public-video). Response disanitasi (bukan state blob).
//
// CORS terbuka (Access-Control-Allow-Origin: *, TANPA credentials) supaya bisa
// dipanggil fetch() dari domain proyek luar. Aman (owasp §1): tanpa cookie/login,
// hanya metadata video yang sudah publik. API key men-scope + memungkinkan dicabut,
// BUKAN melindungi data rahasia (video-nya memang publik).

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { jsonError, jsonOk } from '@/lib/api/responses';

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Playly-Key',
  'Access-Control-Max-Age': '86400',
};
function withCors(res: NextResponse): NextResponse {
  for (const [k, v] of Object.entries(CORS_HEADERS)) res.headers.set(k, v);
  return res;
}

export function OPTIONS(): NextResponse {
  return withCors(new NextResponse(null, { status: 204 }));
}

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;
const MAX_TITLE_LEN = 200; // batasi panjang query (anti-abuse ringan)

function isPublicVisible(v: any): boolean {
  const vis = String(v?.visibility || 'public').toLowerCase();
  const st = String(v?.adminStatus || 'published').toLowerCase();
  const inFuture = !!(v?.scheduledAt && Date.parse(v.scheduledAt) > Date.now());
  return (vis === 'public' || vis === 'unlisted') && st !== 'draft' && !inFuture;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  // API key dari header (disarankan) atau query (fallback).
  const key = (req.headers.get('x-playly-key') || searchParams.get('key') || '').trim();
  if (!key) return withCors(jsonError('missing_key', 401));

  const title = (searchParams.get('title') || '').trim().slice(0, MAX_TITLE_LEN).toLowerCase();
  let limit = Number(searchParams.get('limit')) || DEFAULT_LIMIT;
  if (!Number.isFinite(limit) || limit < 1) limit = DEFAULT_LIMIT;
  if (limit > MAX_LIMIT) limit = MAX_LIMIT;

  const admin = createAdminClient();
  if (!admin) return withCors(jsonError('service_unavailable', 503, {
    message: 'SUPABASE_SERVICE_ROLE_KEY belum di-set.',
  }));

  // Temukan akun pemegang API key (jsonb containment di state.apiKey).
  const { data, error } = await admin
    .from('user_state')
    .select('state')
    .contains('state', { apiKey: key })
    .limit(1)
    .maybeSingle();

  if (error) return withCors(jsonError(error.message, 500));
  const state: any = data?.state;
  if (!state || state.apiKey !== key) return withCors(jsonError('invalid_key', 401));

  const all = Array.isArray(state.myVideos) ? state.myVideos : [];
  const matched = all
    .filter(isPublicVisible)
    .filter((v: any) => {
      if (!title) return true; // tanpa title → daftar semua video publik akun (dibatasi limit)
      return String(v?.title || '').toLowerCase().includes(title);
    })
    .slice(0, limit)
    .map((v: any) => ({
      id: v.id,
      title: v.title || 'Video',
      thumb: v.thumb || null,
      duration: v.duration || null,
      createdAt: v.createdAt ?? v.uploadedAt ?? null,
      embedUrl: `/id/${v.id}/embed`,
      videoUrl: v.videoUrl || null,
    }));

  return withCors(jsonOk({ count: matched.length, videos: matched }));
}
