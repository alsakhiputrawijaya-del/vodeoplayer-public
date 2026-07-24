# ADR-032 — Kernel pindah ke `AGENTS.md` akar (sumber tunggal universal lintas-provider)

- Status: DITERIMA (keputusan owner, 2026-07-23)
- Membalik: [[ADR-031]] (yang menjadikan `CLIENT.md` kernel tunggal). 031 memindah IDENTITAS berkas dari `CLAUDE_universal_v1.md` → `CLIENT.md`; **032 memindahnya lagi → `AGENTS.md` akar** + membalik peran generator adapter.
- Lanjutan konteks tim: [[ADR-018]] · sejarah adapter Kimi: [[ADR-015]] · pemisahan identitas: [[ADR-031]].

## Masalah

Kernel `CLIENT.md` hanya dipahami Claude Code (lewat `@import`). Provider lain (Codex, Kimi, Cursor, Copilot, Gemini) **tidak** membaca `CLIENT.md` dan **tidak** kenal `@import` — jadi kit harus **men-generate salinan** `CLIENT.md` ke berkas yang mereka baca native (`AGENTS.md` akar untuk Codex, `.kimi-code/AGENTS.md` untuk Kimi, `.cursor/rules/*.mdc` untuk Cursor). Konsekuensi terverifikasi:

1. **Muat-ganda token di Claude client:** `CLAUDE.md.template` meng-`@import` `CLIENT.md` **dan** `AGENTS.md` akar — sedangkan `AGENTS.md` akar berisi salinan penuh `CLIENT.md` (blok Codex). Claude memuat kernel 2× (~7,5 KB/sesi). Bukti: `CLAUDE.md.template:15-16` + `engine/adapter-rules-gen.mjs:140-164`.
2. **Mesin fotokopi + gerbang 32 KiB + risiko potong-diam** hanya untuk menembus tool yang sebenarnya sudah baca `AGENTS.md` native.

**Fakta kunci (riset docs resmi 2026-07-23):** `AGENTS.md` adalah **standar terbuka lintas-tool** (agents.md) yang dibaca native oleh Codex (root project, zero-config), Kimi Code (`AGENTS.md` root + `.kimi-code/AGENTS.md`), Cursor, Copilot, Gemini CLI, dll. Claude Code **mendukung `@import`** sehingga bisa menunjuk ke `AGENTS.md`. Nama file instruksi Kimi **terkunci** ke `AGENTS.md` (tak bisa diganti ke `CLIENT.md`); Codex bisa `project_doc_fallback_filenames` tapi butuh config per-mesin (rapuh).

## Keputusan owner

Jadikan **`AGENTS.md` akar project = kernel tulis-tangan tunggal** (isi ex-`CLIENT.md`, 5 bagian). Semua provider membacanya native; Claude via `@import`. **Tak ada lagi generator salinan Codex/Kimi.**

Pemisahan peran berkas (kritis — cegah kehilangan data client):

| Berkas | Peran | Milik | Saat update |
|---|---|---|---|
| `AGENTS.md` (akar) | **Kernel** (aturan universal, tanpa placeholder) | **KIT** | **DI-REFRESH** (backup lalu timpa) |
| `AGENTS.override.md` (akar) | Override khusus project (stack, opt-in mode) | **CLIENT** | **DIPERTAHANKAN** (tak pernah ditimpa) |
| `CLAUDE.md` (akar) | Pemuat Claude: `@import ./AGENTS.md` + `@import ./AGENTS.override.md` | KIT | Refresh idempoten |

> **Balik peran vs sebelum ADR-032:** dulu `AGENTS.md` = milik-client-dipertahankan; kini `AGENTS.md` = milik-kit-di-refresh, dan peran "dipertahankan" pindah ke `AGENTS.override.md`. Codex membaca `AGENTS.override.md` LEBIH DULU secara native (urutan resmi: `AGENTS.override.md` → `AGENTS.md` → fallback) — jadi override client menang tanpa mekanisme tambahan.

## Yang berubah

- **Kernel:** `CLIENT.md` → `AGENTS.md` akar (isi §1–§5 verbatim; header disesuaikan). `CLIENT.md` dihapus. `AGENTS.md` di-un-gitignore + di-track + dikirim (dulu artefak generated gitignored).
- **Override:** `AGENTS.md.template` (isi override lama) → `AGENTS.override.md.template`. Setup me-render ke `AGENTS.override.md` (client-owned, preserve).
- **Loader:** `CLAUDE.md.template` → `@import ./AGENTS.md` + `@import ./AGENTS.override.md`. `CLAUDE.md` dogfood: tetap `@import ./lintasAI.md` (kernel sengaja tak dimuat di sesi dev demi hemat token — Codex/Kimi tetap baca `AGENTS.md` akar).
- **Generator adapter (`engine/adapter-rules-gen.mjs`):** generator Codex (`buildCodexAgents`/`runCodexAgentsGen`) + Kimi (`buildKimiAgents`/`runKimiAgentsGen`) **DIPENSIUNKAN** — root `AGENTS.md` dibaca native keduanya. Cursor (`.cursor/rules/lintasai.mdc`) TETAP (mekanisme beda), sumbernya kini `AGENTS.md`. `findRulesSource` cari `AGENTS.md` (root) / `.claude-kit/AGENTS.md`.
- **Robot:** budget/consistency/locked-phrase/ref-check/big-file-guard/setup-hooks/setup-interactive → target `AGENTS.md`.
- **Manifest kirim:** `package.json` files[] · `engine/kit-files.json` · `engine/kit-staging.mjs` (`KIT_CORE_ENTRIES`) → kirim `AGENTS.md` + `AGENTS.override.md.template` (bukan `CLIENT.md`).
- **Migrasi client lama (`engine/migrate-*`):** saat update, deteksi `AGENTS.md` akar gaya-lama (override client + kemungkinan blok Codex basi). **Pindahkan bagian override → `AGENTS.override.md` DULU**, buang blok Codex lama, baru tulis kernel ke `AGENTS.md` (backup asli). Tanpa langkah ini = kustomisasi client hilang.

## Konsekuensi

- **Positif:** 1 sumber universal dibaca semua provider native (nol config rapuh); nol muat-ganda Claude; hapus mesin fotokopi Codex/Kimi + gerbang 32 KiB (kernel 7,5 KB dibaca apa adanya); interop lintas-tool via nama standar.
- **Trade-off:** kernel kini di ROOT (keluar dari version-lock `.claude-kit/`) → di-refresh saat update via backup-lalu-timpa; butuh robot migrasi sekali-jalan untuk client lama (destructive-ish, dijaga backup).
- **Owner-gated:** naik versi (MAJOR — marker loader + tata-letak berubah = breaking client lama) + CHANGELOG + tag/rilis.

## Alternatif ditolak

- **Kernel tetap `CLIENT.md`, hapus `AGENTS.md`** → BREAKING Kimi (nama terkunci ke `AGENTS.md`) + Codex butuh config per-mesin. Ditolak (riset docs resmi 2026-07-23).
- **Kernel di `.claude-kit/AGENTS.md`** → Codex/Kimi tak baca subfolder → tetap butuh root copy (mesin fotokopi tak hilang). Ditolak.
