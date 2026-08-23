// Helper operasi job transcoding multi-resolusi.
// Semua fungsi di sini memerlukan service-role Supabase client (createAdminClient).
// JANGAN dipanggil dari kode browser.

import type { SupabaseClient } from '@supabase/supabase-js';

export type TranscodeStatus = 'pending' | 'processing' | 'done' | 'failed';

export type TranscodeVariants = Record<string, string>;

export type TranscodeJob = {
  id: string;
  video_id: string;
  owner_id: string;
  status: TranscodeStatus;
  original_key: string | null;
  variants: TranscodeVariants;
  error: string | null;
  created_at: string;
  updated_at: string;
};

// Cari video di user_state.state.myVideos beserta owner_id-nya.
// Service role diperlukan karena user_state RLS owner-scoped.
export async function findVideoInState(
  admin: SupabaseClient,
  videoId: string | number,
): Promise<{ userId: string; video: any; state: any } | null> {
  const mentah = String(videoId ?? '').trim();
  if (!mentah) return null;

  // Pencocokan JSONB containment membedakan 1787527932499 (number) dari
  // "1787527932499" (string): id yang tersimpan di state bertipe number, jadi
  // pemanggil yang mengirimnya sebagai string TIDAK PERNAH ketemu — job transcode
  // gagal dibuat diam-diam dengan 404 not_found, tanpa jejak apa pun di log.
  // Karena itu kedua bentuk dicoba, bukan hanya bentuk yang kebetulan dikirim.
  const kandidat: Array<string | number> = /^d+$/.test(mentah)
    ? [Number(mentah), mentah]
    : [mentah];

  for (const id of kandidat) {
    const { data, error } = await admin
      .from('user_state')
      .select('user_id, state')
      .contains('state', { myVideos: [{ id }] })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.warn('[transcode/findVideoInState] error:', error.message);
      return null;
    }
    if (!data) continue;

    const myVideos = data.state?.myVideos;
    if (!Array.isArray(myVideos)) continue;

    // Dibandingkan sebagai teks supaya tipe di state tak lagi menentukan hasil.
    const video = myVideos.find((v: any) => v && String(v.id) === mentah);
    if (video) return { userId: data.user_id, video, state: data.state };
  }
  return null;
}

// Buat job transcode baru. Mengembalikan job atau null bila gagal.
export async function createTranscodeJob(
  admin: SupabaseClient,
  videoId: string | number,
  ownerId: string,
  originalKey?: string,
): Promise<TranscodeJob | null> {
  const id = typeof videoId === 'number' ? String(videoId) : String(videoId).trim();
  const { data, error } = await admin
    .from('video_transcode_jobs')
    .insert({
      video_id: id,
      owner_id: ownerId,
      status: 'pending',
      original_key: originalKey || null,
      variants: {},
    })
    .select()
    .single();

  if (error || !data) {
    console.warn('[transcode/createTranscodeJob] error:', error?.message);
    return null;
  }
  return data as TranscodeJob;
}

// Ambil job terbaru untuk satu video.
export async function getTranscodeJobByVideo(
  admin: SupabaseClient,
  videoId: string | number,
): Promise<TranscodeJob | null> {
  const id = typeof videoId === 'number' ? String(videoId) : String(videoId).trim();
  const { data, error } = await admin
    .from('video_transcode_jobs')
    .select('*')
    .eq('video_id', id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    console.warn('[transcode/getTranscodeJobByVideo] error:', error?.message);
    return null;
  }
  return data as TranscodeJob;
}

// Worker: ambil satu job pending paling lama.
export async function getPendingJob(
  admin: SupabaseClient,
): Promise<TranscodeJob | null> {
  const { data, error } = await admin
    .from('video_transcode_jobs')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    if (error) console.warn('[transcode/getPendingJob] error:', error.message);
    return null;
  }
  return data as TranscodeJob;
}

// Update status & variants job.
export async function updateJob(
  admin: SupabaseClient,
  jobId: string,
  patch: Partial<Pick<TranscodeJob, 'status' | 'variants' | 'error'>>,
): Promise<boolean> {
  const { error } = await admin
    .from('video_transcode_jobs')
    .update({
      ...patch,
      updated_at: new Date().toISOString(),
    })
    .eq('id', jobId);

  if (error) {
    console.warn('[transcode/updateJob] error:', error.message);
    return false;
  }
  return true;
}

// Update field variants di dalam myVideos (JSONB) untuk satu video.
export async function updateVideoVariants(
  admin: SupabaseClient,
  ownerId: string,
  videoId: string | number,
  variants: TranscodeVariants,
): Promise<boolean> {
  const found = await findVideoInState(admin, videoId);
  if (!found || found.userId !== ownerId) {
    console.warn('[transcode/updateVideoVariants] video not found or owner mismatch');
    return false;
  }

  const { video, state } = found;
  video.variants = variants;

  const { error } = await admin
    .from('user_state')
    .update({ state })
    .eq('user_id', ownerId);

  if (error) {
    console.warn('[transcode/updateVideoVariants] update error:', error.message);
    return false;
  }
  return true;
}
