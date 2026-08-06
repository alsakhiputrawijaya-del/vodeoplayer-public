// Playly subtitle translator — Next.js Route Handler (Node runtime).
// Kontrak (TETAP, dipakai pemutar + form upload/edit):
//   Request:  POST /api/translate-subtitle
//   Body:     { cues: [{start, end, text}], targetLang: "ID", sourceLang?: "EN" }
//   Response sukses: { cues: [{start, end, text}], provider, ... }
//   Response gagal:  { error: "<kode>" } + status HTTP yang benar (401/400/413/502)
//
// HYBRID penyedia terjemahan (2026-08-01):
//   - env DEEPL_API_KEY ADA  → DeepL (kualitas terbaik, berbayar).
//   - TIDAK ada              → MyMemory (GRATIS, tanpa kartu/key).
//   Jalan gratis out-of-the-box; begitu owner memasang DEEPL_API_KEY, OTOMATIS naik
//   ke DeepL tanpa ubah kode. MYMEMORY_EMAIL (opsional, tanpa kartu) menaikkan kuota
//   MyMemory dari ~1rb → ~50rb kata/hari.

import { createClient } from '@/lib/supabase/server';

// v-sec 2026-07-07: runtime nodejs (bukan edge) — createClient (cookie auth) tak
// andal di edge. Endpoint cuma memproksi penerjemah, tak butuh edge.

type Cue = { start: number; end: number; text: string };

const MAX_CUES = 2000;
const MAX_CHARS_TOTAL = 100_000;
const DEEPL_BATCH_SIZE = 50;
const MM_CONCURRENCY = 5;   // MyMemory tak batch → paralel kecil: cepat tapi sopan
const MM_MAX_CHARS = 500;   // batas panjang per-permintaan MyMemory

function json(obj: unknown, status = 200): Response {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
}

export async function POST(req: Request): Promise<Response> {
  // ANTI-ABUSE: WAJIB login. DeepL berbayar; MyMemory pun punya kuota harian per-IP
  // (server kita) → cegah publik membanjiri panggilan lewat endpoint kita.
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.id) return json({ error: 'not_authenticated' }, 401);
  } catch {
    return json({ error: 'auth_unavailable' }, 503);
  }

  let body: { cues?: Cue[]; targetLang?: string; sourceLang?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'bad_json' }, 400);
  }

  const { cues, targetLang, sourceLang } = body || {};
  if (!Array.isArray(cues) || cues.length === 0) return json({ error: 'no_cues' }, 400);
  if (cues.length > MAX_CUES) return json({ error: 'too_many_cues', max: MAX_CUES }, 413);
  if (!targetLang || typeof targetLang !== 'string') return json({ error: 'no_target_lang' }, 400);

  const totalChars = cues.reduce((n, c) => n + (c.text?.length || 0), 0);
  if (totalChars > MAX_CHARS_TOTAL) return json({ error: 'too_many_chars', max: MAX_CHARS_TOTAL }, 413);

  // HYBRID + tahan-gagal: coba DeepL kalau key ada; kalau GAGAL apa pun sebabnya
  // (key kadaluarsa/invalid/kuota/jaringan) → JATUH ke MyMemory gratis, jangan buntu.
  // Kalau key tak ada → langsung MyMemory. Jadi terjemahan selalu punya jalan.
  const deeplKey = process.env.DEEPL_API_KEY;
  if (deeplKey) {
    const r = await translateWithDeepL(cues, targetLang, sourceLang, deeplKey);
    if (r.ok) return r; // DeepL sukses (200)
    // DeepL gagal → lanjut ke MyMemory di bawah (cadangan gratis).
  }
  return translateWithMyMemory(cues, targetLang, sourceLang);
}

