# PETA.md — Peta "Apa di Mana" + Aturan Penempatan Berkas Baru (lintasAI)

> ⚙️ **BERKAS DI-GENERATE OTOMATIS** oleh `tools/peta-gen.mjs` (`node tools/peta-gen.mjs` — perkakas repo kit;
> di project client berkas ini ikut kit apa adanya, tak perlu & tak bisa di-regen). JANGAN edit tangan —
> perubahan tangan akan tertimpa + guard `checkPetaDrift` (preflight) memerah. Ubah lewat sumbernya:
> folder/skill di disk, atau katalog konstanta di `tools/peta-gen.mjs`. Versi skema: 1.
>
> **AI: baca berkas INI PERTAMA** untuk tahu "apa di mana" + ke mana menaruh berkas baru (struktur-hygiene).

## 1. Struktur folder — apa fungsi tiap folder

| Folder | Fungsi | Di `.lintasai/` klien? |
|---|---|---|
| `bin/` | Dispatcher `npx lintasai <cmd>` (pintu masuk semua perintah). | ✅ ikut |
| `create-lintasai/` | Paket pembuat `npm create lintasai` (bootstrap installer). | — (hanya repo kit) |
| `docs/` | Dokumentasi mesin + ADR keputusan repo kit (`docs/decisions/`) — maintainer-facing, TIDAK dikirim ke client (v4.0.0). | — (hanya repo kit) |
| `engine/` | Robot & helper Node (`*.mjs`/`*.js`) — mesin kit: generator, guard, helper installer. | ✅ ikut |
| `skills/` | Buku panduan per-bidang (`<nama>/SKILL.md`) — rak on-demand SATU-SATUNYA. `registry.json` = indeks yang dibaca dispatcher. | ✅ ikut |
| `templates/` | Berkas yang di-DEPLOY ke project client saat pasang (skeleton docs + panduan tim). | ✅ ikut |
| `tests/` | Tes Node (`*.test.mjs`) — internal repo kit, TIDAK dikirim ke client. Gerbang pra-rilis = `tools/preflight.mjs`. | — (hanya repo kit) |
| `tools/` | Perkakas MAINTAINER repo kit (preflight, robot mutu, generator PETA/registry, cap-versi) — TIDAK dikirim ke client; client tak pernah mengetik perintah CLI (v6.0.0). | — (hanya repo kit) |

## 2. Skill (buku panduan per-bidang) — apa di mana + kapan aktif

> 🔒 = rawan keamanan (wajib dibaca saat menyentuh bidangnya). Path FLAT: `skills/<nama>/SKILL.md`.
> Pemicu lengkap + indeks mesin-baca: `skills/registry.json`. Routing cepat (hemat token):
> `node .lintasai/engine/rak-cli.mjs "<topik>"` → daftar rak relevan tanpa baca registry penuh.
> `stack` = rak teknologi, **bukan** profesi — label persona §1.5 ikut bidang tugasnya.

| Divisi | Skill (🔒 = rawan keamanan) |
|---|---|
| backend | 🔒 admin-panel, 🔒 backend, background-job, caching, 🔒 realtime, tahan-gagal |
| database | 🔒 database, jaring-data |
| devops | debug-metodis, devops, perbaiki-error |
| frontend | a11y, design-direction |
| keamanan | 🔒 anti-fraud, 🔒 auth, 🔒 kepatuhan-teregulasi, 🔒 pembayaran, permukaan-ai, 🔒 rate-limiting, 🔒 wallet-ledger |
| marketing | seo |
| product | analytics, cek-permintaan |
| qa | cakupan-tes |
| stack | deploy, 🔒 next-core, 🔒 owasp, python, react-patterns, 🔒 supabase-prisma |

_30 skill terdaftar._

## 3. Aturan penempatan berkas BARU (struktur-hygiene) — baca SEBELUM bikin berkas

Taruh berkas baru di RUMAH yang benar + daftarkan supaya tak "un-ship senyap" (tak sampai ke client) / basi:

| Mau bikin… | Rumahnya | Wajib didaftar/dijalankan |
|---|---|---|
| **Skill baru** (buku panduan bidang) | `skills/<nama>/SKILL.md` (FLAT, 1 folder/skill) | `node kit/engine/skill-registry.mjs` dijalankan dari dalam `kit/` (perbarui `registry.json`) + tambah baris `SKILL.md` ke grup `skills` di `engine/kit-files.json` |
| **Robot/helper Node yang dipakai CLIENT** | `engine/<nama>.mjs` | Tambah ke grup `node_lib` di `engine/kit-files.json`; kalau jadi perintah → `COMMANDS_NODE` di `bin/lintasai.js` |
| **Perkakas MAINTAINER** (pemeriksa, generator, alat rilis) | `tools/<nama>.mjs` di AKAR repo — **bukan** `kit/` | Tak perlu didaftar (tak dikirim ke client). Kalau jadi gerbang → panggil dari `tools/preflight.mjs` |
| **Tes baru** | `tests/<nama>.test.mjs` | Otomatis terpungut `npm test` (tak perlu daftar) |
| **Template untuk client** | `templates/<nama>` | Tambah grup `templates` di `engine/kit-files.json`. Panduan TIDAK lagi disalin ke `docs/` client (satu sumber, v6.0.0) |
| **Dokumen repo kit** | `docs/<nama>.md` | On-demand. ADR → `docs/decisions/ADR-XXX-*.md` |
| **Berkas root aturan/prompt** | akar repo | Tambah `package.json` `files[]` (root `.md` dikirim satu-per-satu, bukan pola `*.md`) + grup cocok di `engine/kit-files.json` |

**Prinsip:** jangan buang berkas di root sembarangan — tiap berkas punya rumah. Berkas yang dikirim ke client WAJIB terdaftar di `engine/kit-files.json` **dan** `package.json` `files[]`; kalau tidak, guard coverage (`skill-registry.test`/`package-bundle.test`) memerah ATAU berkas tak sampai ke client (un-ship senyap).

## 4. Peta lain (ini MELENGKAPI — jangan duplikasi isinya)

PETA.md = inventaris "apa di mana" + aturan penempatan. Untuk hal lain, rumahnya:

| Butuh… | Baca | Catatan |
|---|---|---|
| Narasi makro + alur perintah (kenapa/bagaimana) | `docs/architecture.md` (repo kit) | Peta makro prosa project (READ-MINIMAL §4.1) — opsional, buat manual di project bila perlu |
| Berkas mana ikut bergerak per jenis perubahan | `docs/RESEP_PERUBAHAN.md` (repo kit) | Checklist per-perubahan — tidak dikirim ke client |
| Daftar isi rak on-demand + pemicunya | `skills/registry.json` | Ikut ke client |

