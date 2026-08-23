// Cocokkan catatan `variants` di state dengan berkas yang BENAR-BENAR ada di storage.
//
// KENAPA PERLU: catatan variant dan berkas nyatanya bisa berbeda jauh. Variant
// yang dibangun di browser diunggah lebih dulu, baru dilaporkan ke server —
// kalau laporan itu gagal (mis. service role belum di-set), berkasnya ada tapi
// tak tercatat, dan menu Kualitas MENYEMBUNYIKAN resolusi yang sudah jadi.
// Sebaliknya, entri "blob:" sisa sesi lama menunjuk alamat yang mati begitu tab
// ditutup. Storage adalah kebenaran; state cuma catatan. Route ini menyamakan
// catatan dengan kebenaran itu.
//
// POST (perintah, bukan pertanyaan — memang menulis state):
//   { videoId? }  -> tanpa videoId: seluruh video milik user
//   200 { diperiksa, diperbaiki, rincian: [{ id, ditambahkan[], dibuang[], videoUrl? }] }
//
// 401 not_authenticated · 503 service_unavailable (service role belum di-set)

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { jsonError, jsonOk } from '@/lib/api/responses';
import { VIDEO_BUCKET } from '@/lib/storage/paths';

type Rincian = {
  id: string;
  ditambahkan: string[];
  dibuang: string[];
  videoUrl?: string;
  // Hasil akhir ikut dikirim supaya klien bisa menerapkannya ke state lokalnya
  // sendiri — tanpa ini perbaikan baru terlihat setelah sinkronisasi turun.
  variants: Record<string, string>;
};

// "1787_720p.mp4" -> { id: "1787", rung: "720p" } · "1787.mp4" -> { id: "1787" }
function uraiNama(nama: string): { id: string; rung?: string } | null {
  const m = nama.match(/^(.+?)(?:_(\d{3,4})p)?\.[a-z0-9]+$/i);
  if (!m) return null;
  return { id: m[1], rung: m[2] ? m[2] + 'p' : undefined };
}

export async function POST(req: Request) {
  const admin = createAdminClient();
  if (!admin) return jsonError('service_unavailable', 503);

  let userId: string | null = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    userId = data.user?.id || null;
  } catch {
    return jsonError('auth_unavailable', 503);
  }
  if (!userId) return jsonError('not_authenticated', 401);

  let hanyaId: string | null = null;
  try {
    const body = await req.json();
    hanyaId = body?.videoId != null ? String(body.videoId) : null;
  } catch {
    // Badan kosong = periksa semua. Bukan error.
  }

  // Hanya folder milik user sendiri yang disisir, jadi berkas akun lain tak
  // pernah terjangkau walau id-nya ditebak.
  const { data: berkas, error: eList } = await admin.storage
    .from(VIDEO_BUCKET)
    .list(userId, { limit: 1000 });
  if (eList) return jsonError('list_failed', 500, { message: eList.message });

  // id -> { rung -> url } dan id -> url berkas asli
  const perId = new Map<string, Map<string, string>>();
  const asli = new Map<string, string>();
  for (const f of berkas || []) {
    const urai = uraiNama(f.name);
    if (!urai) continue;
    const { data: pub } = admin.storage.from(VIDEO_BUCKET).getPublicUrl(`${userId}/${f.name}`);
    const url = pub?.publicUrl;
    if (!url) continue;
    if (urai.rung) {
      if (!perId.has(urai.id)) perId.set(urai.id, new Map());
      perId.get(urai.id)!.set(urai.rung, url);
    } else {
      asli.set(urai.id, url);
    }
  }

  const { data: baris, error: eState } = await admin
    .from('user_state')
    .select('state')
    .eq('user_id', userId)
    .maybeSingle();
  if (eState || !baris?.state) return jsonError('state_not_found', 404);

  const state = baris.state;
  const daftar: any[] = Array.isArray(state.myVideos) ? state.myVideos : [];
  const rincian: Rincian[] = [];
  let berubah = false;

  for (const v of daftar) {
    if (!v || v.id == null) continue;
    const id = String(v.id);
    if (hanyaId && id !== hanyaId) continue;

    const lama: Record<string, string> = { ...(v.variants || {}) };
    const baru: Record<string, string> = {};
    const dibuang: string[] = [];

    // Entri "blob:" hanya hidup selama tab sesi pembuatnya — di sesi lain ia
    // menunjuk alamat mati, dan membuat menu Kualitas menawarkan yang tak ada.
    for (const [rung, url] of Object.entries(lama)) {
      if (String(url).startsWith('blob:')) dibuang.push(rung);
      else baru[rung] = String(url);
    }

    const ditambahkan: string[] = [];
    for (const [rung, url] of (perId.get(id) || new Map()).entries()) {
      if (baru[rung] !== url) {
        if (!baru[rung]) ditambahkan.push(rung);
        baru[rung] = url;
      }
    }

    let urlBaru: string | undefined;
    const urlSekarang = String(v.videoUrl || '');
    const urlAsli = asli.get(id);
    // Berkas aslinya ada di storage tapi state masih menunjuk blob: — itu sisa
    // dari upload yang dulu gagal separuh jalan. Rapikan supaya penonton lain
    // dan worker transcoder bisa mencapainya.
    if (urlAsli && (!urlSekarang || urlSekarang.startsWith('blob:'))) {
      v.videoUrl = urlAsli;
      urlBaru = urlAsli;
    }

    const beda =
      ditambahkan.length > 0 ||
      dibuang.length > 0 ||
      urlBaru !== undefined ||
      Object.keys(baru).length !== Object.keys(lama).length;
    if (beda) {
      v.variants = baru;
      berubah = true;
      rincian.push({ id, ditambahkan, dibuang, variants: baru, ...(urlBaru ? { videoUrl: urlBaru } : {}) });
    }
  }

  if (berubah) {
    const { error } = await admin.from('user_state').update({ state }).eq('user_id', userId);
    if (error) return jsonError('save_failed', 500, { message: error.message });
  }

  return jsonOk({
    diperiksa: hanyaId ? 1 : daftar.length,
    diperbaiki: rincian.length,
    rincian,
  });
}
