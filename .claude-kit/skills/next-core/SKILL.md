---
nama: next-core
deskripsi: Next.js inti kelas industri — batas Server/Client jelas, secret tak bocor ke browser, Server Action ber-otorisasi (anti-IDOR), nama berkas middleware sadar-versi.
divisi: stack
pemicu: [next.js, nextjs, app-router, server-component, use-client, server-only, middleware-next]
rawan_keamanan: true
menggantikan: []
---

# Skill: Next.js Inti — batas Server/Client & keamanan boundary

> **Kapan skill ini aktif:** **utama = deteksi config** — project punya `next` di `package.json`, folder `app/` (App Router), atau berkas `*.tsx` (§4.14 auto-detect). Teks "next.js/app-router/server-component/use-client/server-action" jadi pemicu sekunder. Fokus skill ini = **batas server↔client & 4 sumber kebocoran/kerusakan tersamar khas Next.js**. Pola performa & render React (waterfall, bundle, re-render, list) dipisah ke `skills/react-patterns/SKILL.md`.
>
> 🙂 **Analogi:** Next.js itu **toko dua lantai** — **lantai server** (dapur, boleh pegang kunci brankas/rahasia) dan **lantai client/browser** (etalase, semua yang dipajang kelihatan siapa saja yang lewat). Taruh kunci brankas di etalase (`NEXT_PUBLIC_*`) = siapa saja bisa mengambilnya.

Skill ini **advisory** (§4.17): otak native yang memutuskan adopsi/adaptasi/abaikan tiap 📐/💡. Butir **🔒 HASIL** = hasil keselamatan/keandalan yang tak boleh gagal. Versi framework JANGAN di-hardcode — cek versi terpasang di `package.json` sebelum menyentuh fitur bergantung-versi (`optimizePackageImports`, `after()`, `<Activity>`, penamaan `proxy.ts`) — §8.2 A3; jangan salin contoh mentah.

---

## 1. Kontrak (yang HARUS benar — 4 sumber kebocoran/kerusakan tersamar khas Next.js)

- 🔒 **HASIL — Rahasia (secret) jangan bocor ke browser.** Env `NEXT_PUBLIC_*` = **TERBUKA ke publik** (JANGAN taruh kunci rahasia di situ!); kunci server tanpa prefix + jangan dioper sebagai props ke Client Component. (🙂 Non-Programmer: env `NEXT_PUBLIC_` itu terbuka — kayak menempel password di etalase toko.)
- 🔒 **HASIL — Checkpoint wajib penjaga `import "server-only"`: build GAGAL otomatis kalau rahasia bocor ke browser.** Project Next.js yang memakai secret server (mis. `service_role` Supabase) WAJIB pasang paket npm `server-only` + tulis `import "server-only"` di baris paling ATAS TIAP berkas modul sensitif (klien DB, pembaca secret) — bukan opsional; verifikasi build gagal saat modul ini di-impor Client Component. Kalau Client Component (`"use client"`) tak sengaja mengimpornya, bundler LANGSUNG menggagalkan build — bukan diam-diam mengirim rahasia ke bundel browser. Penjaga waktu-build (compile-time), pelengkap—BUKAN pengganti—aturan `NEXT_PUBLIC_`. Kebalikannya `import "client-only"`. (🙂 stempel "KHUSUS SERVER" di file rahasia — kalau salah colok ke area pelanggan, proses rilis berhenti otomatis, ketahuan SEBELUM online.)
- 🔒 **HASIL — Tiap `"use server"` (Server Action) = pintu publik.** WAJIB cek auth + otorisasi DI DALAM action (`getSession()` + cek role/kepemilikan), JANGAN andalkan tombol yang disembunyikan di Client Component. Pagar sisi browser bisa dilewati — sama bahayanya dengan IDOR (*Insecure Direct Object Reference* = penyerang mengganti ID untuk ambil data orang lain). Pola kode lengkap di §3. (🙂 Non-Programmer: menyembunyikan tombol "Hapus" BUKAN keamanan — orang iseng bisa panggil fungsinya langsung. Satpam asli harus di server.)
- 🔒 **HASIL — Nama berkas middleware = SADAR-VERSI (`proxy.ts` di Next 16+, `middleware.ts` sebelumnya).** 🚨 JANGAN "membetulkan" `proxy.ts` jadi `middleware.ts` di proyek Next 16 — itu MEMATIKAN middleware (auth-guard/redirect mati TANPA error). Sejak Next 16: berkas root `proxy.ts` + fungsi ekspor `proxy` (runtime Node.js); `middleware.ts` masih jalan untuk Edge tapi USANG & akan dihapus (ada codemod migrasi + flag config ikut ganti). Model bawaan dilatih di era `middleware.ts` → rawan salah-koreksi (§8.2). WAJIB cek angka `next` di `package.json` + dok resmi sebelum menyentuh berkas ini. (🙂 nama "satpam pintu masuk" beda tergantung versi Next.js — jangan asal ganti, bisa mematikan satpamnya diam-diam.)

