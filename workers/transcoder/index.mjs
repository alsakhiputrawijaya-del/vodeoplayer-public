/**
 * Playly Transcoder Worker
 *
 * Service terpisah yang memproses video menjadi multi-resolusi (360p/480p/720p/1080p)
 * menggunakan ffmpeg, lalu mengunggah hasilnya ke R2.
 *
 * Mode operasi:
 * 1. Menerima webhook POST /process dari API Next.js saat ada video baru.
 * 2. Polling Supabase tiap 10 detik untuk job pending (backup kalau webhook miss).
 *
 * Deploy: Docker / Render / Fly.io / Railway / VPS.
 * TIDAK bisa di-deploy ke Vercel karena butuh ffmpeg binary & durasi panjang.
 */

import { createClient } from '@supabase/supabase-js';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { FetchHttpHandler } from '@smithy/fetch-http-handler';
import { createWriteStream, existsSync, promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import ffprobeStatic from 'ffprobe-static';
import http from 'node:http';

// -------------------- ENV / CONFIG --------------------
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Storage: Supabase Storage S3-compatible (primary) atau Cloudflare R2 (legacy).
function inferRegion(endpoint) {
  const m = endpoint.match(/\.s3\.([a-z0-9-]+)\./);
  if (m) return m[1];
  if (endpoint.includes('.r2.cloudflarestorage.com')) return 'auto';
  // Endpoint baru Supabase Storage: https://<ref>.storage.supabase.co/storage/s3
  // Region tidak ada di URL → pakai env S3_REGION atau fallback auto.
  return process.env.S3_REGION || 'auto';
}

function inferSupabasePublicUrl(bucket) {
  const s3Endpoint = process.env.S3_ENDPOINT?.trim();
  if (s3Endpoint && s3Endpoint.includes('.storage.supabase.co')) {
    const base = s3Endpoint.replace(/\/storage\/s3\/?$/i, '');
    return `${base}/storage/v1/object/public/${bucket}`;
  }
  if (!SUPABASE_URL) return null;
  return `${SUPABASE_URL.replace(/\/+$/, '')}/storage/v1/object/public/${bucket}`;
}

const STORAGE_ENDPOINT =
  process.env.S3_ENDPOINT?.trim() ||
  (process.env.R2_ACCOUNT_ID?.trim()
    ? `https://${process.env.R2_ACCOUNT_ID.trim()}.r2.cloudflarestorage.com`
    : '');

const STORAGE_ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID?.trim() || process.env.R2_ACCESS_KEY_ID?.trim();
const STORAGE_SECRET_ACCESS_KEY =
  process.env.S3_SECRET_ACCESS_KEY?.trim() || process.env.R2_SECRET_ACCESS_KEY?.trim();
const STORAGE_BUCKET = process.env.S3_BUCKET?.trim() || process.env.R2_BUCKET?.trim();
const STORAGE_PUBLIC_URL = (
  process.env.S3_PUBLIC_URL ||
  inferSupabasePublicUrl(STORAGE_BUCKET || '') ||
  process.env.R2_PUBLIC_URL ||
  ''
).replace(/\/+$/, '');

const FFMPEG_PATH = process.env.FFMPEG_PATH?.trim() || ffmpegStatic || null;
// ffprobe-static mengekspor OBJEK { path }, bukan string seperti ffmpeg-static.
// Tanpa ?.path, setFfprobePath() menerima objek dan probe durasi/resolusi gagal.
const FFPROBE_PATH =
  process.env.FFPROBE_PATH?.trim() || ffprobeStatic?.path || ffprobeStatic || null;
const POLL_INTERVAL_MS = Math.max(3000, Number(process.env.POLL_INTERVAL_MS || 10000));
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
const PORT = Number(process.env.PORT || 3000);

const TARGETS = [1080, 720, 480, 360];

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('[transcoder] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY belum di-set.');
  process.exit(1);
}

if (!STORAGE_ENDPOINT || !STORAGE_ACCESS_KEY_ID || !STORAGE_SECRET_ACCESS_KEY || !STORAGE_BUCKET || !STORAGE_PUBLIC_URL) {
  console.error('[transcoder] Storage (S3/R2) env vars belum lengkap.');
  process.exit(1);
}

if (FFMPEG_PATH) ffmpeg.setFfmpegPath(FFMPEG_PATH);
if (FFPROBE_PATH) ffmpeg.setFfprobePath(FFPROBE_PATH);

