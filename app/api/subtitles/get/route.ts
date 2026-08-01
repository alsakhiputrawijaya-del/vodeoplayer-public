// API: ambil subtitle video dari database.
// GET /api/subtitles/get?videoId=<id>&language=<lang>
//
// DECOUPLED dari tabel videos: visibility & owner di-resolve dari user_state
// (sama seperti /api/public-video). Viewer bisa baca subtitle video
// public/unlisted; video privat/draft hanya owner.
// Sukses: { ok:true, subtitles:[{id, language, cues, isOriginal}] }

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { jsonError, jsonOk } from '@/lib/api/responses';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const videoId = (searchParams.get('videoId') || '').trim();
  const language = searchParams.get('language');
  if (!videoId) return jsonError('missing_video_id', 400);

  const admin = createAdminClient();
  if (!admin) {
    return jsonError('service_unavailable', 503, { message: 'SUPABASE_SERVICE_ROLE_KEY belum di-set.' });
  }

  // Resolve video → owner + visibility dari user_state (id legacy = numerik →
  // koersi utk jsonb containment). Meniru /api/public-video.
  const idMatch: string | number = /^\d+$/.test(videoId) ? Number(videoId) : videoId;
  const { data: row, error: rowErr } = await admin
    .from('user_state')
    .select('user_id, state')
    .contains('state', { myVideos: [{ id: idMatch }] })
    .limit(1)
    .maybeSingle();
  if (rowErr) return jsonError('video_check_failed', 500, { message: rowErr.message });

  const state: unknown = row?.state;
  const myVideos = (state as { myVideos?: unknown })?.myVideos;
  const v = Array.isArray(myVideos)
    ? (myVideos.find((x) => x && (x as { id?: unknown }).id === idMatch) as
        | { visibility?: string; adminStatus?: string; scheduledAt?: string }
        | undefined)
    : undefined;
  if (!v) return jsonError('video_not_found', 404);

  // Gate privasi: publik/unlisted + published + tak terjadwal = boleh siapa saja.
  // Selain itu (privat/draft/terjadwal) hanya owner.
  const vis = String(v.visibility || 'public').toLowerCase();
  const st = String(v.adminStatus || 'published').toLowerCase();
  const inFuture = !!(v.scheduledAt && Date.parse(v.scheduledAt) > Date.now());
  const isPublic = (vis === 'public' || vis === 'unlisted') && st !== 'draft' && !inFuture;

  if (!isPublic) {
    let supabase;
    try {
      supabase = await createClient();
    } catch {
      supabase = null;
    }
    const user = supabase ? (await supabase.auth.getUser()).data.user : null;
    if (!user || user.id !== row?.user_id) return jsonError('forbidden', 403);
  }

  // Ambil subtitle (video_id sebagai string)
  let query = admin
    .from('video_subtitles')
    .select('id, language, cues, is_original, created_at')
    .eq('video_id', String(videoId))
    .order('is_original', { ascending: false })
    .order('language', { ascending: true });
  if (language) query = query.eq('language', language);

  const { data, error } = await query;
  if (error) return jsonError('fetch_failed', 500, { message: error.message });

  return jsonOk({
    subtitles: (data || []).map((s) => ({
      id: s.id,
      language: s.language,
      cues: s.cues,
      isOriginal: s.is_original,
    })),
  });
}