---

## 2. Cara rakit (batas Server/Client & server-side — 📐 CARA BAKU; boleh diganti cara lain yang capai HASIL sama)

**Dasar Server/Client Component & data**

1. 📐 **Server Component (App Router) = default** (jalan di server, tak terkirim ke browser, bisa `await` langsung); pakai `"use client"` HANYA kalau butuh interaksi/hook. Client TAK boleh impor Server Component (terima lewat `children`).
2. 📐 **Data server:** pakai server-state (TanStack Query/SWR) atau RSC `fetch`, BUKAN `useState` untuk data dari API. Tempat state: lokal → angkat ke induk → Context (hanya nilai jarang-berubah: tema/auth/locale) → store eksternal (Zustand/Jotai) untuk sering-berubah.
3. 📐 **Pisah Container** (ambil data) **vs Presentational** (cuma tampil props). Pakai `next/image` + `next/font` untuk optimasi kecepatan; 4 state UI + error boundary (`skills/a11y/SKILL.md`).

🙂 Non-Programmer: pisahkan "halaman yang cuma menampilkan" dari "yang ambil data"; JANGAN tempel kunci rahasia di kode yang ikut terkirim ke browser pengunjung.

**Server-side (jaga per-request — cegah data 2 user tabrakan)**

4. 📐 PENTING: bungkus ambil-data per-request dengan `cache()` dari `react` — 3 Server Component panggil `getUser("1")` di render sama = 1 query DB.
5. 📐 PENTING (keamanan/data): JANGAN simpan state berubah di level modul server — DIBAGI ke semua request = 2 user tabrakan data. Pakai penyimpanan per-request (`headers()`, `cookies()`, async context).
6. 💡 RAPIKAN: kirim ke Client Component HANYA kolom yang dipakai (proyeksikan/paginasi di DB). Kerja yang tak perlu menahan respons (logging, warm cache) pakai `after()` (cek versi terpasang).

> Butir 🔒 tiap `"use server"` wajib cek auth+otorisasi (Kontrak §1) — pola kode lengkap di §3.

---

## 3. Powerful — pola siap-adaptasi (jangan salin mentah, netralkan ke versi terpasang)

🧪 **CONTOH KASUS — pola auth di Server Action (memenuhi 🔒 HASIL §1):**

```ts
"use server";
export async function deleteUser(formData: FormData) {
  const session = await getSession();
  if (!session?.user) throw new Error("Unauthorized");          // cek login
  const targetId = String(formData.get("id"));
  if (session.user.role !== "admin" && session.user.id !== targetId)
    throw new Error("Forbidden");                                // cek hak akses
  await db.user.delete({ where: { id: targetId } });
}
```

🧪 **CONTOH — modul sensitif ditandai KHUSUS SERVER:**

```ts
import "server-only";           // build GAGAL kalau Client Component mengimpor modul ini
import { createClient } from "@supabase/supabase-js";
export const admin = createClient(url, process.env.SUPABASE_SERVICE_ROLE!); // secret server, TANPA NEXT_PUBLIC_
```

---

## 4. Self-verify (sangkal diri sendiri SEBELUM bilang "selesai" — §8.2 Aturan 3)

- [ ] Tak ada secret/rahasia server ikut ke Client Component / bundel browser? Modul sensitif (klien DB, pembaca secret) pakai `import "server-only"` di baris teratas — build gagal kalau di-impor Client Component?
- [ ] Tiap `"use server"` (Server Action) cek auth+otorisasi DI DALAM action (bukan cuma sembunyi tombol di UI)?
- [ ] Nama berkas middleware (`proxy.ts`/`middleware.ts`) sesuai versi `next` di `package.json`?
- [ ] Server Component = default; `"use client"` hanya saat butuh interaksi; Client tak impor Server Component (terima via `children`)?
- [ ] State server-only tak disimpan di level modul (dibagi antar-request)? Data per-request pakai `cache()`/`headers()`/`cookies()`?
- [ ] 4 state UI (loading/empty/error/success) + error boundary ada?

