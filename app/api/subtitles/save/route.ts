// API: simpan subtitle video ke database.
// POST /api/subtitles/save
// Body: { videoId: string, language: string, cues: [{start, end, text}], isOriginal?: boolean }
//
// DECOUPLED dari tabel videos: kepemilikan diverifikasi via user_state (video
// disimpan di state.myVideos, bukan tabel videos ternormalisasi). videoId =
// id apa adanya (legacy numerik / string). Hanya owner video yang bisa simpan.
// Sukses: { ok:true, subtitleId }  ·  Gagal: { ok:false, error }

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { jsonError, jsonOk } from '@/lib/api/responses';

type Cue = { start: number; end: number; text: string };
type SaveBody = { videoId?: string; language?: string; cues?: Cue[]; isOriginal?: boolean };

export async function POST(req: Request) {
  // 1) Verifikasi sesi (server-side) — siapa yang login
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return jsonError('supabase_unavailable', 503);
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) {
    return jsonError('not_authenticated', 401);
  }

  // 2) Parse + validasi body
  let body: SaveBody;
  try {
    body = await req.json();
  } catch {
    return jsonError('bad_json', 400);
  }
  const videoId = String(body.videoId || '').trim();
  const language = String(body.language || 'id')
    .trim()
    .toLowerCase();
  const cues = Array.isArray(body.cues) ? body.cues : [];
  const isOriginal = body.isOriginal !== false;

  if (!videoId) return jsonError('missing_video_id', 400);
  if (!language || language.length > 10) return jsonError('invalid_language', 400);
  if (cues.length === 0) return jsonError('missing_cues', 400);
  for (const cue of cues) {
    if (typeof cue.start !== 'number' || typeof cue.end !== 'number' || typeof cue.text !== 'string') {
      return jsonError('invalid_cue_format', 400);
    }
  }

  // 3) Verifikasi OWNER via user_state (bukan tabel videos). Video ada di
  //    state.myVideos milik user. id legacy = numerik → koersi utk jsonb
  //    containment (query string tak pernah cocok angka di jsonb).
  const admin = createAdminClient();
  if (!admin) {
    return jsonError('service_unavailable', 503, { message: 'SUPABASE_SERVICE_ROLE_KEY belum di-set.' });
  }
  const idMatch: string | number = /^\d+$/.test(videoId) ? Number(videoId) : videoId;
  const { data: owned, error: ownErr } = await admin
    .from('user_state')
    .select('user_id')
    .eq('user_id', user.id)
    .contains('state', { myVideos: [{ id: idMatch }] })
    .maybeSingle();
  if (ownErr) return jsonError('owner_check_failed', 500, { message: ownErr.message });
  if (!owned) return jsonError('forbidden_not_owner', 403);

  // 4) Simpan/replace subtitle (video_id sebagai string; updated_at oleh route)
  const { data, error } = await admin
    .from('video_subtitles')
    .upsert(
      {
        video_id: String(videoId),
        language,
        cues,
        is_original: isOriginal,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'video_id,language' },
    )
    .select('id')
    .single();

  if (error) return jsonError('save_failed', 500, { message: error.message });
  return jsonOk({ subtitleId: data.id });
}

export function GET() {
  return jsonError('method_not_allowed', 405);
}