// ---------------- DeepL (dipakai kalau DEEPL_API_KEY ada) ----------------
async function translateWithDeepL(
  cues: Cue[],
  targetLang: string,
  sourceLang: string | undefined,
  key: string,
): Promise<Response> {
  const endpoint = key.endsWith(':fx')
    ? 'https://api-free.deepl.com/v2/translate'
    : 'https://api.deepl.com/v2/translate';

  const translated: Cue[] = [];
  let detectedSourceLanguage: string | null = null;

  for (let i = 0; i < cues.length; i += DEEPL_BATCH_SIZE) {
    const batch = cues.slice(i, i + DEEPL_BATCH_SIZE);
    const params = new URLSearchParams();
    batch.forEach((c) => params.append('text', c.text || ''));
    params.append('target_lang', targetLang.toUpperCase());
    if (sourceLang && sourceLang.toLowerCase() !== 'auto') {
      params.append('source_lang', sourceLang.toUpperCase());
    }
    params.append('split_sentences', '0');
    params.append('preserve_formatting', '1');

    let resp: Response;
    try {
      resp = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `DeepL-Auth-Key ${key}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
      });
    } catch (e) {
      return json({ error: 'network', detail: String(e).slice(0, 200) }, 502);
    }

    if (!resp.ok) {
      const detail = await resp.text().catch(() => '');
      return json({ error: 'deepl_failed', status: resp.status, detail: detail.slice(0, 300) }, 502);
    }

    const data = (await resp.json()) as {
      translations?: { text: string; detected_source_language?: string }[];
    };
    (data.translations || []).forEach((t, idx) => {
      const src = cues[i + idx];
      translated.push({ start: src.start, end: src.end, text: t.text });
      if (!detectedSourceLanguage) detectedSourceLanguage = t.detected_source_language || null;
    });
  }

  return json({
    cues: translated,
    provider: 'deepl',
    detectedSourceLanguage,
    targetLanguage: targetLang.toUpperCase(),
    cueCount: translated.length,
  });
}

// ---------------- MyMemory (GRATIS, default kalau DeepL tak ada) ----------------
// Peta kode → RFC3066/ISO MyMemory. Yang tak terdaftar → lowercase apa adanya.
const MM_LANG: Record<string, string> = {
  ID: 'id', EN: 'en', JA: 'ja', KO: 'ko', ZH: 'zh-CN', AR: 'ar', ES: 'es', FR: 'fr',
  DE: 'de', PT: 'pt', RU: 'ru', IT: 'it', NL: 'nl', PL: 'pl', TR: 'tr', UK: 'uk',
  BG: 'bg', CS: 'cs', DA: 'da', EL: 'el', ET: 'et', FI: 'fi', HU: 'hu', LT: 'lt',
  LV: 'lv', NB: 'nb', RO: 'ro', SK: 'sk', SL: 'sl', SV: 'sv',
};
function toMM(code: string | undefined, fallback: string): string {
  if (!code) return fallback;
  const up = code.toUpperCase();
  return MM_LANG[up] || code.toLowerCase();
}

async function translateWithMyMemory(
  cues: Cue[],
  targetLang: string,
  sourceLang: string | undefined,
): Promise<Response> {
  const mmTarget = toMM(targetLang, 'en');
  // MyMemory butuh source di langpair (tak ada auto-detect andal). Default "en"
  // kalau tak dikirim — mayoritas subtitle punya subtitleLang, jadi jarang kena.
  const mmSource = toMM(sourceLang, 'en');
  const email = process.env.MYMEMORY_EMAIL; // opsional: naikkan kuota (tanpa kartu)

  // Sumber = target → tak perlu terjemah (hemat kuota).
  if (mmSource.toLowerCase() === mmTarget.toLowerCase()) {
    return json({ cues, provider: 'mymemory', note: 'same_lang', cueCount: cues.length });
  }

  const out: Cue[] = new Array(cues.length);
  let success = 0;   // berapa cue benar-benar diterjemah
  let quotaHit = false;

  // Terjemah 1 cue. Gagal → kembalikan teks ASLI (jangan blank), TANDAI belum sukses
  // (bukan menyembunyikan kegagalan: successCount dipakai di bawah utk lapor jujur).
  async function translateOne(cue: Cue, idx: number): Promise<void> {
    const text = cue.text || '';
    out[idx] = cue; // default: asli
    if (!text.trim()) { success++; return; } // baris kosong dianggap "beres"
    const url =
      'https://api.mymemory.translated.net/get?q=' +
      encodeURIComponent(text.slice(0, MM_MAX_CHARS)) +
      '&langpair=' + encodeURIComponent(mmSource + '|' + mmTarget) +
      (email ? '&de=' + encodeURIComponent(email) : '');
    let resp: Response;
    try {
      resp = await fetch(url, { headers: { 'User-Agent': 'Playly/1.0 (subtitle)' } });
    } catch {
      return; // jaringan gagal → biarkan asli (tak sukses)
    }
    const data = (await resp.json().catch(() => ({}))) as {
      responseStatus?: number | string;
      responseData?: { translatedText?: string };
      responseDetails?: string;
    };
    const t = data?.responseData?.translatedText || '';
    const status = Number(data?.responseStatus);
    // MyMemory menaruh peringatan kuota DI DALAM translatedText → deteksi & jatuhkan.
    const looksWarning =
      /MYMEMORY WARNING|QUOTA|USED ALL|LIMIT/i.test(t) ||
      /QUOTA|LIMIT/i.test(data?.responseDetails || '');
    if (!resp.ok || status !== 200 || !t || looksWarning) {
      if (looksWarning) quotaHit = true;
      return; // asli (tak sukses)
    }
    out[idx] = { start: cue.start, end: cue.end, text: t };
    success++;
  }

  // Paralel kecil (MM_CONCURRENCY) biar cepat tapi tak membanjiri MyMemory.
  // Trade-off jujur (§3.2): MyMemory tak punya batch → 1 request/cue, subtitle
  // sangat panjang bisa lambat. Cukup untuk subtitle umum; upgrade = DEEPL_API_KEY.
  for (let i = 0; i < cues.length; i += MM_CONCURRENCY) {
    if (quotaHit) { // kuota habis → hentikan (sisa sudah ter-set asli di out via default)
      for (let j = i; j < cues.length; j++) if (out[j] === undefined) out[j] = cues[j];
      break;
    }
    const slice = cues.slice(i, i + MM_CONCURRENCY);
    await Promise.all(slice.map((c, k) => translateOne(c, i + k)));
  }

  // Lapor JUJUR: kalau tak ada satu pun cue berhasil diterjemah → balas ERROR
  // (bukan 200 "translated" berisi teks asli — itu menyesatkan). Klien lalu jatuh
  // ke fallback "tampil subtitle asli".
  if (success === 0) return json({ error: quotaHit ? 'quota_exceeded' : 'translate_failed' }, 502);

  return json({
    cues: out,
    provider: 'mymemory',
    quotaExceeded: quotaHit || undefined,
    translatedCount: success,
    cueCount: out.length,
  });
}

export function GET(): Response {
  return json({ error: 'method_not_allowed' }, 405);
}
