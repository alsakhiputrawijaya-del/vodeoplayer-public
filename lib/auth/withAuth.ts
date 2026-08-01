// lib/auth/withAuth.ts - Helper cek login untuk Route Handler API.
//
// Tujuan: hilangkan pola berulang `createClient() → supabase.auth.getUser() →
// cek user` yang tersebar di app/api/**/route.ts. Route baru WAJIB pakai helper
// ini; route lama tetap jalan dan tidak diganggu.
//
// Contoh pakai di route baru:
//   const auth = await requireAuth();
//   if (auth.error) return auth.error;
//   const { supabase, userId } = auth;
//   // lanjutkan operasi dengan supabase + userId yang sudah pasti login

import { createClient } from '@/lib/supabase/server';
import { jsonError } from '@/lib/api/responses';

export type AuthSuccess = {
  supabase: Awaited<ReturnType<typeof createClient>>;
  userId: string;
  error: null;
};

export type AuthFailure = {
  supabase: null;
  userId: null;
  error: ReturnType<typeof jsonError>;
};

export async function requireAuth(): Promise<AuthSuccess | AuthFailure> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.id) {
      return { supabase: null, userId: null, error: jsonError('not_authenticated', 401) };
    }
    return { supabase, userId: user.id, error: null };
  } catch {
    // Supabase env hilang / cookie tidak bisa dibaca — treat sebagai service error.
    return { supabase: null, userId: null, error: jsonError('auth_unavailable', 503) };
  }
}