> **Verifikasi WAJIB cuma-baca** (§8.2 Aturan 3): membuktikan = baca kode + build (menangkap penjaga `server-only`) + menalar. Uji IDOR pada Server Action: coba panggil action dengan ID milik orang lain.

---

## 5. Definition-of-Done (kapan skill next-core dianggap benar-selesai)

- [ ] **Kontrak (§1) terpenuhi:** rahasia tak bocor ke browser + penjaga `server-only` terpasang + Server Action ber-otorisasi + nama berkas middleware sesuai versi.
- [ ] **Edge case** ditangani: hydration mismatch (server vs client render beda), 2 request bersamaan menyentuh state modul-level, secret tak sengaja dioper sebagai props.
- [ ] **Self-verify (§4) tercentang** dengan bukti `berkas:baris`.
- [ ] Build lulus (termasuk penjaga `server-only` kalau dipasang) + lint + test lulus lokal.
- [ ] **Gerbang Pra-Rilis §4.6 LULUS** — "selesai" = terbukti (build dilihat, bukan "sudah kutulis").

---

## 6. Handoff / rujuk-silang (reuse-first — JANGAN salin, RUJUK)

- 📐 **Performa & pola render React** (anti-waterfall `Promise.all`, bundle/`dynamic`, re-render, `key` stabil, immutability, Web Vitals, tes komponen, Motion) → `skills/react-patterns/SKILL.md`.
- 📐 **Kalau Server Action/route handler jadi kontrak API penuh** (status code, amplop respons, otorisasi per-resource) → `skills/backend/SKILL.md`.
- 📐 **Keamanan web lebih dalam** (SQL injection, CSRF, rate-limit, upload, SSRF) → `skills/owasp/SKILL.md`.
- 📐 **Login/sesi/cek-izin (RBAC)** → `skills/auth/SKILL.md`.
- 📐 **a11y** (label, fokus, ARIA, kontras) → `skills/a11y/SKILL.md`.
- 🗃️ **LATAR — kredit (MIT © Affaan Mustafa):** pola `import "server-only"` dari `coding-standards`; aturan sadar-versi `proxy.ts` dari `nextjs-turbopack` — ECC v2.0.0 (ditulis-ulang non-programmer).

---

## 7. Threat-model 3-baris + batas jujur

- 🗃️ **LATAR — Threat-model:** **Aset:** kerahasiaan secret server, kejelasan jalur otorisasi Server Action, keutuhan batas server↔client. **Mode-gagal khas** (kode "kelihatan benar" tapi bocor/rusak diam-diam): `NEXT_PUBLIC_*` menyimpan rahasia → siapa saja bisa ambil; Server Action dipanggil langsung tanpa lewat UI (tombol disembunyikan ≠ proteksi); salah-migrasi `middleware.ts`↔`proxy.ts` mematikan auth-guard TANPA error; state modul-level di server dibagi ke semua request → 2 user tabrakan data. **Mitigasi:** `import "server-only"` (build gagal kalau bocor) + auth&otorisasi di dalam Server Action + cek `package.json` sebelum sentuh middleware + state per-request (`headers()`/`cookies()`).
- 🗃️ **LATAR — Batas jujur:** skill ini menaikkan **lantai** keamanan boundary Next.js; **tidak menggantikan** audit keamanan penuh atau pengujian penetrasi. Fitur (`optimizePackageImports`, `after()`, `<Activity>`, `proxy.ts`) bergantung versi `next` terpasang — cek dokumentasi resmi versi ITU (§8.2 A3), jangan salin contoh dari internet mentah-mentah.

🙂 **Non-Programmer:** Next.js memisahkan "dapur" (server, boleh pegang rahasia) dari "etalase" (browser, semua kelihatan) — kesalahan paling mahal adalah menaruh kunci dapur di etalase, atau lupa memasang satpam (cek login) di pintu belakang (Server Action) karena mengira tombolnya sudah "disembunyikan" cukup aman. Skill ini memasang pagar untuk keduanya.
