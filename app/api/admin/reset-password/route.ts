// Admin reset-password endpoint — super-admin set password user LANGSUNG (tanpa email).
//
// KENAPA ADA: aplikasi membolehkan daftar pakai email bebas/fiktif ("Confirm email"
// OFF), jadi pemulihan password lewat email TIDAK pernah bisa. Maka admin butuh cara
// mengatur ulang password user langsung. Endpoint ini pakai Supabase Auth Admin API
// (service-role) `updateUserById` untuk mengganti password di auth.users.
//
// Setelah reset, user bisa login lintas-perangkat dgn password baru: login flow
// memverifikasi via Supabase Auth (verifyStrict) → cocok → masuk (hash lokal lama di
// device user otomatis "heal" saat login berhasil).
//
// KEAMANAN (default-deny): pemanggil WAJIB punya sesi Supabase valid + email =
// super-admin resmi (env PLAYLY_ADMIN_EMAIL, default admin.playly@gmail.com).

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { jsonError, jsonOk } from '@/lib/api/responses';
import type { SupabaseClient } from '@supabase/supabase-js';

const OFFICIAL_ADMIN_EMAIL = (process.env.PLAYLY_ADMIN_EMAIL || 'admin.playly@gmail.com')
  .trim()
  .toLowerCase();

type Body = { email?: string; newPassword?: string };

// Cari auth.users id berdasarkan email: coba tabel profiles (terindeks) dulu,
// fallback scan admin.listUsers (maks ~500 user) kalau profile tak ada.
async function findAuthUidByEmail(admin: SupabaseClient, email: string): Promise<string | null> {
  try {
    const { data } = await admin.from('profiles').select('id').eq('email', email).maybeSingle();
    if (data?.id) return data.id as string;
  } catch {
    /* profiles mungkin belum ada → lanjut fallback */
  }
  for (let page = 1; page <= 5; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 100 });
    if (error || !data?.users?.length) break;
    const found = data.users.find((u) => (u.email || '').toLowerCase() === email);
    if (found) return found.id;
    if (data.users.length < 100) break;
  }
  return null;
}

export async function POST(req: Request) {
  const admin = createAdminClient();
  if (!admin) {
    return jsonError('service_unavailable', 503, {
      message: 'SUPABASE_SERVICE_ROLE_KEY belum di-set di server.',
    });
  }

  // 1. Pemanggil harus login + super-admin resmi (default-deny).
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
    return jsonError('forbidden', 403, { message: 'Hanya super-admin yang boleh reset password.' });
  }

  // 2. Validasi input.
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return jsonError('bad_json', 400);
  }
  const email = (body.email || '').trim().toLowerCase();
  const newPassword = body.newPassword || '';
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return jsonError('invalid_email', 400);
  if (newPassword.length < 6) return jsonError('weak_password', 400);

  // 3. Cari user di Supabase Auth + set password baru.
  const uid = await findAuthUidByEmail(admin, email);
  if (!uid) {
    return jsonError('user_not_found', 404, {
      message: 'Akun tidak ditemukan di Supabase Auth.',
    });
  }

  const { error } = await admin.auth.admin.updateUserById(uid, { password: newPassword });
  if (error) {
    return jsonError('reset_failed', 500, { message: error.message });
  }

  return jsonOk({ reset: true });
}
