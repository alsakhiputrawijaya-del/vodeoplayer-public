// Verifikasi kepemilikan video untuk endpoint R2 (sign-upload / delete).
//
// Latar: key R2 = "videos/{id}.{ext}" deterministik dari id TANPA folder
// pemilik, jadi kepemilikan diverifikasi via tabel public.videos (service-role,
// bypass RLS supaya video privat orang lain juga terlihat).
//
// Kasus khusus id LEGACY (timestamp numerik, "<id>-bgm", "ve-logo-<id>"):
// kolom videos.id bertipe uuid → query .eq('id', <non-uuid>) melempar error
// Postgres 22P02 (invalid input syntax for type uuid). Itu BUKAN kegagalan
// verifikasi — id non-uuid TIDAK MUNGKIN punya baris di tabel, jadi tak ada
// kepemilikan orang lain yang bisa dilanggar → izinkan (sama seperti kasus
// "baris tidak ada"). Sebelum fix ini (2026-07-29), 22P02 dipetakan ke 500
// ownership_check_failed → SEMUA upload R2 ber-id legacy gagal total.
//
// Hasil:
//   { ok: true }                          → lanjutkan operasi
//   { ok: false, status, error, message } → balas ke client apa adanya

import type { SupabaseClient } from '@supabase/supabase-js';

export type OwnershipVerdict =
  | { ok: true }
  | { ok: false; status: number; error: string; message?: string };

export async function verifyVideoOwnership(
  admin: SupabaseClient,
  vidId: string,
  authUserId: string,
): Promise<OwnershipVerdict> {
  const { data: existing, error: vErr } = await admin
    .from('videos')
    .select('owner_id')
    .eq('id', vidId)
    .maybeSingle();
  if (vErr) {
    // 22P02 = id bukan uuid valid → pasti bukan id dari tabel (legacy id) →
    // perlakukan seperti "baris tidak ada" (izinkan; tak ada pemilik lain).
    if (vErr.code === '22P02') return { ok: true };
    return { ok: false, status: 500, error: 'ownership_check_failed', message: vErr.message };
  }
  if (existing && existing.owner_id !== authUserId) {
    return { ok: false, status: 403, error: 'forbidden_not_owner' };
  }
  return { ok: true };
}