const isSupabaseStorage = STORAGE_ENDPOINT.includes('.supabase.co');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const r2 = new S3Client({
  region: inferRegion(STORAGE_ENDPOINT),
  endpoint: STORAGE_ENDPOINT,
  credentials: {
    accessKeyId: STORAGE_ACCESS_KEY_ID,
    secretAccessKey: STORAGE_SECRET_ACCESS_KEY,
  },
  forcePathStyle: isSupabaseStorage || process.env.S3_FORCE_PATH_STYLE === 'true',
  requestChecksumCalculation: 'WHEN_REQUIRED',
  responseChecksumValidation: 'WHEN_REQUIRED',
  requestHandler: new FetchHttpHandler(),
});

// -------------------- HELPERS --------------------
function extFromContentType(ct) {
  if (!ct) return 'mp4';
  const lower = String(ct).toLowerCase();
  if (lower.includes('webm')) return 'webm';
  if (lower.includes('quicktime') || lower.includes('mov')) return 'mov';
  return 'mp4';
}

function sanitizeId(id) {
  return String(id).replace(/[^A-Za-z0-9_-]/g, '').slice(0, 64) || 'unknown';
}

function objectKeyForOriginal(id, contentType) {
  return `videos/${sanitizeId(id)}.${extFromContentType(contentType)}`;
}

function objectKeyForVariant(id, height, contentType) {
  return `videos/${sanitizeId(id)}_${height}p.${extFromContentType(contentType)}`;
}

function publicUrl(key) {
  return `${STORAGE_PUBLIC_URL}/${key}`;
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function safeRemove(filePath) {
  try {
    if (existsSync(filePath)) await fs.unlink(filePath);
  } catch {
    // ignore
  }
}

async function downloadOriginal(key, destPath) {
  const { Body } = await r2.send(new GetObjectCommand({ Bucket: STORAGE_BUCKET, Key: key }));
  if (!Body) throw new Error('R2 object empty');
  await pipeline(Body, createWriteStream(destPath));
}

async function uploadVariant(localPath, key, contentType) {
  const fileBuffer = await fs.readFile(localPath);
  await r2.send(
    new PutObjectCommand({
      Bucket: STORAGE_BUCKET,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType || 'video/mp4',
    }),
  );
}

function probeHeight(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);
      const h = metadata?.streams?.find((s) => s.height)?.height;
      resolve(Number(h) || 0);
    });
  });
}

function runFfmpeg(inputPath, outputPath, height) {
  return new Promise((resolve, reject) => {
    const cmd = ffmpeg(inputPath)
      .videoCodec('libx264')
      .audioCodec('aac')
      .audioBitrate('128k')
      .videoFilters(`scale=-2:${height}`)
      .outputOptions([
        '-preset veryfast',
        '-crf 23',
        '-movflags +faststart',
        '-pix_fmt yuv420p',
        '-threads 0',
      ])
      .on('end', () => resolve())
      .on('error', (err) => reject(err));

    cmd.save(outputPath);
  });
}

async function updateJob(jobId, patch) {
  const { error } = await supabase
    .from('video_transcode_jobs')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', jobId);
  if (error) console.warn('[transcoder] updateJob error:', error.message);
}

async function updateVideoVariants(ownerId, videoId, variants) {
  const { data, error } = await supabase
    .from('user_state')
    .select('state')
    .eq('user_id', ownerId)
    .maybeSingle();

  if (error || !data) {
    console.warn('[transcoder] updateVideoVariants fetch error:', error?.message);
    return false;
  }

  const state = data.state || {};
  const myVideos = Array.isArray(state.myVideos) ? state.myVideos : [];
  const idx = myVideos.findIndex((v) => v && String(v.id) === String(videoId));
  if (idx === -1) {
    console.warn('[transcoder] video not found in state:', videoId);
    return false;
  }

  myVideos[idx].variants = variants;

  const { error: upErr } = await supabase
    .from('user_state')
    .update({ state })
    .eq('user_id', ownerId);

  if (upErr) {
    console.warn('[transcoder] updateVideoVariants save error:', upErr.message);
    return false;
  }
  return true;
}

