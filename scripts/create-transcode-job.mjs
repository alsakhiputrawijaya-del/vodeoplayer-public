import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Script untuk membuat transcode job manual untuk video yang sudah ada.
// Usage: node scripts/create-transcode-job.mjs <videoId>

const envText = readFileSync('.env', 'utf8');
const getEnv = (key) => {
  const m = envText.match(new RegExp(`${key}=(.+)`));
  return m ? m[1].trim() : process.env[key];
};

const url = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const key = getEnv('SUPABASE_SERVICE_ROLE_KEY');
if (!url || !key) {
  console.error('NEXT_PUBLIC_SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY belum di-set di .env');
  process.exit(1);
}

const videoId = process.argv[2];
if (!videoId) {
  console.error('Usage: node scripts/create-transcode-job.mjs <videoId>');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

async function main() {
  // Cari video di user_state
  const { data, error } = await supabase
    .from('user_state')
    .select('user_id, state')
    .contains('state', { myVideos: [{ id: videoId }] })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    console.error('Video tidak ditemukan atau error:', error?.message);
    process.exit(1);
  }

  const myVideos = data.state?.myVideos || [];
  const video = myVideos.find((v) => v && String(v.id) === String(videoId));
  if (!video) {
    console.error('Video tidak ditemukan di state');
    process.exit(1);
  }

  const contentType = video.contentType || video.mimeType || 'video/mp4';
  const ext = contentType.includes('webm') ? 'webm' : contentType.includes('quicktime') || contentType.includes('mov') ? 'mov' : 'mp4';
  const originalKey = `videos/${videoId}.${ext}`;

  // Cegah duplikat job pending/processing
  const { data: existing } = await supabase
    .from('video_transcode_jobs')
    .select('id, status')
    .eq('video_id', String(videoId))
    .in('status', ['pending', 'processing'])
    .limit(1)
    .maybeSingle();

  if (existing) {
    console.log('Job sudah ada:', existing.id, 'status:', existing.status);
    return;
  }

  const { data: job, error: insertErr } = await supabase
    .from('video_transcode_jobs')
    .insert({
      video_id: String(videoId),
      owner_id: data.user_id,
      status: 'pending',
      original_key: originalKey,
      variants: {},
    })
    .select()
    .single();

  if (insertErr || !job) {
    console.error('Gagal membuat job:', insertErr?.message);
    process.exit(1);
  }

  console.log('Job transcode dibuat:', job.id);
  console.log('Pastikan worker berjalan. Worker akan memproses job ini.');
}

main().catch((e) => { console.error(e); process.exit(1); });
