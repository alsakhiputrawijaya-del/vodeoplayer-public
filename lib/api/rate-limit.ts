// Pembatas laju (rate limit) untuk API PUBLIK.
//
// DUA lapis, dipilih otomatis:
//  1. TERDISTRIBUSI (Upstash Redis REST) — AKTIF bila env UPSTASH_REDIS_REST_URL
//     + UPSTASH_REDIS_REST_TOKEN diset. Hitungan dibagi antar SEMUA instance
//     serverless (Vercel) → penyerang tak bisa lolos dengan memutar antar-instance.
//  2. IN-MEMORY per-instance (fallback) — dipakai bila Upstash belum diset ATAU
//     panggilan Upstash gagal/timeout. Cukup untuk meredam burst/abuse ringan.
//
// Sengaja fail-OPEN (kalau ragu, izinkan): ini melindungi endpoint READ data yang
// SUDAH publik, bukan aksi sensitif — memblokir pengunjung sah lebih merugikan
// daripada risikonya. Karena itu error Upstash → fallback in-memory, bukan tolak.
//
// CARA AKTIFKAN (owner): buat database gratis di upstash.com (Redis) → salin
// "REST URL" + "REST TOKEN" → set 2 env var itu di Vercel → redeploy. Tanpa itu,
// perilaku = seperti sebelumnya (in-memory), tak ada yang rusak.

type Bucket = number[]; // daftar timestamp (ms) permintaan dalam window
const store = new Map<string, Bucket>();
const MAX_KEYS = 5000; // batas entri map (cegah memory bloat)

export type RateResult = { ok: boolean; retryAfter: number };

// ---- Lapis 2: in-memory sliding window (fallback + dipakai bila Upstash off) ----
export function rateLimit(key: string, max = 100, windowMs = 60_000): RateResult {
  const now = Date.now();
  const arr = (store.get(key) || []).filter((t) => now - t < windowMs);
  if (arr.length >= max) {
    store.set(key, arr);
    const retryAfter = Math.max(1, Math.ceil((windowMs - (now - arr[0])) / 1000));
    return { ok: false, retryAfter };
  }
  arr.push(now);
  store.set(key, arr);
  // Bersihkan entri kedaluwarsa sesekali agar map tak membengkak.
  if (store.size > MAX_KEYS) {
    for (const [k, v] of store) {
      if (v.every((t) => now - t >= windowMs)) store.delete(k);
    }
  }
  return { ok: true, retryAfter: 0 };
}

// ---- Lapis 1: Upstash Redis (fixed-window counter, atomik lewat pipeline) ----
const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL || '';
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || '';
const UPSTASH_TIMEOUT_MS = 800; // jangan bikin respons publik lambat kalau Redis ngadat

function upstashEnabled(): boolean {
  return !!(UPSTASH_URL && UPSTASH_TOKEN);
}

// Fixed-window: kunci di-bucket per potongan waktu (windowMs). Trade-off jujur vs
// sliding-window: di batas bucket bisa lolos hingga ~2x max sesaat — masih memadai
// untuk anti-abuse endpoint publik, dan atomik + murah di Redis (INCR + PEXPIRE).
async function upstashLimit(key: string, max: number, windowMs: number): Promise<RateResult> {
  const now = Date.now();
  const bucket = Math.floor(now / windowMs);
  const winKey = `plyk:rl:${key}:${bucket}`;
  const nextBucketAt = (bucket + 1) * windowMs;
  const retryAfter = Math.max(1, Math.ceil((nextBucketAt - now) / 1000));

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), UPSTASH_TIMEOUT_MS);
  try {
    // Pipeline atomik: INCR counter bucket, lalu set masa-hidup bucket (auto-bersih).
    const res = await fetch(`${UPSTASH_URL}/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${UPSTASH_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        ['INCR', winKey],
        ['PEXPIRE', winKey, String(windowMs)],
      ]),
      signal: ctrl.signal,
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`upstash http ${res.status}`);
    const data = (await res.json()) as Array<{ result?: number; error?: string }>;
    const count = Number(data?.[0]?.result);
    if (!Number.isFinite(count)) throw new Error('upstash bad result');
    return count > max ? { ok: false, retryAfter } : { ok: true, retryAfter: 0 };
  } finally {
    clearTimeout(timer);
  }
}

// API utama yang dipakai route: async. Pilih Upstash bila tersedia; error/timeout
// → fallback in-memory (tetap ada proteksi per-instance, tak pernah menolak karena
// infra ngadat).
export async function rateLimitAsync(key: string, max = 100, windowMs = 60_000): Promise<RateResult> {
  if (upstashEnabled()) {
    try {
      return await upstashLimit(key, max, windowMs);
    } catch {
      // Redis down/timeout → jangan gagalkan request; pakai fallback lokal.
      return rateLimit(key, max, windowMs);
    }
  }
  return rateLimit(key, max, windowMs);
}

// IP klien dari header proxy (Vercel set x-forwarded-for). CATATAN: header ini bisa
// DIPALSUKAN klien (owasp) — untuk rate-limit ringan boleh, JANGAN dipakai untuk
// keputusan keamanan penting.
export function clientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for') || '';
  const first = xff.split(',')[0].trim();
  return first || req.headers.get('x-real-ip') || 'unknown';
}
