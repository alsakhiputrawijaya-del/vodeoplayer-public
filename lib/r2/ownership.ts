// Verifikasi kepemilikan video untuk endpoint R2 (sign-upload / put-object / delete).
//
// Latar: key R2 = "videos/{id}.{ext}" deterministik dari id TANPA folder pemilik,
// jadi kepemilikan HARUS diverifikasi lewat tabel (tak bisa disimpulkan dari path).
//
// 🚨 KENAPA DITULIS ULANG (2026-08-11) — pagar lama TIDAK MENGGIGIT sama sekali:
// pagar itu bertanya ke tabel public.videos, tapi (a) kolom videos.id bertipe
// uuid sedangkan id video nyata di aplikasi ini angka timestamp ("1786412216311")
// → query melempar 22P02 → dulu langsung `return ok: true`, dan (b) tabel videos
// TAK PERNAH DIISI siapa pun (0 baris; tak ada satu pun kode yang menulis ke
// sana). Akibatnya jawaban "video ini milikmu?" selalu YA untuk semua video →
// siapa pun yang punya akun dan tahu id video (id terpampang di tautan /watch
// publik) bisa MENGHAPUS atau MENIMPA file video milik orang lain.
//
// Sekarang kepemilikan dicatat di tabel khusus public.video_owners
// (video_id text PRIMARY KEY → owner_id), yang:
//   - diisi saat upload (claimVideoOwnership dari sign-upload / put-object),
//   - sudah di-backfill dari state tiap user lewat migration 0023,
//   - id-nya bertipe TEXT → cocok dengan id timestamp maupun "<id>-bgm".
//
// Sikap saat ragu: kalau id BELUM tercatat pemiliknya, operasi diizinkan
// (idempoten — file lama/asing yang tak ada pemiliknya tak melanggar hak siapa
// pun). Yang ditutup rapat = id yang SUDAH jelas milik orang lain.
//
// Hasil:
//   { ok: true }                          → lanjutkan operasi
//   { ok: false, status, error, message } → balas ke client apa adanya

import type { SupabaseClient } from '@supabase/supabase-js';
import { isAdminEmail } from '@/lib/auth/admin';

export type OwnershipVerdict =
  | { ok: true }
  | { ok: false; status: number; error: string; message?: string };

// Tabel belum ada (migration 0023 belum dijalankan) → JANGAN matikan produksi.
// Kembali ke perilaku lama (izinkan) + catat peringatan, supaya deploy kode
// mendahului migration tidak membuat upload/hapus gagal total.
function tabelBelumAda(code?: string): boolean {
  return code === '42P01' || code === 'PGRST205';
}

// Berkas turunan memakai id berimbuhan: "<id>-bgm" (backsound), "<id>-logo"
// (logo watermark), "<id>_720p" (hasil transcode — diunggah worker LANGSUNG ke
// R2 pakai kredensial sendiri, jadi tak pernah lewat API dan tak punya catatan
// pemilik). Semuanya ikut pemilik video induknya; tanpa normalisasi ini, berkas
// turunan tetap bisa dihapus siapa pun walau induknya sudah terlindungi.
function idInduk(vidId: string): string {
  return vidId.replace(/-(bgm|logo)$/, '').replace(/_(360|480|720|1080)p$/, '');
}

// authUserEmail dipakai HANYA untuk pengecualian admin (moderasi/takedown &
// hapus akun beserta videonya) — tanpa itu, admin yang menghapus video
// pelanggaran akan ditolak 403 dan berkasnya tertinggal di R2 selamanya.
export async function verifyVideoOwnership(
  admin: SupabaseClient,
  vidId: string,
  authUserId: string,
  authUserEmail?: string | null,
): Promise<OwnershipVerdict> {
  // Cari catatan untuk id itu sendiri ATAU id induknya (berkas turunan).
  const kandidat = [vidId];
  const induk = idInduk(vidId);
  if (induk !== vidId) kandidat.push(induk);

  const { data: baris, error: oErr } = await admin
    .from('video_owners')
    .select('owner_id')
    .in('video_id', kandidat);
  const pemilik = baris?.[0];

  if (oErr) {
    if (tabelBelumAda(oErr.code)) {
      console.warn('[ownership] tabel video_owners belum ada — migration 0023 belum dijalankan; cek kepemilikan dilewati.');
      return { ok: true };
    }
    return { ok: false, status: 500, error: 'ownership_check_failed', message: oErr.message };
  }
  if (pemilik && pemilik.owner_id !== authUserId) {
    // Admin boleh menyentuh berkas milik user lain — itu memang tugas moderasi.
    // Dicek BELAKANGAN (bukan di awal) supaya jalur user biasa tak membayar
    // satu query tambahan ke tabel kv untuk tiap permintaan.
    if (await isAdminEmail(admin, authUserEmail || '')) return { ok: true };
    return { ok: false, status: 403, error: 'forbidden_not_owner' };
  }
  return { ok: true };
}

// Catat "id ini milik siapa" saat upload. Dipanggil SESUDAH verify lolos.
// on conflict do nothing → pemilik pertama tetap pemilik; percobaan klaim ulang
// oleh orang lain tak mengubah apa pun (dan sudah ditolak verify di atas).
// Gagal mencatat TIDAK menggagalkan upload — kehilangan catatan kepemilikan
// lebih ringan daripada upload user gagal; barisnya bisa dilengkapi backfill.
export async function claimVideoOwnership(
  admin: SupabaseClient,
  vidId: string,
  authUserId: string,
): Promise<void> {
  // Dicatat di bawah id INDUK supaya satu baris melindungi video beserta semua
  // turunannya (bgm/logo/hasil transcode) — tak perlu baris per-turunan.
  const { error } = await admin
    .from('video_owners')
    .upsert({ video_id: idInduk(vidId), owner_id: authUserId }, { onConflict: 'video_id', ignoreDuplicates: true });
  if (error && !tabelBelumAda(error.code)) {
    console.warn('[ownership] gagal mencatat pemilik', vidId, error.message);
  }
}
