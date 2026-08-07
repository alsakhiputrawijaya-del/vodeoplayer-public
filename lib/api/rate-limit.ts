// Pembatas laju (rate limit) sederhana untuk API PUBLIK — sliding window in-memory.
//
// JUJUR SOAL BATAS (rak owasp / rate-limiting): ini lapisan PERTAMA yang murah &
// tanpa infra tambahan. Ia menghitung per-INSTANCE serverless (Vercel), jadi TIDAK
// terdistribusi: penyerang canggih bisa memutar antar-instance dan hitungan tak
// terbagi. Cukup untuk meredam burst / abuse ringan / bug klien yang membombardir.
// Untuk proteksi kuat (per-identitas, atomik, terbagi) → shared store seperti
// Upstash Redis / Postgres — follow-up saat trafik nyata menuntut. Sengaja fail-OPEN
// (kalau ragu, izinkan) karena ini melindungi endpoint READ data yang sudah publik,
// bukan aksi sensitif — memblokir pengunjung sah lebih merugikan daripada risikonya.

type Bucket = number[]; // daftar timestamp (ms) permintaan dalam window
const store = new Map<string, Bucket>();
const MAX_KEYS = 5000; // batas entri map (cegah memory bloat)

export function rateLimit(
  key: string,
  max = 100,
  windowMs = 60_000,
): { ok: boolean; retryAfter: number } {
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

// IP klien dari header proxy (Vercel set x-forwarded-for). CATATAN: header ini bisa
// DIPALSUKAN klien (owasp) — untuk rate-limit ringan boleh, JANGAN dipakai untuk
// keputusan keamanan penting.
export function clientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for') || '';
  const first = xff.split(',')[0].trim();
  return first || req.headers.get('x-real-ip') || 'unknown';
}
