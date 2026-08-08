// Minta server untuk transcode video menjadi multi-resolusi.
// POST /api/transcode/request
// Body: { videoId: string }
// Response: { ok: true, jobId, status: "pending" } | { ok: false, error }

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { findVideoInState, createTranscodeJob } from '@/lib/transcode/jobs';
import { jsonError, jsonOk } from '@/lib/api/responses';
import { videoObjectKey } from '@/lib/r2/client';

export async function POST(req: Request) {
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

  let body: { videoId?: string | number };
  try {
    body = await req.json();
  } catch {
    return jsonError('bad_json', 400);
  }

  const videoId = body.videoId;
  if (videoId == null || videoId === '') {
    return jsonError('missing_video_id', 400);
  }

  // Pastikan video ada dan milik user.
  const found = await findVideoInState(admin, videoId);
  if (!found || found.userId !== authUserId) {
    return jsonError('not_found', 404);
  }

  // Cegah duplikat job pending/processing untuk video yang sama.
  const { data: existing } = await admin
    .from('video_transcode_jobs')
    .select('id, status')
    .eq('video_id', String(videoId))
    .in('status', ['pending', 'processing'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) {
    return jsonOk({ jobId: existing.id, status: existing.status });
  }

  // Key asli di R2 (fallback: videos/{id}.mp4).
  const contentType = found.video?.contentType || found.video?.mimeType || 'video/mp4';
  const originalKey = videoObjectKey(String(videoId), contentType);

  const job = await createTranscodeJob(admin, videoId, authUserId, originalKey);
  if (!job) {
    return jsonError('create_job_failed', 500);
  }

  // Bangunkan worker transcoder via webhook (opsional). Kalau webhook gagal,
  // worker tetap akan memproses lewat polling.
  const webhookUrl = process.env.TRANSCODER_WEBHOOK_URL?.trim();
  if (webhookUrl) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 5000);
      await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(process.env.TRANSCODER_WEBHOOK_SECRET
            ? { 'X-Transcoder-Secret': process.env.TRANSCODER_WEBHOOK_SECRET }
            : {}),
        },
        body: JSON.stringify({ videoId: String(videoId), jobId: job.id }),
        signal: ctrl.signal,
      });
      clearTimeout(t);
    } catch (e) {
      console.warn('[transcode/request] webhook failed:', e);
    }
  }

  return jsonOk({ jobId: job.id, status: job.status });
}
