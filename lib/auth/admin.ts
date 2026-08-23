// SATU titik cek "siapa admin" untuk seluruh server.
//
// Kenapa dipusatkan (2026-08-11): logika ini sebelumnya disalin di beberapa
// tempat (app/api/kv/sync, /api/admin/list-users, script.js isAllowedAdminEmail).
// Aturan izin yang tersebar = penyebab #1 lubang izin: satu tempat lupa
// diperbarui, pintunya terbuka diam-diam. Sekarang server memakai berkas ini;
// yang di klien (script.js) tetap ada karena dipakai untuk menyembunyikan menu,
// TAPI keputusan sebenarnya selalu diambil di server.
//
// Definisi admin sah = super-admin resmi ATAU (email terdaftar di
// playly-admin-allowlist DAN tidak ada di playly-admin-revoked).
// Dibaca via service_role supaya tidak bergantung pada RLS.

import type { SupabaseClient } from '@supabase/supabase-js';

// Super-admin resmi — jangkar kepercayaan untuk aksi sensitif.
export const OFFICIAL_ADMIN_EMAIL = (process.env.PLAYLY_ADMIN_EMAIL || 'admin.playly@gmail.com')
  .trim()
  .toLowerCase();

function daftarEmail(nilai: unknown): string[] {
  return Array.isArray(nilai)
    ? nilai.map((e) => String(e || '').trim().toLowerCase()).filter(Boolean)
    : [];
}

export async function isAdminEmail(admin: SupabaseClient, email: string): Promise<boolean> {
  const bersih = (email || '').trim().toLowerCase();
  if (!bersih) return false;
  if (bersih === OFFICIAL_ADMIN_EMAIL) return true;

  const { data } = await admin
    .from('kv')
    .select('key, value')
    .in('key', ['playly-admin-allowlist', 'playly-admin-revoked']);

  const allow = daftarEmail(data?.find((r) => r.key === 'playly-admin-allowlist')?.value);
  const revoked = daftarEmail(data?.find((r) => r.key === 'playly-admin-revoked')?.value);
  return allow.includes(bersih) && !revoked.includes(bersih);
}
