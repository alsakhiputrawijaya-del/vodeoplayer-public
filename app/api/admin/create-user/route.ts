// Admin create-user endpoint — daftarkan akun buatan admin ke Supabase Auth.
//
// MASALAH yang diperbaiki (2026-07-03): alur "buat akun" di admin panel
// (public/legacy/script.js `createUser`) hanya menulis localStorage + tabel kv,
// TAPI tidak mendaftarkan ke Supabase Auth (auth.users) seperti signup biasa
// (script.js:24916 `syncSignup`). Akibat: akun buatan admin cuma bisa login di
// device tempat dibuat; di device LAIN login gagal "Email belum terdaftar" karena
// pemulihan-cloud (verifyStrict → Supabase Auth) tak menemukannya.
//
// SOLUSI: endpoint ini memakai Supabase Auth **Admin API** (service-role) untuk
// membuat auth.users TANPA mengubah sesi pemanggil — beda dari /api/auth/bridge
// yang memanggil signInWithPassword (→ membajak sesi admin). `email_confirm:true`
// supaya akun bisa langsung login tanpa langkah verifikasi email.
//
// KEAMANAN (default-deny): pemanggil WAJIB (a) punya sesi Supabase valid, DAN
// (b) email-nya = super-admin resmi (env PLAYLY_ADMIN_EMAIL, default
// admin.playly@gmail.com). Ini mencegah user biasa menyalahgunakan endpoint untuk
// membuat akun / mengangkat admin (privilege escalation).

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { jsonError, jsonOk } from '@/lib/api/responses';

const OFFICIAL_ADMIN_EMAIL = (process.env.PLAYLY_ADMIN_EMAIL || 'admin.playly@gmail.com')
  .trim()
  .toLowerCase();

type Body = {
  email?: string;
  password?: string;
  name?: string;
  username?: string;
  tier?: string;
  asAdmin?: boolean;
};

export async function POST(req: Request) {
  // 0. Service-role tersedia? (env SUPABASE_SERVICE_ROLE_KEY)
  const admin = createAdminClient();
  if (!admin) {
    return jsonError('service_unavailable', 503, {
      message: 'SUPABASE_SERVICE_ROLE_KEY belum di-set di server.',
    });
  }

  // 1. Pemanggil harus login (punya sesi Supabase valid, dari cookie).
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

  // 2. Hanya super-admin resmi yang boleh (default-deny).
  if (callerEmail !== OFFICIAL_ADMIN_EMAIL) {
    return jsonError('forbidden', 403, {
      message: 'Hanya super-admin yang boleh membuat akun terdaftar.',
    });
  }

  // 3. Validasi input.
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return jsonError('bad_json', 400);
  }
  const email = (body.email || '').trim().toLowerCase();
  const password = body.password || '';
  const name = (body.name || '').trim();
  const username = (body.username || '').trim().toLowerCase();
  const tier = body.tier === 'premium' ? 'premium' : 'free';
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return jsonError('invalid_email', 400);
  if (password.length < 6) return jsonError('weak_password', 400);

  // 4. Buat auth.users via Admin API — TIDAK mengubah sesi pemanggil.
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, username },
  });

  let authUserId: string | null = null;
  let alreadyExists = false;
  if (createErr) {
    const msg = (createErr.message || '').toLowerCase();
    // Sudah terdaftar di Supabase Auth → tujuan tercapai (idempoten).
    if (msg.includes('already') || msg.includes('registered') || msg.includes('exist')) {
      alreadyExists = true;
    } else {
      return jsonError('create_failed', 500, { message: createErr.message });
    }
  } else {
    authUserId = created?.user?.id || null;
  }

  // 5. Upsert profile (metadata publik). Non-fatal — auth.users sudah cukup untuk login.
  let profileSynced = false;
  if (authUserId) {
    const profile: Record<string, unknown> = { id: authUserId, email, name: name || null, tier };
    if (username) profile.username = username;
    const { error: pErr } = await admin.from('profiles').upsert(profile, { onConflict: 'id' });
    if (!pErr) {
      profileSynced = true;
    } else if (pErr.code === '23505') {
      // Username bentrok → retry tanpa username (mirror pola /api/auth/bridge).
      delete profile.username;
      const { error: retryErr } = await admin.from('profiles').upsert(profile, { onConflict: 'id' });
      if (!retryErr) profileSynced = true;
    }
  }

  return jsonOk({ created: !alreadyExists, alreadyExists, profileSynced });
}
