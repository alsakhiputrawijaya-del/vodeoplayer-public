// Cek status transcoding untuk satu video.
// GET /api/transcode/status?videoId=<id>
// Response: { ok: true, videoId, status, variants?, error? }

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { findVideoInState, getTranscodeJobByVideo } from '@/lib/transcode/jobs';
import { jsonError, jsonOk } from '@/lib/api/responses';

export async function GET(req: Request) {
  const admin = createAdminClient();
  if (!admin) {
    return jsonError('service_unavailable', 503, {
      message: 'SUPABASE_SERVICE_ROLE_KEY belum di-set.',
    });
  }

  let authUserId: string | null = null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    authUserId = user?.id || null;
  } catch {
    return jsonError('auth_unavailable', 503);
  }
  if (!authUserId) {
    return jsonError('not_authenticated', 401);
  }

  const { searchParams } = new URL(req.url);
  const videoId = searchParams.get('videoId');
  if (!videoId) {
    return jsonError('missing_video_id', 400);
  }

  // Pastikan user punya akses ke video ini.
  const found = await findVideoInState(admin, videoId);
  if (!found || found.userId !== authUserId) {
    return jsonError('not_found', 404);
  }

  const job = await getTranscodeJobByVideo(admin, videoId);
  if (!job) {
    return jsonOk({ videoId, status: 'none', variants: {} });
  }

  return jsonOk({
    videoId,
    status: job.status,
    variants: job.variants || {},
    error: job.error || undefined,
    updatedAt: job.updated_at,
  });
}
