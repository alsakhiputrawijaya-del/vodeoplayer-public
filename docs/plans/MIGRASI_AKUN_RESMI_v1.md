# Runbook — Migrasi Repo & Database ke Akun Resmi (Official)

> Versi 1.0 · 26 Jul 2026 · Status: **SIAP DIEKSEKUSI** (menunggu jadwal + kredensial akun resmi).
> Sifat: pekerjaan **DevOps berisiko** (login, data, environment) — WAJIB dijadwalkan, ada backup, dan ada pemilik keputusan. Bukan pekerjaan kode.

---

## 0. Yang sudah siap (jangan dibangun ulang)

- **Alat migrasi schema**: `scripts/migrasi-ke-playly2.mjs` (`npm run migrasi:playly2 <file.sql>`)
  - Default = **SIMULASI** (tak mengubah apa pun); `--jalankan` = eksekusi nyata.
  - 6 pagar keamanan: tolak tulis ke `public.`/schema tim lain/`storage.`/perintah berbahaya/tulis `auth.*`/`set role` — semua dalam **1 transaksi** (gagal → rollback total).
  - Kredensial dibaca dari berkas lokal (`set claude.txt` atau `PLAYLY2_CREDS`); password tak pernah dicetak.
- **Output ganda** di `.migrasi-playly2/`: versi `__UNTUK-DB-LAMA.sql` dan `__UNTUK-playly2.sql` untuk tiap migrasi struktur.
- **Migrations terurut**: `supabase/migrations/0001…0015` (RLS & schema sudah dikeraskan bertahap).
- **Repo**: riwayat rapi, PR-based (#37–#44).

## 1. Prasyarat (sebelum hari-H)

- [ ] Akun resmi siap: organisasi GitHub + project Supabase resmi (URL, anon key, service key, R2 bucket resmi bila pindah storage juga).
- [ ] Daftar env yang harus dipindah: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `R2_*` (5 var), `DEEPL_API_KEY`, dll — inventaris dari `.env.local` + Vercel env.
- [ ] **Backup penuh**: export data `kv` + `videos` + storage dump + `auth.users` (lihat §3).
- [ ] Jadwal cutover + jendela maintenance (umumkan ke user bila perlu).
- [ ] Pemilik keputusan (siapa yang menekan "jalan") + pemantau selama cutover.

## 2. Tahap A — Migrasi struktur (schema playly2 → resmi)

1. Terapkan semua migrasi ke DB resmi via alat (simulasi dulu):
   - `npm run migrasi:playly2 supabase/migrations/0016_xxx.sql` → cek output SIMULASI.
   - Ulangi `--jalankan` hanya setelah simulasi bersih.
2. Verifikasi: tabel `kv`, `videos`, RLS policies aktif (cek ulang 0008/0012/0015), storage bucket `videos` (private) + policies.

## 3. Tahap B — Migrasi data

1. **kv** (per user + platform): dump via service role → impor ber-batch (hormati RLS: tulis pakai service role).
2. **videos**: id sama (id = timestamp; pertahankan supaya R2 key & watch link tak rusak).
3. **Storage/R2**: salin objek `videos/<id>.*` (+ `<id>-bgm`, `<id>-logo`) ke bucket resmi; verifikasi head per objek.
4. **auth.users**: migrasi akun = jalur resmi Supabase (admin export/import) — **jangan** disentuh skrip (pagar #5 alat). Uji login 1 akun dulu.

## 4. Tahap C — Cutover

1. Deploy env baru ke Vercel (preview dulu, bukan produksi).
2. Uji smoke: login, upload video kecil, putar, watch publik, subtitle, backsound, logo watermark, ekspor MP4.
3. Alihkan domain/produksi. Pantau error 1–2 jam.
4. Bekukan DB lama (read-only) minimal 7 hari sebagai jaring pengaman.

## 5. Rollback

- Balik env Vercel ke nilai lama (instan).
- Data yang masuk SETELAH cutover diekspor dari DB resmi dan diimpor balik ke DB lama (selisih saja).
- Keputusan rollback = pemilik keputusan, bukan otomatis.

## 6. Risiko & catatan jujur

- `auth.users` adalah titik paling rapuh (login semua tim) — jangan skripkan; pakai jalur resmi + uji dulu.
- Link watch `/watch/:id` dan key R2 aman SELAMA id video dipertahankan.
- Perubahan struktur SELAMA masa transisi wajib lewat alat ganda (§2) supaya dua DB tak berjarak.
- Jangan jadwalkan bersama rilis fitur besar lain.
