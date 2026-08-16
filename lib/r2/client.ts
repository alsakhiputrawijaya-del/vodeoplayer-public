// S3-compatible storage client untuk Next.js Route Handlers.
// Dukung Cloudflare R2 (legacy env R2_*) dan Supabase Storage S3-compatible
// (primary env S3_*). Supabase Storage dipilih karena tidak butuh kartu kredit
// untuk aktifasi dan terintegrasi langsung dengan project Supabase.
//
// Env vars (set di Vercel dashboard atau .env.local):
//   Primary — Supabase Storage / S3-compatible lain:
//     S3_ENDPOINT          — endpoint S3, e.g. https://ref.s3.region.supabase.co
//     S3_ACCESS_KEY_ID     — S3 access key
//     S3_SECRET_ACCESS_KEY — S3 secret key
//     S3_BUCKET            — bucket name (e.g. "videos")
//     S3_PUBLIC_URL        — public URL base, e.g.
//                            https://ref.supabase.co/storage/v1/object/public/videos
//     S3_REGION            — optional, auto-detected dari endpoint
//
//   Fallback — Cloudflare R2:
//     R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY,
//     R2_BUCKET, R2_PUBLIC_URL

import { S3Client } from '@aws-sdk/client-s3';
import { FetchHttpHandler } from '@smithy/fetch-http-handler';

export type R2Config = {
  client: S3Client;
  bucket: string;
  publicUrl: string;
};

function inferRegion(endpoint: string): string {
  // Supabase Storage endpoint lama: https://<ref>.s3.<region>.supabase.co
  const m = endpoint.match(/\.s3\.([a-z0-9-]+)\./);
  if (m) return m[1];
  if (endpoint.includes('.r2.cloudflarestorage.com')) return 'auto';
  // Endpoint baru Supabase Storage: https://<ref>.storage.supabase.co/storage/s3
  // Region tidak ada di URL → pakai env S3_REGION atau fallback auto.
  return process.env.S3_REGION?.trim() || 'auto';
}

function inferSupabasePublicUrl(bucket: string): string | null {
  const s3Endpoint = process.env.S3_ENDPOINT?.trim();
  // Endpoint baru Supabase Storage: https://<ref>.storage.supabase.co/storage/s3
  if (s3Endpoint && s3Endpoint.includes('.storage.supabase.co')) {
    const base = s3Endpoint.replace(/\/storage\/s3\/?$/i, '');
    return `${base}/storage/v1/object/public/${bucket}`;
  }
  // Endpoint lama / fallback ke project Supabase URL.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!supabaseUrl) return null;
  return `${supabaseUrl.replace(/\/+$/, '')}/storage/v1/object/public/${bucket}`;
}

export function getR2Config(): R2Config | null {
  // v549 (2026-05-26): trim() ALL env vars defensively. Copy-paste dari
  // dashboard sering menyertakan trailing \t / \n / spaces yang bikin URL
  // malformed (host includes whitespace → request gagal).
  const endpoint =
    process.env.S3_ENDPOINT?.trim() ||
    (process.env.R2_ACCOUNT_ID?.trim()
      ? `https://${process.env.R2_ACCOUNT_ID.trim()}.r2.cloudflarestorage.com`
      : '');

  const accessKeyId =
    process.env.S3_ACCESS_KEY_ID?.trim() || process.env.R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey =
    process.env.S3_SECRET_ACCESS_KEY?.trim() || process.env.R2_SECRET_ACCESS_KEY?.trim();
  const bucket = process.env.S3_BUCKET?.trim() || process.env.R2_BUCKET?.trim();

  const publicUrl =
    process.env.S3_PUBLIC_URL?.trim() ||
    inferSupabasePublicUrl(bucket || '') ||
    process.env.R2_PUBLIC_URL?.trim();

  if (!endpoint || !accessKeyId || !secretAccessKey || !bucket || !publicUrl) {
    return null;
  }

  const isSupabase = endpoint.includes('.supabase.co');

  const client = new S3Client({
    region: inferRegion(endpoint),
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    // Supabase Storage S3 API butuh path-style addressing.
    forcePathStyle: isSupabase || process.env.S3_FORCE_PATH_STYLE === 'true',
    // v548 hotfix (2026-05-26): AWS SDK v3.730+ default checksum behavior
    // ('WHEN_SUPPORTED') signs `x-amz-checksum-crc32` into presigned URLs.
    // Browser fetch() can't reproduce this header → signature mismatch →
    // browser blocks request as "Failed to fetch". WHEN_REQUIRED makes SDK
    // only add checksum when explicitly asked.
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED',
    // 29 Jul 2026: pakai fetch handler (undici) — hormat NODE_USE_ENV_PROXY.
    // Default node-http-handler konek DIRECT; mesin dev ini wajib lewat proxy
    // (127.0.0.1:8806) → semua call SDK (Put/DeleteObject) gagal network di
    // dev tanpa handler ini. Di prod (Vercel) fetch jalan direct, aman.
    requestHandler: new FetchHttpHandler(),
  });

  return {
    client,
    bucket,
    publicUrl: publicUrl.replace(/\/+$/, ''),
  };
}

// Object key format: videos/<id>.<ext>
// id: client-provided video id (timestamp or uuid)
// ext: derived dari contentType, fallback "mp4"
export function videoObjectKey(id: string, contentType?: string | null): string {
  const ext = extFromContentType(contentType);
  return `videos/${sanitizeId(id)}.${ext}`;
}

export function publicUrlFor(config: R2Config, key: string): string {
  return `${config.publicUrl}/${key}`;
}

function extFromContentType(ct?: string | null): string {
  if (!ct) return 'mp4';
  const lower = String(ct).toLowerCase();
  // 29 Jul 2026: audio (backsound editor) & image (logo watermark) juga lewat
  // jalur R2 — dulu semua non-video jatuh ke "mp4" (URL menyesatkan walau
  // content-type tersimpan benar).
  if (lower.startsWith('audio/')) {
    if (lower.includes('wav')) return 'wav';
    if (lower.includes('mpeg')) return 'mp3';
    if (lower.includes('ogg')) return 'ogg';
    if (lower.includes('mp4') || lower.includes('m4a') || lower.includes('aac')) return 'm4a';
    return 'mp3';
  }
  if (lower.startsWith('image/')) {
    if (lower.includes('png')) return 'png';
    if (lower.includes('jpeg') || lower.includes('jpg')) return 'jpg';
    if (lower.includes('webp')) return 'webp';
    if (lower.includes('gif')) return 'gif';
    if (lower.includes('svg')) return 'svg';
    return 'png';
  }
  if (lower.includes('webm')) return 'webm';
  if (lower.includes('quicktime') || lower.includes('mov')) return 'mov';
  if (lower.includes('mpeg')) return 'mpeg';
  if (lower.includes('ogg')) return 'ogg';
  return 'mp4';
}

function sanitizeId(id: string): string {
  // Defensive: strip path traversal + invalid chars. Video id biasanya
  // timestamp atau uuid jadi cuma allow alfanumerik + dash + underscore.
  return String(id).replace(/[^A-Za-z0-9_-]/g, '').slice(0, 64) || 'unknown';
}
