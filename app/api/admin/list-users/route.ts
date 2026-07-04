// Admin list-users endpoint — daftar user dari Supabase (tabel profiles).
//
// KENAPA ADA: dashboard admin sebelumnya membangun daftar user HANYA dari
// localStorage perangkat admin itu sendiri (fungsi getAllAccounts di
// script.js). Akibatnya user yang DAFTAR SENDIRI dari perangkat lain masuk ke
// Supabase tapi TIDAK muncul di panel admin. Endpoint ini menarik daftar user
// dari gudang pusat (public.profiles) supaya panel admin menampilkan SEMUA
// user, dari perangkat mana pun.
//
// KEAMANAN (default-deny): pemanggil WAJIB punya sesi Supabase valid + email =
// super-admin resmi (env PLAYLY_ADMIN_EMAIL, default admin.playly@gmail.com).
// Hanya kolom AMAN yang dikembalikan — TIDAK ADA password / PIN / hash (kolom
// itu memang tak ada di tabel profiles; auth.users tidak disentuh di sini).

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { jsonError, jsonOk } from '@/lib/api/responses';

const OFFICIAL_ADMIN_EMAIL = (process.env.PLAYLY_ADMIN_EMAIL || 'admin.playly@gmail.com')
  .trim()
  .toLowerCase();

// Batas aman: tarik maksimal 2000 user terbaru (cukup untuk skala saat ini,
// cegah payload raksasa). Bisa dinaikkan / dipaginasi nanti kalau perlu.
const MAX_USERS = 2000;

export async function GET() {
  const admin = createAdminClient();
  if (!admin) {
    return jsonError('service_unavailable', 503, {
      message: 'SUPABASE_SERVICE_ROLE_KEY belum di-set di server.',
    });
  }

  // 1. Pemanggil harus login + admin platform (default-deny).
  //    v2 (2026-07-04): dulu HANYA super-admin — akibatnya panel "Manajemen Akun"
  //    milik ADMIN TAMBAHAN (mis. kangdedi1) ditolak 403 diam-diam → daftar user
  //    di perangkatnya cuma menampilkan akun lokal (owner komplain "user cuma 1").
  //    Kini admin tambahan yang SAH (ada di daftar-admin kv `playly-admin-allowlist`
  //    + TIDAK ada di daftar-tercabut `playly-admin-revoked`) juga boleh.
  //    KENAPA AMAN untuk endpoint INI saja: data yang dikembalikan (profiles kolom
  //    publik) memang sudah bisa dibaca anon langsung dari Supabase (RLS public
  //    read) — tak ada eksposur baru. Endpoint MUTASI (create-user, reset-password)
  //    SENGAJA tetap super-admin-only: kv adalah data yang bisa ditulis klien,
  //    jadi TIDAK layak dijadikan jangkar kepercayaan untuk aksi tulis/sensitif.
  let callerEmail: string | null = null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    callerEmail = user?.email?.trim().toLowerCase() || null;
  } catch {
    return jsonError('auth_unavailable', 503);
  }
  if (!callerEmail) return jsonError('not_authenticated', 401);
  if (callerEmail !== OFFICIAL_ADMIN_EMAIL) {
    const norm = (v: unknown): string[] =>
      Array.isArray(v) ? v.map((e) => String(e || '').trim().toLowerCase()).filter(Boolean) : [];
    let isExtraAdmin = false;
    try {
      const { data: rows } = await admin
        .from('kv')
        .select('key, value')
        .in('key', ['playly-admin-allowlist', 'playly-admin-revoked']);
      const allow = norm(rows?.find((r) => r.key === 'playly-admin-allowlist')?.value);
      const revoked = norm(rows?.find((r) => r.key === 'playly-admin-revoked')?.value);
      isExtraAdmin = allow.includes(callerEmail) && !revoked.includes(callerEmail);
    } catch {
      /* kv tak terbaca → tetap ditolak di bawah (default-deny) */
    }
    if (!isExtraAdmin) {
      return jsonError('forbidden', 403, { message: 'Hanya admin yang boleh melihat daftar user.' });
    }
  }

  // 2. Tarik daftar user dari profiles — HANYA kolom aman (tanpa rahasia).
  const { data, error } = await admin
    .from('profiles')
    .select('email, username, name, bio, avatar_url, tier, joined_at, created_at')
    .order('created_at', { ascending: false })
    .limit(MAX_USERS);

  if (error) {
    return jsonError('list_failed', 500, { message: error.message });
  }

  return jsonOk({ users: data || [], count: (data || []).length });
}