// -------------------- JOB PROCESSING --------------------
async function processJob(job) {
  const { id: jobId, video_id, owner_id, original_key } = job;
  console.log('[transcoder] start job', jobId, 'video', video_id);

  await updateJob(jobId, { status: 'processing', error: null });

  const workDir = path.join(tmpdir(), `playly-transcode-${video_id}-${Date.now()}`);
  await ensureDir(workDir);

  let localOriginal = null;
  const tempFiles = [];

  try {
    // Jika original_key tidak ada, ambil contentType dari metadata video.
    let contentType = 'video/mp4';
    if (!original_key) {
      const { data } = await supabase
        .from('user_state')
        .select('state')
        .eq('user_id', owner_id)
        .maybeSingle();
      const myVideos = data?.state?.myVideos || [];
      const video = myVideos.find((v) => v && String(v.id) === String(video_id));
      contentType = video?.contentType || video?.mimeType || 'video/mp4';
    }

    const key = original_key || objectKeyForOriginal(video_id, contentType);
    contentType = original_key
      ? `video/${path.extname(original_key).replace('.', '') || 'mp4'}`
      : contentType;

    localOriginal = path.join(workDir, `original-${video_id}.${extFromContentType(contentType)}`);
    tempFiles.push(localOriginal);

    console.log('[transcoder] downloading', key);
    await downloadOriginal(key, localOriginal);

    const originalHeight = await probeHeight(localOriginal);
    if (!originalHeight) throw new Error('Tidak bisa membaca resolusi video');

    console.log('[transcoder] original height', originalHeight);

    const variants = {};
    for (const h of TARGETS) {
      if (h > originalHeight) continue;
      const outKey = objectKeyForVariant(video_id, h, contentType);
      const outPath = path.join(workDir, `${h}p-${video_id}.${extFromContentType(contentType)}`);
      tempFiles.push(outPath);

      console.log('[transcoder] encoding', h, 'p');
      await runFfmpeg(localOriginal, outPath, h);

      console.log('[transcoder] uploading', outKey);
      await uploadVariant(outPath, outKey, contentType);

      variants[`${h}p`] = publicUrl(outKey);
    }

    console.log('[transcoder] variants', variants);
    await updateJob(jobId, { status: 'done', variants, error: null });
    await updateVideoVariants(owner_id, video_id, variants);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[transcoder] job failed', jobId, msg);
    await updateJob(jobId, { status: 'failed', error: msg });
  } finally {
    for (const f of tempFiles) await safeRemove(f);
    await safeRemove(workDir);
  }
}

async function processOnePending() {
  const { data, error } = await supabase
    .from('video_transcode_jobs')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.warn('[transcoder] poll error:', error.message);
    return false;
  }
  if (!data) return false;

  await processJob(data);
  return true;
}

async function processAllPending() {
  let processed = 0;
  while (await processOnePending()) {
    processed++;
    // Safety brake: jangan terjebak infinite loop kalau ada job yang stuck.
    if (processed > 100) {
      console.warn('[transcoder] processAllPending reached safety limit');
      break;
    }
  }
  return processed;
}

// -------------------- HTTP SERVER (webhook + health) --------------------
function startHttpServer() {
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);

    // CORS minimal untuk health check / webhook.
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Transcoder-Secret');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    if (url.pathname === '/health' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, status: 'running' }));
      return;
    }

    if (url.pathname === '/process' && req.method === 'POST') {
      // Validasi secret webhook kalau di-set.
      if (WEBHOOK_SECRET) {
        const secret = req.headers['x-transcoder-secret'];
        if (secret !== WEBHOOK_SECRET) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, error: 'unauthorized' }));
          return;
        }
      }

      console.log('[transcoder] webhook /process received');
      // Webhook boleh kirim body JSON; tidak dipakai karena kita proses semua pending.
      try {
        let body = '';
        req.on('data', (chunk) => (body += chunk));
        await new Promise((resolve) => req.on('end', resolve));
        if (body) {
          const parsed = JSON.parse(body);
          console.log('[transcoder] webhook payload:', parsed);
        }
      } catch {
        // ignore invalid body
      }

      const processed = await processAllPending();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, processed }));
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: false, error: 'not_found' }));
  });

  server.listen(PORT, () => {
    console.log(`[transcoder] HTTP server listening on port ${PORT}`);
  });

  return server;
}

// -------------------- MAIN --------------------
async function main() {
  console.log('[transcoder] started');
  console.log('[transcoder] poll interval', POLL_INTERVAL_MS, 'ms');

  startHttpServer();

  // Jalankan polling sebagai backup (kalau webhook miss / sleep).
  await processAllPending();
  setInterval(() => {
    processAllPending().catch((err) => console.error('[transcoder] poll error:', err));
  }, POLL_INTERVAL_MS);
}

main().catch((err) => {
  console.error('[transcoder] fatal:', err);
  process.exit(1);
});
