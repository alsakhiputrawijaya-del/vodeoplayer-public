# Changelog

Semua perubahan signifikan ke kit ini didokumentasikan di file ini.

Format mengikuti [Keep a Changelog](https://keepachangelog.com/id-ID/1.1.0/),
dan kit ini mengikuti [Semantic Versioning](https://semver.org/lang/id/).

## Label spesial (auto-detect oleh `npx lintasai update`)

- **[BREAKING]** - Ada perubahan tidak backward-compatible. Wajib baca migration notes.
- **[SCAN-REQUIRED]** - Wajib regenerate `docs/` (re-paste `PROJECT_LIFECYCLE_PROMPT_v1.md` Stage 2: Bikin Catatan Proyek).
- **[SECURITY]** - Perbaikan KEAMANAN. Pasang SEGERA walau update kecil — **urgensi, terpisah dari ukuran** (bisa nempel di tingkat mana pun). Tool `npx lintasai update` tampilkan peringatan merah "pasang SEGERA".

Tanpa label, update aman: `docs/` user TIDAK perlu di-scan ulang.

## Disiplin penomoran versi (semver) — WAJIB saat rilis

Versi = `BESAR.MENENGAH.KECIL`. Saat owner/AI menaikkan versi:
- **Perbaikan kecil** (typo, fix, Tier 1) → naikkan **KECIL**: `1.7.5 → 1.7.6`
- **Fitur/aturan baru** backward-compatible (Tier 2) → naikkan **MENENGAH**: `1.7.x → 1.8.0`
- **Breaking** (`[BREAKING]`, Tier 3) → naikkan **BESAR**: `1.x → 2.0` — **WAJIB**, jangan sembunyikan breaking di angka kecil/menengah.

> **Kenapa:** staff non-programmer sering cuma melihat NOMOR. Kalau breaking nyelip di angka kecil, mereka kira aman → kaget. **Angka BESAR yang JARANG naik = sehat** (jarang merusak user); yang dihindari bukan angka besar, tapi sering-breaking. Aturan inti penomoran: semver kit (resep rilis: `docs/RESEP_PERUBAHAN.md`).

---

## [3.1.0] - 2026-07-23

> **Ringkasan rilis:** kernel client resmi pindah ke **`AGENTS.md` akar project** (sumber tunggal
> universal, ADR-032) — dibaca **native** oleh Codex/Kimi/Cursor + oleh Claude lewat loader
> `CLAUDE.md` — dengan **auto-migrasi client lama** (nol kehilangan kustomisasi) · **5 skill
> frontend baru** (a11y · design-direction · next-core · react-patterns · presentasi) menggantikan
> 4 skill lama (webdesign/uiux/nextjs/frontend-lanjutan), registry kini **38 skill** · pemicu rak
> `rilis/produksi` → skill deploy dihidupkan kembali · sapuan besar rujukan kernel lama
> (`CLAUDE_universal_v1.md`, sudah diarsip) di seluruh dokumen/prompt/rules/templates yang dikirim
> ke client — client tak lagi diarahkan ke berkas yang tidak ada.

### Ditambah

- **Kernel `AGENTS.md` akar (ADR-032).** Satu berkas aturan universal (5 seksi ramping: Bahasa ·
  Anti-Halusinasi · Struktur · Loop Kerja · Anti-Merusak) di root project client, dibaca native
  semua alat AI. `AGENTS.override.md` (milik client, dari template) menampung kustomisasi proyek —
  tak pernah ditimpa saat update.
- **Auto-migrasi client lama** (`engine/migrate-agents-md.mjs`): `AGENTS.md` gaya-lama (override
  client pra-ADR-032) otomatis dipindah ke `AGENTS.override.md` SEBELUM kernel baru ditulis —
  kustomisasi client selamat; idempoten + fail-safe.
- **5 skill frontend baru**: `a11y` (WCAG 2.2 + 4 state UI) · `design-direction` (arah desain +
  kualitas visual) · `next-core` (Next.js inti) · `react-patterns` (pola komponen + tes RTL) ·
  `presentasi` — menggantikan `webdesign`/`uiux`/`nextjs`/`frontend-lanjutan` dengan isi yang
  ditata ulang; seluruh rute pemicu & rujukan silang di-retarget.

### Diubah

- **Loader `CLAUDE.md` client**: kini meng-`@import` `./AGENTS.md` + `./AGENTS.override.md`.
  Deteksi idempoten diperkuat 3-lapis — loader klien LAMA (yang masih menunjuk kernel arsip
  `.claude-kit/`) kini pasti di-refresh saat update (dicadangkan dulu, aman).
- **`.kimi-code/AGENTS.md` generated dipensiunkan** (ADR-032): Kimi Code & Codex membaca
  `AGENTS.md` akar secara native; Cursor tetap lewat `.cursor/rules/lintasai.mdc` generated.
  `lintasai doctor` menyesuaikan indikatornya; gitignore client tak lagi menambah entri usang.
- **Pemicu rak `rilis/produksi` dikembalikan** ke `engine/rak-pemicu.mjs` — prompt natural
  "mau online / rilis / deploy" kembali diarahkan ke `skills/deploy/SKILL.md`.

### Diperbaiki

- **Puluhan pointer mati** ke berkas terhapus/terarsip di seluruh pohon yang dikirim ke client:
  `skills/nextjs`→`skills/next-core` (owasp/caching/galeri-folder/STACK_GUIDE), `skills/uiux`→
  `skills/a11y` + `skills/webdesign`→`skills/design-direction` (seo/admin-panel/rules 4.13),
  rujukan `templates/CONTENT_ANTISLOP_SKILL.md` (dicabut) dibersihkan dari skill seo, rujukan
  `rules/stack/4.14-*` lama di-repoint ke skill penggantinya.
- **`engine/kit-files.json`** grup `skills` dilengkapi 6 skill yang sempat hilang (admin-panel,
  deploy, ekspor-laporan, email-notifikasi, galeri-folder, github-actions); `skills/registry.json`
  + `PETA.md` diregenerasi dari disk (38 skill).
- **Indeks ADR** (`docs/decisions/README.md`) dilengkapi ADR-030/031/032 + link ADR yang dicabut
  dibersihkan; CLI standalone `engine/migrate-agents-md.mjs` kini jalan di Windows (deteksi isMain).

---

## [3.0.0] - 2026-07-22

> **Ringkasan rilis (versi BESAR):** menyerap SEMUA perubahan sejak 2.9.0 — perampingan fitur
> non-inti ([BREAKING], entri pertama di bawah, ADR-029) · rename folder `workflows/`→`rules/` +
> `lib/`→`engine/` ([BREAKING], ADR-027 Task 13; dibetulkan otomatis saat update) · arsitektur
> microkernel-plugin skills 31→37 skill · `kimi-sync`→`adapter-sync` + adapter Cursor/Codex ·
> "KENAPA-singkat" tiap langkah AI (ADR-028) · pencabutan ritual 8-divisi ([BREAKING], ADR-023,
> entri terbawah) · **microkernel ekstrem `CLAUDE_universal_v1.md`** 64rb→31rb char, −48,7%
> token/sesi client, Codex akhirnya kebagian aturan ([BREAKING], ADR-030, entri pertama di bawah).
> **Gerbang rilis:** 1533 tes hijau · preflight `--strict` GENTING 0 / PENTING 0 ·
> consistency BERSIH · `npm pack` 281 berkas. **Catatan diterima-owner:** 1 tes flaky sekali-muncul
> tak-reproduksi (dicatat jujur, tidak dipaksa "terpasang" di Buku Pelajaran) · plafon `MAKS_GRUP=3`
> dispatcher dibiarkan (perilaku lama, bukan regresi) · `npm audit` 2 CVE transitif devDeps eslint
> (kit nol runtime-dependency + lockfile tak dikirim → client TIDAK terpapar).

### Diubah — [BREAKING] Microkernel ekstrem `CLAUDE_universal_v1.md`: −52% ukuran, fungsi 100% sama (ADR-030)

- **Berkas aturan always-load 64.012 → 30.939 char (≈16.000 → ≈7.700 token)**; muatan sesi client
  total 17.722 → 9.090 token (**hemat ≈8.632 token/sesi, −48,7%**). Keputusan owner: hanya 8 fungsi
  favorit + penopang + kerangka pemicu yang dimuat tiap sesi; badan 14 seksi (§4.3b · §4.7 · §4.10 ·
  §4.11 · §5 · §7 · §8 · §8.1 · §9 · §10 · §11 · §12 · §14.1 · §15 sepuluh-ide) pindah ke rumah
  on-demand yang sudah ada (`rules/` + `skills/`, ADR-024/027) + **Tabel-Pemicu baru di §4.13**.
  Susunan diurut prioritas (terpenting di atas), gaya telegram; §4.1 Tinjauan Divisi TIDAK diubah;
  semua nomor seksi + frasa terkunci tes dipertahankan (simulasi dispatcher byte-identik).
- **Adapter ikut ramping + Codex AKTIF:** Kimi 66.311 → 32.744 byte · Cursor 33.049 byte · blok
  Codex di `AGENTS.md` akar **tertulis untuk pertama kalinya** (32.601 byte ≤ gerbang 32 KiB —
  sebelumnya DITAHAN total, client jalur Codex dapat nol aturan). Catatan: client dengan `AGENTS.md`
  besar masih bisa tertahan gerbang gabungan (dinilai jujur per-client saat `update`; ADR-030).
- Titik pemulihan isi lama: commit `385028c` (riwayat git = arsip; detail + batas jujur di ADR-030).

### Dihapus — [BREAKING] Perampingan fitur non-inti: kit fokus "bangun website & aplikasi yang kuat" (ADR-029)

> **Kenapa (bahasa sehari-hari):** kit menumpuk fitur yang tidak langsung membantu AI membangun
> website/aplikasi — panduan kerja-kelompok, integrasi Discord, dokumen cara-install berlapis,
> perpustakaan prompt raksasa. Makin banyak lemari, makin berat dirawat. Owner memutuskan: buang
> yang tidak menunjang tujuan inti, supaya kit ringan + mudah di-maintenance. **37 skill (manfaat
> utama untuk client) TIDAK disentuh sama sekali.**

- **Fitur kerja-kelompok DICABUT utuh:** perintah `team-setup` + `protect-main`, pembuat
  `.github/staff-roster.yml`, dan 11 berkas tim ter-deploy (`TEAMWORK_GUIDE`, `CLAUDE_TEAM_GUIDE`,
  `TEAM_FLOW_SKETCH`, `ONBOARDING`, `TEAM_ROLLOUT_GUIDE`, template `CODEOWNERS` + template PR,
  robot `ai-review.yml`+`.cjs`, `audit-access.yml`, `DISCORD_BOT_INTEGRATION`). **Prinsip kerja
  tim TETAP di aturan** (§11: kerja bareng >1 orang = branch sendiri → PR → review) — yang dicabut
  alat + dokumennya. Kunci branch `main` kini langkah manual owner: GitHub **Settings → Branches →
  Add branch protection rule**.
- **Dokumen install & pustaka DICABUT:** `MULAI_DI_SINI.md` (install kini cukup
  `npm create lintasai`, README) · `templates/MCP_SETUP.md` 63KB (esensi keamanan DB pindah rumah:
  `skills/database` role tiering §9 + `SAFE_DATABASE_OPERATIONS` + `RLS_SETUP_PROMPT`) ·
  `templates/PROMPT_LIBRARY.md` 46KB (tabel intent→pola kerja di `rules/4.2-pattern-driven.md`
  kini KANON mandiri — staff cukup chat natural) · `templates/RULES_COMPLIANCE_TEST.md` (uji
  kepatuhan kini on-demand lewat chat, cara di `rules/4.6-6.3-efficiency-doctrine.md`).
- **CLI warisan DICABUT:** `migrate-project-card` (migrator kartu `.psd1` era-PowerShell; klien
  era-v1 → migrasi via `npx lintasai@2.9.0` atau tulis `.jsonc` manual) + alias deprecated
  `kimi-sync` (pakai `adapter-sync`). 4 rencana internal `docs/plans/` usang ikut dihapus
  (tak pernah dikirim npm).
- **Yang DIPERTAHANKAN (keputusan eksplisit owner):** sistem pelajaran §6.4 Buku Pelajaran +
  §6.5 Rekam Pelajaran UTUH · **SEMUA adapter AI** (Claude Code / Kimi / Codex / Cursor — arah
  produk multi-harness, memperluas ADR-018) · keluarga pecah-repo · 37 skill · dokumen keamanan
  (`SECURITY_INCIDENT_PLAYBOOK`, `THREAT_MODEL`, `secret-guard.yml`, `backup-schemas.yml`).
- **Penjaga BARU (perampingan tak melemahkan pagar):** robot `tool-reach-check` mengenali gagang
  ke-4 `spawn` (perkakas yang dijalankan robot lain sebagai proses anak — kasus nyata
  `migration-state.mjs` dipakai doctor) + 2 entri istilah-pensiun (`fitur-tim-dihapus` +
  `pustaka-install-dihapus`) menolak rujukan fitur terhapus menyelinap balik. Angka fakta
  "file tim" installer: 32/7/25 → **21/2/19** (dijaga robot consistency-check).

**Migration Steps (klien 2.9.0 → 3.0.0):**
1. `npx lintasai@latest update` seperti biasa — isi `.claude-kit/` diganti utuh (backup otomatis
   ber-cap-waktu), struktur `lib/`→`engine/` dibetulkan otomatis.
2. Salinan dokumen tim lama di project-mu (`docs/TEAMWORK_GUIDE.md`, `docs/PROMPT_LIBRARY.md`,
   `docs/MCP_SETUP.md`, `.github/CODEOWNERS`, `.github/workflows/ai-review.yml`, dll) **TIDAK
   dihapus otomatis** — daftar lengkap + boleh-hapus-manual: `UPGRADING.md` bagian "Fitur yang
   DICABUT". Membiarkannya tidak merusak apa pun.
3. Skrip/kebiasaan yang memanggil `team-setup` / `protect-main` / `migrate-project-card` /
   `kimi-sync` akan dapat "Unknown command" — padanannya di `UPGRADING.md`.
4. SIMULASI dulu kalau ragu: `npx lintasai@latest update` menampilkan rencana + backup sebelum
   mengubah apa pun; rollback 1-baris ada di `UPGRADING.md`.

### Diubah (repo-dev, tanpa dampak client) — rapikan `docs/plans/`: arsip → hapus 6 rencana usang + provenance ke ADR + refactor ringan

> **Kenapa (bahasa sehari-hari):** Folder `docs/plans/` (rencana kerja internal repo-dev) menumpuk dokumen yang sudah selesai/tergantikan → repo makin sesak & sulit dirawat. Dibersihkan lewat proses 2 tahap yang aman (arsip dulu → buktikan hijau → baru hapus). **Nol dampak ke client** (folder ini memang tak pernah ikut ke paket npm) dan **bukan** penghematan token AI (aturan yang dimuat tiap sesi tak berubah) — murni kerapian + navigasi/maintenance lebih cepat.

- **Dihapus 6 rencana usang** dari `docs/plans/`: klaster migrasi PowerShell→Node yang tuntas di v2.0.0 (`RENCANA_V2_HAPUS_POWERSHELL.md`, `migrasi-powershell-ke-node.md`, `migrasi-cetak-biru-implementasi.md`, `keputusan-per-elemen-node-vs-ps.md`, `migrasi-besar-node-program.md`) + `KONSEP_NAVIGASI_WORKFLOWS_v1.md` (konsep navigasi lama, tergantikan skills ADR-027). Isi terjaga di git history.
- **Provenance dialihkan ke ADR permanen:** 10 komentar di `engine/*.mjs` + `tests/*` + `setup-pola-b.ps1` yang tadinya menunjuk berkas-berkas itu kini menunjuk ADR-003/004/007 → tak menggantung. Komentar-saja, 0 baris logika.
- **Refactor ringan (behavior-preserving):** hapus konstanta mati `PLACEHOLDER_LITERAL` (`engine/feedback-scrub.mjs`; 0 rujukan, ditandai ESLint `no-unused-vars`) + betulkan 4 komentar basi `lib/*.mjs` → `engine/*.mjs` (sisa rename `lib`→`engine` ADR-027) di `feedback-scrub`/`capture`/`aggregate` + `lang-reminder`.
- **Gerbang: tes 1639/0 hijau (sebelum & sesudah) + preflight `--strict` LULUS (GENTING 0 / PENTING 0) + rules-ref-check 0 path-putus baru.** 0 baris logika berubah.

### Ditambahkan — "KENAPA-singkat" di tiap langkah AI (ADR-028): narasi/to-do/jawaban-akhir/popup jelaskan maksud + kenapa

> **Kenapa (bahasa sehari-hari):** Saat AI kerja, layar menampilkan langkah-langkah (daftar *to-do* = daftar langkah kerja + *narasi antar-langkah* = kalimat AI di sela pemanggilan alat) yang sering penuh istilah pemrograman mentah (`runWorkflowsRefCheck`, `libDir`, "dispatcher"). Mayoritas staff client = non-programmer yang mengerjakan proyek **website + aplikasi** → tak paham konteksnya, jadi tak bisa ikut belajar naik kelas (non-programmer → junior → senior). Sekarang tiap langkah/pilihan wajib menyertakan **"mau ngapain + KENAPA singkat"** (istilah dipertahankan + arti awam + 1 alasan pendek), gaya RINGKAS supaya tetap hemat token.

- **Aturan §2.1.1 dipertajam** (`CLAUDE_universal_v1.md`): **prinsip payung "KENAPA-singkat"** lintas 5 kategori PRE-SEND + Kat #1 (narasi antar-tool) / #2 (to-do) / #3 (jawaban akhir) / #5 (popup) kini wajibkan komponen "kenapa". **Pagar anti-upacara:** 1 klausa PENDEK **inline**, **DILARANG jadi blok penutup terpisah** (beda dari §4.1b Blok Belajar yang dicabut ADR-026), boleh menyusut hampir-nol untuk task sepele, dan dibedakan tegas dari "laporan proses" (§1/§4.1) & "dapur internal AI" (§2.1 poin 6).
- **Pengingat per-giliran** (`engine/lang-reminder.mjs`) memuat mandat baru — **dipadatkan ulang tetap ~5 baris** (biaya token per-prompt nyaris tak berubah); dicetak TIAP prompt tanpa syarat → berlaku untuk **prompt natural apa pun**. Adapter Kimi ikut otomatis lewat `buildReminder()`.
- **Default nyala semua client** (bukan opt-in) — sampai via `CLAUDE_universal_v1.md` (Claude `@import`) + hook `lang-reminder` (disalin + wire; Kimi/Cursor regenerate/salin).
- **Audit konflik 2-sudut → NOL aturan dihapus** (nol bentrok keras; fitur malah sudah didasari §2.1 Term-First [ADR-025] + §2.1.1 Kat#2 + §14.1 popup + tie-breaker §0 yang menaruh "mudah dipahami" di atas hemat-token). Keputusan penuh + pagar desain: ADR-028 (repo-dev, dirujuk telanjang dari aturan client).
- **Penjaga permanen (§6.4):** assertion baru di `tests/lang-reminder.test.mjs` (pengingat memuat "kenapa") + `tests/tingkat1-guard.test.mjs` (§2.1.1 memuat prinsip KENAPA-singkat) — fitur tak bisa hilang diam-diam saat disunting.
- **Berkas:** `CLAUDE_universal_v1.md` (§2.1.1) · `engine/lang-reminder.mjs` (blok bahasa + komentar) · `tests/lang-reminder.test.mjs` + `tests/tingkat1-guard.test.mjs` (penjaga) · `docs/decisions/ADR-028-kenapa-singkat-tiap-langkah.md` (baru) · `docs/decisions/README.md` (daftar ADR) · `package.json` files[] (negasi ADR-028 = repo-dev).
- **Gerbang: 1639 tes hijau (2 penjaga baru) + preflight LULUS (GENTING 0 / PENTING 0; RAPIKAN 3 template pra-existing tak terkait) + anggaran token aturan ~16.286/32.000 (aman, ~51%) + hook diverifikasi cetak "kenapa" + 3 jangkar bahasa utuh.**

### Ditambahkan — Skill DOMAIN judi/fintech (ADR-027 Task 18): `wallet-ledger` (buku besar saldo) + `anti-fraud` (deteksi kecurangan)

> **Kenapa (bahasa sehari-hari):** Setelah batch web-umum, geser ke DOMAIN inti tim. `wallet-ledger` = buku besar saldo internal (dompet user) untuk produk judi/fintech — **gap terkuat** (probe: 0 dari 6 konsep tercakup; `pembayaran` sendiri melempar rekonsiliasi keluar cakupan). Ini soal UANG: kalau saldo cuma "angka di satu kolom yang di-edit", satu bug/serangan = uang hilang atau tercipta dari udara.

- **Skill baru** `skills/wallet-ledger/SKILL.md` (`rawan_keamanan: true` → 🔒, divisi keamanan). Isi kelas-industri: **double-entry append-only** (saldo = turunan buku besar, bukan kolom bebas-edit) + **atomik** (entri+saldo 1 transaksi) + **anti saldo-minus** (`CHECK`, hanya akun user) + **anti-race** (`FOR UPDATE`/update-bersyarat cek rowcount + **CTE** yang mengikat entri ke debit) + **idempoten** (`UNIQUE` idempotency-key) + **penarikan state-machine + hold + reversal** (beda dari deposit) + **uang integer** (bukan float) + **rekonsiliasi** (trial-balance Σ=0). Beda tegas dari `skills/pembayaran/SKILL.md` (uang eksternal gateway).
- **Diverifikasi adversarial** (agen pemeriksa read-only, §8.2 Aturan 3): **0 kesalahan konsep**; 2 titik pengerasan ditutup sebelum commit — (a) contoh SQL diubah ke **CTE** supaya entri hanya tercipta bila debit berhasil (anti "entri-hantu" yang lolos trial-balance Σ=0, hanya tertangkap rekonsiliasi per-akun), (b) peringatan `CHECK(saldo>=0)` dikecualikan untuk akun house/suspense.
- **Skill baru** `skills/anti-fraud/SKILL.md` (`rawan_keamanan: true` → 🔒, divisi keamanan; ditulis dari nol). Isi kelas-industri: evaluasi **server-side** (sinyal klien bisa dipalsukan) + **aksi bertingkat** (`allow`/`challenge`/`hold-review`/`block`, bukan biner buta) + **rules-engine bisa-dijelaskan** (bukan kotak-hitam ML — explainability untuk regulator/dispute) + **sinyal berlapis** (device-fingerprint/IP-VPN/velocity/graph-link/payment) + **reason-code + audit-trail** tiap keputusan + seimbang **anti false-positive** (ragu → challenge/review, bukan auto-block; pantau false-positive rate) + **jangan bocorkan logika deteksi** ke pelaku + **privasi & anti-bias** (data device/perilaku = data pribadi; hindari fitur proxy-diskriminasi). Melengkapi trio `wallet-ledger` + `anti-fraud` + `audit-trail` (fondasi keamanan-finansial teregulasi).
- **Registry 35 → 37 skill.** POLA ATOMIK 5-titik. Aditif murni (tak sentuh kernel).
- **Berkas:** `skills/wallet-ledger/SKILL.md` + `skills/anti-fraud/SKILL.md` (baru) · `skills/registry.json` · `PETA.md` · `engine/kit-files.json`.
- **Gerbang: 1638 tes hijau + preflight LULUS (Format skill: 37 OK · registry+PETA sinkron · GENTING 0/PENTING 0) + rules-ref-check 0/0 (RAPIKAN 3 template pra-existing) + uji hook (🔒 wallet-ledger, 🔒 anti-fraud menyala).** Catatan: 1 tes flaky muncul sekali (di gerbang wallet-ledger) lalu hilang di run berikut (tak terkait skill; kandidat investigasi terpisah §6.4).

### Ditambahkan — Skill web-umum baru (ADR-027 Task 18, bertahap): `rate-limiting` + `caching` + `realtime` + `admin-panel`

> **Kenapa (bahasa sehari-hari):** Task 18 = menambah "buku panduan" (skill) untuk menutup kebutuhan nyata produk tim. Owner memilih **fokus GAP nyata (~8-15 skill), BUKAN mengejar angka 100** (angka 100 = daya-tampung arsitektur, bukan kuota belanja) + mulai dari topik **web/app umum** + tempo **"satu dulu, lihat hasil, baru lanjut"**. Skill pertama = `rate-limiting`: cara membatasi jumlah permintaan supaya endpoint sensitif (login, OTP, tarik-dana) tak bisa dijebol dengan tebak-berulang (*brute-force* = tebak password/kode berkali-kali sampai jebol) atau di-spam.

- **Skill baru** `skills/rate-limiting/SKILL.md` (`rawan_keamanan: true` → ditandai 🔒 di dispatcher). Isi kelas-industri: penghitung permintaan di penyimpanan **TERBAGI** (Redis/edge, bukan memori proses yang bocor antar-server) · kunci per-**identitas tepat** (login = per-akun **dan** per-IP, bukan IP saja) · operasi hitung **ATOMIK** (anti *race condition* = dua permintaan balapan menembus batas) · balas **429 + `Retry-After`** · endpoint sensitif + lockout/captcha + tak membocorkan akun terdaftar · **fail-open vs fail-closed** ditentukan sadar · contoh Lua atomik Redis (ambil polanya) · threat-model + batas jujur ("bukan anti-DDoS penuh").
- **`caching`** (skill #33, `rawan_keamanan: false` — optimasi kecepatan, bukan kontrol keamanan) `skills/caching/SKILL.md` — simpan-sementara hasil mahal TANPA menyajikan data basi/bocor: wajib **TTL** (masa berlaku) + **invalidasi** saat sumber berubah + **anti cache-stampede** (lock / *stale-while-revalidate* = sajikan basi sesaat sambil refresh di latar) + **kunci per-identitas** (data user A tak bocor ke user B — jebakan keamanan senyap, ditandai 🔒 di butirnya + rujuk `auth`/`owasp`) + jangan cache saldo/stok/harga-bayar tanpa invalidasi ketat + **fail-open** saat cache mati. Contoh cache-aside + SWR + single-flight.
- **`realtime`** (skill #34, `rawan_keamanan: true` → 🔒) `skills/realtime/SKILL.md` — update langsung (chat/notif/live-betting/saldo hidup): **otorisasi per-kanal di server** (anti-nguping) + anti-**CSWSH** (*Cross-Site WebSocket Hijacking*; validasi `Origin`/token, bukan cookie) + **filter per-penerima** + **reconnect+resync** (anti data-basi) + hosting koneksi-panjang tepat (serverless TAK cocok untuk WebSocket) + heartbeat/backpressure. Dibangun dari draft arsip lama (dulu dipensiun) + rujukan direpoint `cap/*`→`skills/*`.
- **`admin-panel`** (skill #35, `rawan_keamanan: true` → 🔒) `skills/admin-panel/SKILL.md` — panel back-office/kelola-data (daftar transaksi, kelola user): **otorisasi per-baris & per-aksi** (anti-**IDOR** admin) + **audit-trail append-only** (who/what/when/before→after; wajib judi/fintech, ditulis se-transaksi) + data sensitif **masking** + **paginasi keyset** (bukan `OFFSET` besar) + aksi destruktif **konfirmasi/soft-delete/idempoten** + **optimistic concurrency** (dua admin tak saling timpa diam) + akun admin **2FA/least-privilege**.
- **Registry 31 → 35 skill** (regen otomatis dari disk oleh `skill-registry.mjs`; dijamin sinkron oleh `checkRegistryDrift`). `PETA.md` ikut ter-update (35 skill). Terdaftar di `engine/kit-files.json` grup `skills` → ikut terkirim ke client. **Batch web-umum tuntas** (4 skill); berikutnya geser ke domain judi/fintech.
- **Aditif murni** — TAK menyentuh kernel `CLAUDE_universal_v1.md` (tak perlu regen adapter / locked-phrases). Dispatcher registry otomatis menyalakan skill dari pemicu; diuji: prompt fokus "throttle anti-spam / too-many-requests" → `🔒 rate-limiting` menyala tepat.
- **Catatan (bukan regresi):** di prompt yang menyentuh BANYAK topik keamanan sekaligus (login+endpoint+rate-limit), plafon `MAKS_GRUP=3` ("tampilkan 3 panduan teratas biar tak kebanjiran") bisa memotong skill yang kalah urutan alfabet — perilaku **existing sejak Task 11**, bukan dari skill ini. Ditawarkan ke owner sebagai perbaikan terpisah (prioritas-relevansi vs alfabet).
- **Berkas:** `skills/rate-limiting/SKILL.md` + `skills/caching/SKILL.md` + `skills/realtime/SKILL.md` + `skills/admin-panel/SKILL.md` (baru) · `skills/registry.json` · `PETA.md` · `engine/kit-files.json`.
- **Gerbang (tiap skill): 1638 tes hijau + preflight LULUS (Format skill: 35 diperiksa semua ber-frontmatter+🔒+DoD · Registry sinkron · PETA sinkron · GENTING 0 / PENTING 0) + rules-ref-check 0/0 (RAPIKAN 3 template pra-existing) + uji hook dispatcher (skill menyala di prompt fokus: `🔒 rate-limiting`, `caching`, `🔒 realtime`, `🔒 admin-panel`).**

### Diubah — [BREAKING] Rename-sweep nama warisan: perintah `kimi-sync` → `adapter-sync` + berkas generator + nama internal (ADR-027 Task 17)

> **Kenapa (bahasa sehari-hari):** setelah Task 12-16, sebagian NAMA masih memakai istilah lama yang tak lagi cocok dengan isinya. Contoh terbesar: berkas `kimi-agents-gen.mjs` + perintah `kimi-sync` — dulu cuma untuk Kimi, kini melayani **3 alat AI** (Kimi + Cursor + Codex), tapi namanya masih "kimi". Task 17 merapikan nama-nama warisan itu supaya nama cocok dengan fungsinya — biar pembaca kode berikutnya tak salah paham, dan perintah tak menyesatkan.

- **Perintah & berkas payung 3-adapter dinetralkan:** `kimi-sync` → **`adapter-sync`** (kini benar-benar sinkron Kimi+Cursor+Codex sekaligus, bukan cuma Kimi); berkas `engine/kimi-agents-gen.mjs` → `engine/adapter-rules-gen.mjs` (+ tesnya, via `git mv` → riwayat terjaga). **Alias `kimi-sync` MASIH JALAN** (cetak 1 baris pengingat deprecated) → kebiasaan/skrip lama tak putus.
- **Nama per-alat SENGAJA dipertahankan (bukan warisan):** `runKimiAgentsGen`/`runCursorRulesGen`/`runCodexAgentsGen` + penanda `KIMI_AGENTS_MARKER` — masing-masing memang generator alat berbeda; menetralkan hanya Kimi malah jadi tak konsisten. Yang dinetralkan cuma **nama berkas payung + perintah**.
- **Orkestrator baru `runAllAdaptersSync`** (testable): `adapter-sync` menyinkronkan/mengecek 3 berkas aturan adapter sekaligus + lapor status masing-masing (Codex tetap digerbang 32 KiB — ditahan kalau aturan tak muat).
- **Nama internal warisan Task-13 dirapikan:** robot `rules-ref-check.mjs` yang isinya masih penuh `analyzeWorkflows`/`runWorkflowsRefCheck`/`wfDir` (padahal folder sudah `rules/`) → `analyzeRules`/`runRulesRefCheck`/`rulesDir`; langkah preflight `checkWorkflowsRefs` → `checkRulesRefs`; variabel `libDir` yang isinya `engine/` → `engineDir` di 5 berkas; label/pesan konsol "workflows"/"lib/" → "rules"/"engine".
- **Bug warisan Task-13 ketemu + diperbaiki:** `tests/fs-text.test.mjs` merakit path pemindaian dengan folder `'lib'` yang **sudah tak ada** (rename Task 13) → pemindai fungsi-kembar diam-diam MELEWATKAN semua berkas `engine/`. Diperbaiki (`'lib'`→`'engine'`); guard kini benar-benar aktif (tetap hijau = tak ada duplikasi tersembunyi).
- **Yang SENGAJA DIBIARKAN (terverifikasi bukan warisan):** label grup `node_lib`/`lib_files` di `kit-files.json` (keputusan Task 13) · fallback klien-lama `['','lib','engine']` di doctor/rollback · berkas pengalih `LINTASAI_WORKFLOWS_v1.md` (nama historis supaya rujukan lama tetap ketemu) · rujukan sejarah di CHANGELOG/ADR.
- **Berkas:** `engine/adapter-rules-gen.mjs` (rename + orkestrator) · `bin/lintasai.js` (perintah + alias + help + peringatan) · `engine/{setup-hooks,kit-doctor-checks,kit-files.json,rules-ref-check,tool-reach-check,output-lang-check}` · `tests/{adapter-rules-gen,rules-refs,preflight,kit-files,fs-text,no-duplicate-functions,skills-divisi,mode-hemat-guard,modify-workflow-rule}` · `.gitignore` · `KIMI_CODE_SETUP.md` · `UPGRADING.md`.
- **Gerbang: 1638 tes hijau + preflight LULUS (GENTING 0 / PENTING 0 / RAPIKAN 1) + rules-ref-check 0/0 (RAPIKAN 3 template pra-existing) + hook lang-reminder OK + smoke-test `adapter-sync --write` (3 adapter) & alias `kimi-sync` (peringatan deprecated) jalan end-to-end.**

### Ditambah — Tiap asisten AI (Claude/Codex/Cursor/Kimi) diarahkan baca PETA.md dulu (ADR-027 Task 16)

> **Kenapa (bahasa sehari-hari):** kit dipakai lewat beberapa asisten AI, dan tiap asisten mencari "buku panduannya" di tempat + nama berkas berbeda (Claude → `CLAUDE.md`, Codex → `AGENTS.md`, Cursor → `.cursor/rules/`, Kimi → `.kimi-code/AGENTS.md`). Semua "pintu masuk" itu sudah mengarah ke aturan yang sama, TAPI belum satu pun yang menunjuk `PETA.md` (peta "apa di mana" yang dibuat di Task 15). Task 16 menempel penunjuk **"baca PETA.md dulu"** di tiap pintu masuk — jadi pakai asisten mana pun, AI tahu letak segala sesuatu sebelum mulai (di harness tanpa hook sekalipun, navigasi manual lewat PETA tetap jalan: nol crash, cuma kurang otomatis).

- **Penunjuk PETA dirujuk (bukan disalin) — anti-basi:** penunjuk memakai **path** `PETA.md` (di repo kit) / `.claude-kit/PETA.md` (di dalam project client), bukan menyalin isi PETA. Alasan: `PETA.md` dibuat otomatis + berubah tiap folder/skill berubah; salinan cepat basi (lawan tujuan Task 15). Konsisten dengan cara header adapter sudah merujuk `rules/INDEX.md`.
- **Di mana ditempel:** header 3 generator adapter (`engine/kimi-agents-gen.mjs`: `buildKimiAgents`/`buildCursorRules`/`buildCodexAgents`, path ikut `kitPrefix`) + loader `CLAUDE.md` (repo kit) + `CLAUDE.md.template` (client Claude) + `AGENTS.md.template` (client Codex). Cursor tambahan `@.claude-kit/PETA.md` (mekanisme native Cursor menarik isi berkas sebagai konteks).
- **Temuan saat mengaudit:** generator Cursor + Codex ternyata **sudah dibangun** (Task 10/ADR-024) dan sudah tersambung ke install/update/doctor/tes — yang benar-benar kurang cuma penunjuk PETA. Jadi Task 16 = tambah penunjuk + tes penjaga, bukan bangun generator baru.
- **Codex tetap digerbang jujur:** Codex membatasi berkas aturan project 32 KiB (`project_doc_max_bytes`); aturan kit 63,9 KiB (2× batas) → penulisan **ditahan** (AGENTS.md client TIDAK disentuh, `doctor` lapor terus terang). Ini fail-safe yang sudah benar: aturan terpotong diam-diam lebih berbahaya daripada aturan yang jelas belum terpasang. Begitu inti diramping <32 KiB di fase lain, Codex otomatis dapat aturan penuh — penunjuk PETA sudah terpasang menunggu.
- **Riset Cursor (sumber resmi cursor.com/docs):** `.cursor/rules/*.mdc` + frontmatter `alwaysApply: true` adalah format RESMI & terkini; `.cursorrules` (file tunggal lama) **deprecated** — format yang sudah dibangun generator sudah benar.
- **Berkas:** `engine/kimi-agents-gen.mjs` (3 header) · `CLAUDE.md` · `CLAUDE.md.template` · `AGENTS.md.template` · `tests/kimi-agents-gen.test.mjs` (+3 tes penjaga: penunjuk PETA di 3 adapter, path root-vs-client, Cursor @-ref) + regen `.kimi-code/AGENTS.md` & `.cursor/rules/lintasai.mdc` (gitignored, dogfood). **Gerbang: 1637 tes hijau + preflight LULUS (GENTING 0 / PENTING 0 / RAPIKAN 1) + ref-check 0/0 + uji hook lang-reminder OK.**

### Ditambah — PETA.md: peta "apa di mana" + aturan penempatan berkas baru, auto-generate & anti-basi (ADR-027 Task 15)

> **Kenapa (bahasa sehari-hari):** kit punya banyak "daftar" terpisah (folder, skill, rak, robot). Belum ada SATU peta yang AI baca PERTAMA untuk tahu "apa di mana" + ke mana menaruh berkas baru (struktur-hygiene = kebiasaan menaruh tiap berkas di rumah yang benar). `PETA.md` mengisi itu — dibuat **otomatis** oleh robot dari kenyataan folder + daftar skill, jadi **tak bisa basi** (kalau melenceng dari kenyataan disk, gerbang pra-rilis memerah).

- **Robot generator (baru):** `engine/peta-gen.mjs` (`npx lintasai peta-gen`) memindai folder top-level + `skills/` → menulis `PETA.md`. Deterministik (hasil selalu sama dari isi sama; folder + skill di-sort, tak ada waktu/acak) — syarat wajib supaya bisa dijaga anti-basi. Pola KEMBAR `engine/skill-registry.mjs` (yang menulis `registry.json`).
- **Isi PETA.md:** (1) tabel folder + fungsi + kolom "Di `.claude-kit/` klien?" — kolom itu **di-derive dari `package.json` files[]** (sumber kebenaran "apa yang dikirim"), bukan tebakan yang bisa basi; (2) tabel 31 skill (divisi + pemicu + 🔒 penanda rawan-keamanan) dari `registry.json`; (3) aturan penempatan berkas baru per jenis (skill/rak/robot/tes/template/dokumen/berkas-root + cara mendaftarkannya); (4) rujuk-silang ke peta lain — MELENGKAPI, tak menyalin: `docs/architecture.md` (narasi makro), `docs/PETA_SUMBER_KEBENARAN.md` (fakta/angka, ditandai **INTERNAL — tak ikut ke client** supaya tak jadi rujukan mati di client), `docs/RESEP_PERUBAHAN.md`, `rules/INDEX.md`.
- **Guard anti-basi (celah ③ ADR-027 "PETA auto-generate + anti-basi"):** `checkPetaDrift` di `tests/preflight.mjs` — bandingkan `PETA.md` dengan hasil generate-ulang (ternormalisasi BOM/CRLF supaya checkout Windows tak memicu drift palsu); melenceng → **PENTING** (blokir `--strict`); `PETA.md` tak ada (mis. di project klien, petanya ada di `.claude-kit/` bukan akar project) → dilewati (INFO). Pola KEMBAR `checkRegistryDrift`. + tes `tests/peta-gen.test.mjs` (unit generator + anti-drift disk==generate + wiring gagang gerbang).
- **Ikut dikirim ke client:** `PETA.md` didaftar di grup `meta` `engine/kit-files.json` + `package.json` files[]; generatornya `engine/peta-gen.mjs` di grup `node_lib` (dijaga tes anti-drift `node_lib == disk`).
- **Verifikasi adversarial (Workflow 4-pemeriksa cuma-baca) menangkap 1 PENTING sebelum commit:** kolom "Di `.claude-kit/` klien?" semula menandai `bin/`+`tests/` "hanya repo kit" — **SALAH** (keduanya ada di `package.json` files[] → benar-benar mendarat di `.claude-kit/` klien, dibuktikan pada 3 project klien nyata). Diperbaiki: kolom kini **di-derive dari files[]** + tes penjaga permanen (`bin` IKUT client). Gerbang deterministik tak menangkap ini (tak ada tes akurasi-semantik) — inilah nilai nyata verifikasi adversarial.
- **Berkas:** `engine/peta-gen.mjs` (baru), `PETA.md` (baru, generated), `tests/peta-gen.test.mjs` (baru), `tests/preflight.mjs` (`checkPetaDrift`), `bin/lintasai.js` (perintah `peta-gen`), `engine/kit-files.json` (grup meta + node_lib), `package.json` (files[]). **Gerbang: 1634 tes hijau + preflight LULUS (GENTING 0 / PENTING 0 / RAPIKAN 1) + ref-check 0/0 + uji hook lang-reminder OK.**

### Ditambah — Update mulus untuk client lama: migrasi struktur otomatis (ADR-027 Task 14)

> **Kenapa (bahasa sehari-hari):** Task 13 mengganti nama folder robot dari `lib/` ke `engine/`. Client lama (v1/v2) menyimpan "alamat" robot itu di berkas pengaturan `.claude/settings.json` (baris perintah `hook` = otomatisasi yang jalan sendiri). Setelah update, alamat lama `.claude-kit/lib/...` jadi salah (folder-nya sudah pindah ke cadangan) → hook **mati diam-diam**. Task 14 membetulkan alamat itu **otomatis** saat `npx lintasai update`, jadi client lama naik ke v3.0.0 tanpa hook mati. **Inilah yang membuat rename Task 13 aman dirilis.**

- **Yang dibetulkan otomatis (ber-backup):** command hook di `.claude/settings.json` + `.claude/settings.local.json` — segmen path `.claude-kit/lib/` → `.claude-kit/engine/` dan `.claude-kit/workflows/` → `.claude-kit/rules/`. Dijalankan di `update-kit.mjs` **Langkah 3b** (setelah kit baru terpasang, SEBELUM pemasang `setup-pola-b`) — kalau ditaruh sesudahnya, robot pemasang-hook keburu menganggap hook "sudah ada" (penandanya **nama-berkas**, buta segmen path) → alamat basi tak pernah dibetulkan.
- **Aman untuk berkas yang sudah dikustom client:** penggantian **surgical** (cuma segmen path yang berubah; formatting + semua kunci user 100% utuh) + **backup ber-timestamp** (`settings.json.backup-<yyyyMMdd-HHmmss>`, bukan `.bak`) + validasi JSON dua kali (rusak/terkunci → berkas **TIDAK disentuh**, dilaporkan) + tulis atomik. Anchor `.claude-kit/` membuat folder `lib/` milik project client sendiri (`src/lib`, `@/lib`) **tak pernah** ikut kena.
- **IDEMPOTEN:** tak ada pola lama → **no-op** senyap (aman dijalankan berulang; aman pula pada client yang sudah v3). Tak perlu buku-besar `.migration-state.json` (itu untuk artefak ber-`schema_version`; `settings.json` bukan itu).
- **Dokumen client = LAPOR-saja (tidak diubah otomatis):** `AGENTS.md`/`CLAUDE.md`/`docs/*.md` yang memuat rujukan path lama hanya **dilaporkan** (artefak sering-dikustom + rujukan dokumentatif; basi tak merusak fungsi). Owner yang memutuskan membetulkannya. `@import` kit standar menunjuk akar `.claude-kit/CLAUDE_universal_v1.md` (tak terpengaruh rename), jadi tak perlu di-rewrite.
- **Celah ⑤ ADR-027 ditutup penuh:** guard coverage+no-bloat (disk↔manifest↔tarball + tarball <1,25 MB) sudah ada sejak F1; sisa yang kurang = guard **dilarang-pangkas `RAK_PEMICU`** (jaring pengaman `SHIM` fallback untuk client kit-lama). Kini dikunci: id-topik keselamatan inti (auth/bayar/upload/DB/teregulasi/rilis) WAJIB tetap ada — mempensiunkannya harus keputusan **sadar**, bukan senyap.
- **Berkas:** `engine/migrate-client-struktur.mjs` (baru), `update-kit.mjs` (Langkah 3b), `engine/kit-files.json` (daftar modul), `tests/migrasi-struktur-client.test.mjs` (baru), `tests/rak-pemicu.test.mjs` (guard celah ⑤) + rapikan komentar basi `.claude-kit/lib/` di `engine/ensure-*-hook.mjs` · `lang-hook-wiring.mjs` · `rollback.mjs` · `project-root.mjs` · `install-secret-hook.mjs`. **Gerbang: 1622 tes hijau + preflight LULUS (GENTING 0 / PENTING 0) + ref-check 0/0 + uji hook lang-reminder OK.**

### Diubah — [BREAKING] Struktur folder kit: `workflows/` → `rules/` dan `lib/` → `engine/` (ADR-027 Task 13)

> **Kenapa (bahasa sehari-hari):** dua folder inti kit ganti nama supaya isinya jelas dari namanya. `workflows/` (rak = panduan aturan on-demand yang dibaca saat relevan) jadi `rules/`; `lib/` (kumpulan robot pendukung berkas `.mjs`) jadi `engine/`. **Isi & fungsi TIDAK berubah — cuma nama rumahnya.** Alasan lengkap = [ADR-027](docs/decisions/ADR-027-microkernel-plugin-skills.md).

- **Apa yang berubah:** folder `.claude-kit/workflows/` → `.claude-kit/rules/`, dan `.claude-kit/lib/` (tempat robot `.mjs`) → `.claude-kit/engine/`. Grup `"workflows"` di `engine/kit-files.json` → `"rules"`. Robot `workflows-ref-check.mjs` (penjaga rujukan rak) di-rename → `engine/rules-ref-check.mjs` (namanya kini cocok dengan folder yang dijaganya); tesnya → `tests/rules-refs.test.mjs`.
- **Yang SENGAJA TIDAK tersentuh:** folder `.github/workflows/` (GitHub Actions = pipeline CI di server GitHub) TETAP — itu milik GitHub, bukan folder kit. Konvensi folder `lib/` milik project client (mis. `src/lib/`, `@/lib/db` di Next.js) juga TIDAK diubah — penggantian `lib/` dibatasi daftar-nama robot kit (allowlist), jadi tak menyentuh kode client.
- **Migrasi client (KINI MENDARAT — lihat entri Task 14 di atas):** jalur `npx lintasai update` kini menulis-ulang command hook (`settings.json`) di project client lama secara otomatis, mendarat BERSAMA v3.0.0 di branch dev ini sebelum rilis npm — jadi client tak pernah melihat kondisi setengah. `readKitManifest` juga tetap punya fallback (`engine/` → `lib/` → `.psd1`) supaya v3 doctor bisa membaca client yang (karena apa pun) belum termigrasi penuh.
- **Berkas:** ~275 berkas di-repoint (kernel `CLAUDE_universal_v1.md`, `rules/INDEX.md`, hub `rules/*`, semua robot `engine/*.mjs`, tes, `package.json` "files", `engine/kit-files.json`, `.kimi-code/AGENTS.md` regen). **Gerbang: 1608 tes hijau + preflight LULUS (GENTING 0 / PENTING 0) + ref-check 0/0 + uji hook lang-reminder OK.**

### Ditambah — Panduan kit benar-benar dibuka sebelum menyentuh titik risiko (`Petunjuk Rak` + `Palang Rak`)

> **Masalahnya diukur dulu, bukan dikira-kira.** Enam prompt client nyata dijalankan; dari **56 panduan yang relevan, cuma 8 yang benar-benar dibuka (≈14%)** — dan untuk tugas ringan **0%**. Salah satu AI bahkan mengaku (kutipan apa adanya): *"aku diam-diam menafsirkan [8 divisi OTOMATIS] sebagai 'cukup dipikirkan di kepala, tak perlu dibaca berkasnya'"*. Akibat nyatanya terekam: satu AI menuduh **74 alamat API "tidak ada pengecekan hak akses"** — padahal semuanya memakai `withAuth`. Persis jenis kesalahan yang sudah ditulis di `workflows/8.2-3b-jangan-asal-flag.md`, panduan yang tak ia buka. Alasan lengkap = [ADR-022](docs/decisions/ADR-022-petunjuk-rak-dan-palang-rak.md).

- **Kenapa ini penting, bahasa sehari-hari:** aturan kit sudah lama bilang *"kalau panduan bentrok dengan kode nyata, kode yang menang"*. Kalimat itu cuma bermakna kalau **ada** bentrok — dan untuk bentrok, AI harus tahu isi panduannya. Angka 14% berarti 86% waktunya tak ada pertandingan sama sekali. Itu bukan AI yang menang, itu informasi yang tak pernah hadir.
- **`Petunjuk Rak` (default NYALA, tak pernah menghalangi).** Dari isi prompt, pengingat tiap giliran kini menyodorkan **alamat panduan** yang relevan — bukan cuma mengingatkan bahwa panduan itu ada. Sifatnya **menambah saja**: kalau tak ada yang cocok, keluarannya **sama persis sampai ke bytenya** dengan sebelumnya (dikunci tes). Tak ada satu pun lensa yang bisa hilang karena salah tebak.
- **`Palang Rak` (default MATI — nyalakan dengan `npx lintasai enable-rak-gate`).** Sebelum AI mengubah berkas penting (login, pembayaran, migrasi database, alamat API, unggah berkas) untuk **pertama kali dalam satu sesi**, ia ditahan sampai panduan terkait **benar-benar dibuka**.
- **🔑 Yang diperiksa = catatan pembacaan nyata, BUKAN klaim AI.** Ini pembedanya. Palang mencatat setiap kali berkas panduan dibuka, lalu mencocokkannya — jadi **tak bisa dilewati dengan kata-kata**. Alasannya teknis: hook penjaga cuma menerima nama alat + berkas, ia **tak pernah melihat tulisan AI**; jadi syarat "sebutkan panduan yang kau baca" mustahil diperiksa mesin, dan satu-satunya wujudnya adalah "tahan sekali, lalu izinkan apa pun". Lubang persis itu masih ada di Palang Fakta (`lib/fact-gate.mjs:96-99`) dan **tidak diulang** di sini.
- **🔑 Yang ditegakkan cuma "DIBACA", tak pernah "DIPATUHI".** Pesan palang **wajib** memuat kalimat *"bentrok dengan kenyataan kode → kenyataan kode MENANG (§4.17)"* — dikunci tes di Claude **dan** Kimi. Tanpa itu, palang perlahan terbaca sebagai "panduan = hukum", dan kit berubah dari perlengkapan jadi kerangkeng.
- **Anti-upacara:** maksimal **2× menahan per sesi**, berkas tes/hasil-build dilewati, dan mayoritas penyuntingan biasa **tak tersentuh sama sekali**. Buntu? Buka `workflows/INDEX.md` — itu jalan keluar yang sah.
- **Kimi Code ikut, dengan default yang sama.** `lib/kimi/rak-gate-kimi.mjs` **memakai ulang** otak keputusan yang sama (dikunci tes anti-salin — dua salinan bisa melenceng, lalu palang jadi bohong di salah satu otak). Palang sengaja **tidak** ikut bundel `enable-kimi-hooks`: kalau ikut, memilih Kimi berarti menyala diam-diam sementara pemakai Claude harus menyalakan sendiri. Satu perintah menyalakan keduanya.
- **Kenapa default MATI, padahal rencananya NYALA.** Menyalakan pemblokir untuk semua project mengubah perilaku kerja orang **sebelum** manfaatnya terukur. Nasib "dikirim tapi mati total" seperti Palang Fakta dicegah lewat **gagang**: perintah `enable-rak-gate` + robot `tool-reach-check` yang memerah kalau ada perkakas dikirim tanpa cara memanggilnya. Default dinyalakan **setelah** angka sesudah terbukti.
- **Cacat panduan yang ikut ketahuan (diperbaiki lebih dulu — memaksa membaca panduan yang salah = menyebarkan kesalahan):** `workflows/stack/4.14-2-supabase-prisma.md` mengklaim resepnya berlaku untuk "project APA PUN yang pakai Prisma", lalu mewajibkan `CREATE INDEX CONCURRENTLY` yang **khusus PostgreSQL** — project Prisma+MySQL yang menurut akan gagal migrasi. Ditambah catatan: ID acak `cuid()` **tidak boleh** dipakai untuk dokumen yang menurut aturan pembukuan wajib bernomor urut tanpa lompat (faktur/pajak). Panduan login juga ditambah 5 jebakan OAuth yang sebelumnya **nol** tercakup di seluruh kit (pengambilalihan akun lewat penautan email, `email_verified`, parameter `state`, PKCE, penguncian domain `hd`).
- **Bug yang cuma ketahuan saat dicoba sungguhan** (bukan dari tes satuan): alamat folder bergaya Linux di Windows (`/d/Users/...`) membuat seluruh panduan dianggap tak ada → **palang mati diam-diam tanpa satu pun tanda**. Kegagalan senyap seperti itulah yang menghasilkan angka 14% di awal. Diperbaiki + dikunci 2 tes.
- **Batas jujur — jangan diklaim lebih:** (1) ini pagar **kepatuhan**, bukan pagar **keamanan**; membaca lewat `Bash cat`/`Grep` tak dihitung dan tak dihalangi. (2) AI bisa saja membuka panduan **hanya untuk lolos palang** lalu mengabaikan isinya — jadi **jangan pakai persentase-dibaca sebagai bukti mutu**. (3) Angka 14% mengukur **frekuensi**, belum memisahkan "lalai" dari "sadar memutuskan melewatkan"; pengukuran ulang di project nyata **belum dikerjakan** dan itu syarat sebelum default dinyalakan.
- **📉 HASIL UKUR (2026-07-19) — bagian LUNAK-nya TIDAK bekerja, dan itu dicatat apa adanya.** Enam prompt dijalankan ulang di project klien nyata (mode aman cuma-baca, satu-satunya yang berubah = petunjuk disuntikkan): **8 → 9 dari 56 panduan dibuka.** Datar. Yang membunuh klaimnya: prompt yang naik paling tinggi (0→2) justru **sengaja tak diberi petunjuk sama sekali** — jadi kenaikannya variasi antar-AI, bukan efek fiturnya. Dua tugas berat malah TURUN, tapi keduanya melewatkan panduan **dengan bukti** (*"isi pengerasan login-nya sudah diterapkan, bukti `src/lib/auth.ts:104-182`; panduan itu lantai, dan lantainya sudah terlampaui"*) — menurut §4.17 itu perilaku BENAR. Pelajaran metodologisnya keras: **"berapa panduan dibaca" bukan ukuran mutu.** Bagian KERAS (Palang Rak) belum terukur — butuh sesi sungguhan, dan default tetap MATI sampai itu ada.
- **🛑 Rencana menurunkan §4.13 (8 divisi) DIBATALKAN setelah diperiksa.** Bukti awal (ritual 8-divisi kalah 21 dari 24 penilaian buta) ternyata tak cukup menopangnya: (1) tiga panduan divisi — UI/UX, Webdesign, SEO — **tak punya satu pun pemicu mesin**, jadi mencabut mandatnya membuat mereka nyaris tak terjangkau; (2) yang ikut hilang termasuk butir aksesibilitas WCAG 2.2 AA konkret yang **tak ada duanya** di aturan selalu-muat (kata "WCAG" cuma muncul **1×** di sana, tanpa isi) — padahal aksesibilitas salah satu dari 4 lensa yang wajib digali dalam; (3) seluruh uji memakai model kelas paling kuat, sedangkan kit ini **secara eksplisit merekomendasikan** model tier hemat (`KIMI_CODE_SETUP.md:26`) dan mengakui sendiri *"model lebih kuat cenderung lebih patuh"* — menurunkan perancah berdasarkan bukti dari model terkuat = memindahkan biaya ke pemakai yang paling tak mampu menanggungnya. Skalanya juga jauh di atas taksiran: **45 titik ritual · 61 penjaga robot · 48 butir butuh keputusan owner**, dan sebagian pagar keamanan (pengingat titik-risiko + rem anti-karang-temuan) ternyata **menumpang di dalam blok yang sama**.
- **Berkas:** `lib/rak-pemicu.mjs`, `lib/rak-gate.mjs`, `lib/kimi/rak-gate-kimi.mjs`, `lib/ensure-rak-gate-hook.mjs`, `lib/lang-reminder.mjs`, `lib/kimi/lang-reminder-kimi.mjs`, `lib/kimi/ensure-kimi-hooks.mjs`, `lib/kit-files.json`, `bin/lintasai.js`, `CLAUDE_universal_v1.md` (§0 sumbu ke-5 + §4.17), `workflows/4.17-perkuat-jangan-kurung.md`, `workflows/cap/auth.md`, `workflows/stack/4.14-2-supabase-prisma.md`, `docs/decisions/ADR-022-*.md` + koreksi `ADR-017`.

### Ditambah — Plan mode nyaris bebas-dialog: izin-otomatis cuma-baca (`plan-mode-gate`)

> **Permintaannya "bypass total saat plan mode" — dan itu sengaja TIDAK dikerjakan.** Yang dikerjakan: hasil harian yang sama (dialog izin hilang saat AI membaca), lewat jalur yang tak melubangi pagar. Alasan lengkap + skenario gagalnya = [ADR-021](docs/decisions/ADR-021-plan-mode-izin-otomatis.md).

- **Robot baru `lib/plan-mode-gate.js`** (hook `PreToolUse`, default NYALA, ikut terpasang otomatis tiap `init`/`update`). **Hanya saat plan mode**, aksi yang terbukti cuma-baca dijalankan tanpa dialog izin: baca berkas, cari teks, `git status|log|diff|show|blame`, `npm test`, `npx lintasai preflight`. Di luar plan mode robot ini **diam total** — perilaku sesi normal **nol berubah**.
- **Kenapa bukan bypass.** Premis "plan mode cuma read" ternyata **tidak akurat**: yang dikunci keras harness hanya `Edit`/`Write`; **perintah terminal tetap jalan** (dibuktikan langsung — sesi plan-mode saat merancang fitur ini berhasil menjalankan `Bash`/`node` berkali-kali). Dokumentasi resmi Anthropic pun menyatakan mode bypass *"offers no protection against prompt injection or unintended actions"*. Skenario gagal nyata kalau bypass dipasang: AI membaca `README.md`/isu GitHub pihak lain saat menyusun rencana, di dalamnya ada titipan kalimat perintah, dan perintah itu jalan **tanpa terlihat**.
- **Dua pagar yang membuatnya boleh default-nyala:** (1) **Palang Rem didahulukan** — `plan-mode-gate` memanggil `riskGate.decide()` **sebelum** memberi izin, jadi apa pun yang `risk-gate` tahan tak pernah bisa lolos lewat jalur ini; penilaian bahaya tetap **satu sumber**, dipakai-ulang bukan ditulis-ulang. (2) **Daftar-putih, bukan daftar-hitam** — yang tak dikenali tetap ditanya, sehingga kelalaian mendaftar berakibat "dialog masih muncul" (menjengkelkan), **bukan** "bahaya lolos" (celah).
- **Berkas rahasia justru lebih terjaga dari sebelumnya:** `.env`, `.ssh`, `*.pem`, kredensial, token **tidak pernah** auto-izin — walau operasinya cuma membaca (boundary keras §8.1 #6). Ikut ditolak: penulisan terselubung (`>`, `>>`, `$( )`, backtick), pipa ke penerjemah (`| sh`, `| bash`), sub-perintah git yang menulis walau induknya jinak (`git branch -D`, `git config k v`, `git tag v1`, `git stash pop`), `npm run <di luar daftar>`, dan `npx <paket-asing>` (unduh-lalu-jalankan, §8.1 #2).
- **Akar masalah yang memicu ini, dicatat apa adanya:** `permissions.allow` di mesin owner sudah menggelembung jadi **706 entri (±123 KB)** dengan `deny`/`ask` **kosong** — jejak refleks "klik izinkan" berbulan-bulan, termasuk sejumlah entri `PowerShell(...)` yang bisa menulis kini terizinkan permanen. Jadi dialog yang terlalu sering justru **menurunkan** keamanan. Fitur ini mengurangi tekanan itu di sumbernya.
- **Yang DIBATALKAN setelah diverifikasi:** rencana awal ikut menyalakan `useAutoModeDuringPlan`. Kunci itu memang disebut dokumentasi resmi (`permission-modes`) dan bahkan **sudah default-on**, TAPI tak satu pun halaman resmi menjelaskan struktur JSON / tipe / letaknya — halaman `auto-mode-config` dan `settings` sama sekali tak memuatnya. Kesimpulan: kemungkinan besar **perilaku bawaan, bukan setelan**. Menuliskan nama kunci yang belum terbukti ke `settings.json` client = risiko tanpa imbalan → dibuang dari lingkup. Efek sampingnya baik: `plan-mode-gate` jadi jalur yang **tidak bergantung ketersediaan auto mode di akun**.
- **Batas jujur — tidak berlaku di semua AI.** Diperiksa di dokumentasi resmi masing-masing: **Kimi Code** tak perlu (plan mode-nya **sudah** cuma-baca total — hanya `Glob`/`Grep`/`ReadFile`, tak bisa menjalankan perintah), **Codex** tak bisa (kebijakan izin berlaku se-sesi, tak ada penghubung ke plan mode), **Cursor** tak bisa (Plan Mode & Run Mode dua hal terpisah). **Nol dari tiga** menyediakan "saat plan mode izinkan semua" — polanya konsisten: plan mode dirancang **lebih ketat**, bukan lebih longgar.
- **Berkas:** `lib/plan-mode-gate.js`, `lib/ensure-plan-mode-gate-hook.mjs`, `templates/hooks/plan-mode-gate.settings.example.json`, `lib/setup-hooks.mjs`, `lib/kit-files.json`, `docs/plan-mode-gate.md`, `docs/decisions/ADR-021-*.md`. Tes: 1405 → 1432 lulus (27 tes baru — 18 untuk robotnya, 9 untuk pemasangnya; mayoritas berupa percobaan **membujuk** robot mengizinkan hal berbahaya).

### Diubah — HEMAT TOKEN + MUTU: kit berhenti menarik resep borongan sebelum melihat kode client

> **Mandat tak disentuh.** Paket Stack tetap lantai wajib, 8 divisi tetap otomatis, pengecualian OWASP tetap mutlak. Yang berubah cuma **kapan** resep dibaca dan **lewat mana** berkasnya ditemukan.

- **Dua aturan kit ternyata saling menabrak.** Induk `workflows/4.13-skill-divisi.md:17` berbunyi *"AI **WAJIB** baca + terapkan **Paket Stack §4.14** — **otomatis**"* tanpa syarat; anak `workflows/4.14-stack-packs.md:10` justru berbunyi *"tarik saat dibutuhkan, **bukan borongan di muka** … tugas sepele tak perlu paket"*. AI membaca yang induk lebih dulu. Akibat terukur pada skenario *"ada bug, tombol simpan error"*: **36.245 char** paket stack tertarik = **41% dari seluruh bacaan**, sementara berkas yang benar-benar menjawab cuma **1.380 char (1,5%)**. Diselaraskan ke berkas anak — yang bukan cuma menyatakan perilaku benar, tapi juga **alasannya**, dan alasannya soal **mutu**: resep yang dijejalkan sebelum AI melihat kode NYATA membuat AI mengikuti resep alih-alih pola project yang sudah benar (§4.17).
- **Jalan pintas 3 keluarga rute** (`div/`, `pola/`, `stack/`) ditulis di berkas aturan — melengkapi capability pack yang sudah dapat jalan pintas sebelumnya. Dulu **asimetris**: `workflows/cap/` disebut 3× di berkas aturan, tiga keluarga lain **nol**, jadi wajib lewat hub. Biaya navigasinya terukur: untuk mendapat checklist keamanan **1.011 char**, AI membuka hub **6.033 char** — **86% bacaan terbuang**. Ironisnya hub itu menjual dirinya *"hemat token: baca 1 divisi, bukan 8 sekaligus"*, padahal 8 berkas divisi digabung cuma 14.037 char — **hub-nya sendiri 43% dari yang katanya dihemat**. Hub tetap ada & tetap dipakai untuk mekanika/topologi. **+537 char** ke berkas always-load (anggaran ≤550).
- **Penjaga baru `wajib-borongan`** (pemeriksaan ke-13 di `lib/workflows-ref-check.mjs`, PENTING, ikut `preflight`): perintah "WAJIB/otomatis" atas `§id` yang menyeret >15.000 char wajib menyertakan klausa pas-ukuran. Bobot dihitung **beserta seluruh turunan `§id-*`** — jadi "§4.14" terbaca jujur sebagai **114.719 char**, bukan 4.585 char hub-nya saja.
- **Celah drift yang ditemukan saat memasang penjaganya:** jalan pintas di berkas aturan berbentuk **pola** (`4.13-<backend|frontend|…>.md`), dan bentuk itu **tidak tertangkap** pemeriksa FORWARD (regex path berhenti di karakter `<`). Artinya jalan pintas capability pack yang dipasang sebelumnya **tak pernah dijaga kelengkapannya**. `tests/roster-sync.test.mjs` kini memeriksa berkas aturan sebagai tempat ke-4 (setelah folder, hub, INDEX) + mendaftarkan keluarga `stack` yang dulu tak terdaftar sama sekali. Penjaga ini **langsung membuktikan diri**: ia menemukan `4.14-galeri-folder.md` yang terlewat dari jalan pintas stack yang baru saja ditulis.
- **`PROFIL_TIM.local.md:115`** disetel ke aturan aslinya — dulu menulis "§4.19 **WAJIB dibaca saat Plan mode aktif**", menghilangkan nuansa berkas aturan sendiri (*"Mandat ini cukup untuk rencana rutin"*).
- **Pelajaran proses yang mahal (dicatat apa adanya):** percobaan pertama penjaga `wajib-borongan` menghasilkan **33 temuan, mayoritas alarm-palsu** — ia mencampur *pernyataan mandat* ("8 divisi wajib") dengan *perintah memuat*. Contoh paling telak: §10 tertangkap gara-gara frasa "**dibaca**-cepat vs dibaca-lambat" yang bicara soal kecepatan HALAMAN. Diperbaiki lewat syarat kedekatan (kata-muat ≤45 char dari `§id`) → 2 temuan, keduanya nyata. Lalu ketahuan cacat kedua: dedupe `§id` dilakukan **sebelum** menilai, sehingga kemunculan pertama yang tak bersalah membungkam yang kedua — dan bug NYATA-nya sempat lolos. Dan penjaga jalan pintas versi pertama **gagal uji-negatif** (memakai `includes()` polos; menghapus `keamanan` tetap hijau sebab kata itu muncul puluhan kali di tempat lain).
- **Berkas:** `workflows/4.13-skill-divisi.md`, `CLAUDE_universal_v1.md` (§4.13/§4.14/§4.15), `PROFIL_TIM.local.md`, `lib/workflows-ref-check.mjs`, `tests/workflows-refs.test.mjs`, `tests/roster-sync.test.mjs`. Tes: 1391 → 1405 lulus.

### Diubah — HEMAT TOKEN: satu instruksi yang bisa menarik ~46 rb token diganti jalur 80 karakter

> **Nol perubahan fungsi.** Informasi yang didapat identik; yang berubah cuma jalannya. Ditemukan saat mengaudit permukaan yang belum pernah diukur: **instruksi di dalam berkas always-load yang menyuruh AI membuka berkas lain**. Kalimat 150 karakter bisa memerintahkan pembacaan 183.781 karakter.

- **Rute versi kit diperbaiki** (`AGENTS.md.template`). Dulu: *"cek **baris teratas** `./.claude-kit/CHANGELOG.md`"* — kalimat ini mendarat di `AGENTS.md` **setiap client**, yang dimuat **tiap sesi**. `CHANGELOG.md` = **183.781 char (~45.945 token)**, dan AI yang memakai `Read` (tool paling wajar untuk `.md`) menariknya semua demi **satu angka versi**. Sekarang: `npx lintasai version` (keluaran **80 char**) atau `kit_version` di `.install-manifest.json`. Niat aslinya (*jangan hardcode angka, nanti basi*) dipertahankan utuh — yang salah cuma rutenya, dan rute benarnya sudah ada sejak lama.
- **Penjaga baru `baca-raksasa`** (pemeriksaan ke-12 di `lib/workflows-ref-check.mjs`, PENTING, ikut `preflight`). Berkas always-load dilarang menyuruh membuka berkas terkirim >50.000 char tanpa **alat pembatas** (`npx lintasai …`, `Grep`, `head`, anchor `§…`). **Kunci desainnya: kata sifat BUKAN pembatas** — *"baris teratas"*, *"sekilas"*, *"bagian awal"* terdengar membatasi tapi tak memaksa apa pun; justru frasa itulah yang membuat bug ini terasa aman bertahun-tahun. Ambang 50.000 diekspor sebagai konstanta: kalau alarm-palsu bermunculan, **naikkan ambangnya, jangan matikan pemeriksanya** (pelajaran LP-012).
- **Temuan kedua yang ikut tertutup:** `CLAUDE_universal_v1.md` §8.3 menunjuk `update-kit.mjs` (70.227 char) sebagai "Detail =" padahal penjelasannya ada di `workflows/8.3-trusted-repo.md`. Diperbaiki + diberi petunjuk `Grep`.
- **Dedup aman di berkas aturan:** 3 gema yang rumahnya sudah jelas dipadatkan (§4.12 "Saat AKTIF" · §4.19 fragmen "IKUT INTENT" · §15 yang mengulang utuh daftar pagar §4.12). **78.954 → 78.615 char.** Pagar tak disentuh: blok WAJIB BERPAGAR §4.12, pagar akurasi ✅/❓ §4.19, dan frasa terkunci `IKUT INTENT` semuanya utuh — ketahuan lewat `npx lintasai locked-phrases` yang dipasang putaran lalu, dipakai persis sebagaimana dirancang.
- **Yang DIBATALKAN setelah diukur:** memadatkan `lib/lang-reminder.mjs` (881 char × tiap prompt). Perkiraan awal ~30%, **angka nyatanya 11%** (98 char/prompt) sebab `tests/lang-reminder.test.mjs` mengunci 26 frasa termasuk 3 label blok verbatim. Owner membatalkan; angka nyata + 2 dugaan boros-token yang gugur (`.kimi-code/AGENTS.md` ternyata gitignored sehingga `Grep` melewatinya; `templates/INDEX.md` ternyata bukan gerbang) dicatat di **addendum ADR-019** supaya audit berikutnya tak mengulang dari nol.
- **Berkas:** `AGENTS.md.template`, `CLAUDE_universal_v1.md` (§4.12/§4.19/§8.3/§15), `lib/workflows-ref-check.mjs`, `tests/workflows-refs.test.mjs`, `docs/decisions/ADR-019-*.md` (addendum). Tes: 1382 → 1391 lulus.

### Ditambah — PANEN PELAJARAN: 3 kelas bug dari sesi refactor jadi penjaga permanen (LP-011/012/013)

> **Nol perubahan perilaku untuk client yang sudah jalan.** Yang berubah: satu kemampuan yang selama ini terkirim-tapi-mati jadi bisa dipakai, dan tiga kelas bug berpindah dari ingatan ke mesin (doktrin §6.4). Alasan panen ini ada: dua putaran refactor sebelumnya menemukan 4 bug lolos tapi mencatat **nol** entri Buku Pelajaran — kebalikan doktrinnya sendiri, dan celah yang sama sudah pernah ketahuan di LP-009.

- **Penjaga baru: perkakas terkirim WAJIB punya "gagang"** (`lib/tool-reach-check.mjs`, ikut `preflight`, tingkat PENTING). `lib/fact-gate.mjs` dikirim ke SETIAP client tapi mati total — nol perintah CLI, nol dipanggil, nol disebut aturan. Putaran lalu yang diperbaiki cuma **korbannya**; penjaga ini menutup **kelasnya**, dan saat pertama dijalankan langsung menemukan dua korban lain yang masih hidup: **`lib/split-guard.mjs`** dan **`lib/portfolio-write.mjs`** — keduanya cuma bisa dipanggil kalau AI kebetulan ingat membaca baris perintah di dalam sebuah dokumen. Aturannya: tiap `lib/**.mjs` yang dikirim + berdiri sendiri wajib punya ≥1 jalur pemanggil (perintah CLI / langkah preflight / hook), diverifikasi **dari kenyataan** — sengaja tanpa daftar-kecuali tulis-tangan yang pasti membusuk jadi stempel karet. Buku Pelajaran LP-012.
- **2 perintah baru — kemampuan yang sudah ada, akhirnya bisa dipanggil:** `npx lintasai split-guard` (periksa repo hasil pecah-repo: rahasia ikut terbawa / tier akses bentrok / berkas nyasar) dan `npx lintasai portfolio-write` (tulis Buku Induk akses tanpa menyentuh YAML). Robotnya sudah lengkap & teruji sejak lama — yang hilang cuma gagangnya.
- **Penjaga baru: aturan dilarang menabrak aturan** (pemeriksaan ke-11 `baca-utuh` di `lib/workflows-ref-check.mjs`, PENTING). Dokumen kit tak boleh memerintahkan "baca/internalisasi seluruhnya" atas berkas yang §6 tandai Grep-dulu — kelas bug yang dulu menelan **48.120 char (~12rb token) tiap sesi**. Pengecualian sah §6 (`JALANKAN_KIT.md` Bagian 1-2 saat Fase Aktivasi §4.3b) dibebaskan supaya robot tak memerahkan aturan yang benar. Buku Pelajaran LP-013.
- **Alat baru: `npx lintasai locked-phrases`** — cetak frasa harfiah di berkas aturan yang DIKUNCI tes, dibaca **sebelum** memadatkan aturan (§4.18). Lahir dari kejadian nyata: frasa `Pengecualian 8 skill divisi WAJIB` (§4.9) ikut terpangkas saat compaction dan baru ketahuan lewat tes merah. **Bukan pemeriksa** (tak memblokir, tak ikut preflight) dan **heuristik** — daftar kosong ≠ aman; peringatan itu ikut tercetak di keluarannya sendiri, bukan cuma di dokumen. Client bisa memakainya atas berkas mereka: `--file AGENTS.md`.
- **Buku Pelajaran LP-011** — rujukan & anchor ke rak `templates/` (penjaga `tmpl-*` sudah dipasang putaran lalu, pelajarannya baru dicatat sekarang). Inti pelajarannya: anchor `§keamanan` **bukan** nol hasil — ia mendarat di judul yang SALAH (`STACK_GUIDE.md:666` alih-alih `:567`), jadi AI membaca bab keliru lalu percaya diri. Cocok-yang-salah lebih berbahaya daripada tidak cocok sama sekali.
- **Resep 12 di `docs/RESEP_PERUBAHAN.md` (v5)** — checklist "tambah/ubah/hapus robot penjaga di `lib/`": gagang → kirim → sebut di aturan → tes dua sisi (benar-benar merah pada kasus rusak, DAN tak beralarm-palsu pada kasus sah). Ditegakkan mesin oleh `tool-reach-check`, bukan sekadar imbauan. Plus langkah 0 `locked-phrases` di Resep 2 + alur compaction `workflows/4.18-compaction.md`.
- **Padanan client (biar app yang dibangun client ikut aman):** 2 kode taksonomi baru di `templates/feedback/taksonomi.kit.jsonc` (`taksonomi_versi` 1→2) — **`OPS-DEAD-SHIPPED`** (kode/endpoint/feature-flag ter-deploy tanpa jalur pemanggil = kode mati yang menyamar jadi pengaman) dan **`DOC-POINTER-ROT`** (pointer mendarat di tempat salah) — plus 2 aturan keras di `templates/REFACTOR_STANDARD.md` (v4→v5).
- **Pelajaran proses yang ikut tercatat:** versi pertama `tool-reach-check` memakai `isMain` sebagai satu-satunya penanda perkakas → **17 alarm-palsu dari 18 temuan** (banyak PUSTAKA punya `isMain` berisi "CLI tipis untuk uji-banding"). Penjaga yang beralarm-palsu lebih buruk daripada tak ada penjaga — orang belajar mengabaikannya. Diperbaiki jadi pembeda "apakah ada modul lain yang meng-import berkas ini", dengan `tests/` sengaja tak dihitung sebagai pemakai.
- **Berkas:** BARU `lib/tool-reach-check.mjs`, `lib/locked-phrase-list.mjs`, `tests/tool-reach-check.test.mjs`, `tests/locked-phrase-list.test.mjs`; diubah `lib/workflows-ref-check.mjs` (pemeriksaan ke-11), `bin/lintasai.js` (3 perintah), `tests/preflight.mjs` (langkah `checkToolReach`), `lib/kit-files.json`, `docs/RESEP_PERUBAHAN.md` (v5), `workflows/4.18-compaction.md`, `templates/REFACTOR_STANDARD.md` (v5), `templates/feedback/taksonomi.kit.jsonc` (v2), `docs/BUKU_PELAJARAN.md` (LP-011/012/013). Tes: 1353 → 1382 lulus.

### Diubah — INSTALL SENYAP: bongkar alur popup pasca-instalasi (ADR-020) · rencana bump MENENGAH (→ 2.10.0)

> **Perubahan besar pengalaman-pasang untuk instalasi BARU** — bukan `[BREAKING]` (client existing tak otomatis kena; baru berubah setelah `npx lintasai update` + buka chat baru). Baca `docs/decisions/ADR-020-install-senyap-hapus-popup-onboarding.md` kalau mau migrasi manual project existing.

- **Instalasi kini SENYAP: 0 popup wajib untuk pemasangan baku** (project baru tanpa konflik `AGENTS.md`). Dulu pasang kit = 3-4 popup berurutan (Setup Mode → Audit Menyeluruh → Ukuran Tim + Bentuk Kode/pecah-repo → jaminan Refactor "14d") sebelum staff bisa mulai kerja. Sekarang: pasang → aktivasi otomatis diam-diam (baca stack ringan, ukuran tim default internal, gerbang mutu CI) → **1 Laporan Penutup** yang menyebut stack terdeteksi + menu kapabilitas → langsung siap kerja.
- **Peta struktur project = dari GIT, bukan generate docs (hemat token + waktu).** Saat install, AI TIDAK lagi men-scan seluruh project untuk mengisi `docs/architecture.md`. Struktur diambil dari fakta git deterministik (`npx lintasai project-map` / `git ls-files`, ~0 token AI) saat diperlukan. Dokumentasi per-file / denah database tetap tersedia tapi **on-demand** ("buatkan catatan file X") — bukan bulk otomatis saat pasang. Ukuran tim = default internal senyap (tak diumumkan). Scan kematangan file-counting dicabut dari install (diganti baca `package.json` ringan untuk stack-pack). Jaminan refactor 🟢🟡🔴 dikonfirmasi tetap on-demand. Detail: ADR-020 Addendum.
- **Kapabilitas TIDAK hilang — jadi on-demand.** Audit menyeluruh, rapikan kode bertingkat, dan pecah-repo tetap 100% tersedia; tinggal diminta lewat chat kapan saja ("audit project" / "rapikan kode bertingkat" / "pecah repo sekarang"). Disebut eksplisit di Laporan Penutup + `MULAI_DI_SINI.md` supaya gampang ditemukan staff non-programmer.
- **Yang TIDAK tersentuh (tetap wajib):** skill 8 divisi (§4.13, jalan otomatis tiap prompt via hook `lang-reminder`), Gerbang Verifikasi Pra-Rilis (§4.6), konfirmasi aksi-merusak (§8.2 Aturan 5). Popup yang tersisa semuanya gerbang keamanan: proteksi `AGENTS.md` existing, git-status sebelum rapikan, tingkat 🔴 Berat refactor, peringatan BETA split-repo, item Tier C (RLS produksi/integrasi luar, konfirmasi verbatim).
- **Mitigasi regresi 2 bug lama** (v1.43.1 audit hilang, v1.45.0 refactor hilang — akar sama: salah-deteksi kematangan di Windows): Laporan Penutup **wajib** menyatakan 1 kalimat kondisi project (salah-deteksi jadi terlihat, bukan tersembunyi) + menu kapabilitas **selalu tercetak tanpa syarat** (menghilangkan akar bug secara struktural — dulu tawaran cuma muncul kalau deteksi bilang MATURE).
- **Koreksi klaim keliru:** anotasi `docs/plans/install-senyap-dan-command-v1.md:3` ("sudah terwujud di kit") ternyata keliru — diverifikasi lawan `setup-pola-b.mjs:1058` yang masih mencetak blok directive lama. Diperbaiki jadi status akurat.
- **Berkas:** `JALANKAN_KIT.md`, `POST_SETUP_CHECKLIST_PROMPT_v1.md`, `CLAUDE_universal_v1.md` (§4.3b/§4.4/§4.11 + §6), `setup-pola-b.mjs` (closing message), `MULAI_DI_SINI.md`, + sinkronisasi rujukan di `AUDIT_POST_SETUP_PROMPT_v1.md`/`PROJECT_LIFECYCLE_PROMPT_v1.md`/`workflows/4.4`/`workflows/14.1`/`templates/PROMPT_LIBRARY.md`/`docs/RESEP_PERUBAHAN.md`/`docs/CLAUDE_CODE_MEDIATED_INSTALL.md`/`templates/INDEX.md`/`README.md`. Tes: `tests/install-anchors.test.mjs` diupdate (anchor lama → anchor struktur baru); `roster-sync`/`setup-pola-b-smoke` tetap hijau.

### Diperbaiki — rute rusak yang memaksa AI membaca borongan (hemat ~104 rb char TIAP tugas)

> **Prioritas sebelumnya terbalik.** Putaran pemangkasan sebelumnya menggarap berkas aturan yang dibayar **sekali per sesi**. Audit lanjutan mengukur yang belum pernah diukur — jalur baca ON-DEMAND — dan menemukan satu permintaan sepele *"tambahkan login Google"* menarik **88.530 char minimum**, yaitu 1,14× berkas aturan always-load, dan **berulang tiap tugas**. Penyebabnya bukan aturan kegemukan, melainkan **rute rusak**.

- **Perintah baca-utuh yang menabrak kebijakan kit sendiri.** `workflows/4.2-pattern-driven.md:7` berbunyi *"**WAJIB**: AI internalisasi semua pattern dari `PROMPT_LIBRARY.md` saat setup sesi"* — padahal `CLAUDE_universal_v1.md` §6 menamai berkas itu **secara eksplisit** sebagai "Grep dulu, jangan baca utuh". Akibatnya **48.121 char (~12 rb token)** ditelan tiap sesi untuk informasi yang tabel mapping 7 baris di bawahnya sudah memuat seluruhnya. Diganti: pakai tabel mapping → `Grep` nomor Prompt yang cocok → baca bagian itu saja.
- **Anchor menunjuk seksi yang TIDAK ADA — bug KEBENARAN, bukan sekadar boros.** `workflows/cap/auth.md:15` menyuruh *"rujuk `templates/STACK_GUIDE.md` §keamanan"*; judul itu tak ada. Yang lebih berbahaya: `grep "keamanan"` **bukan** nol hasil — ia mendarat di `STACK_GUIDE.md:666` "Gerbang lint keamanan + a11y", padahal yang dimaksud `:567` "## 7. Security Checklist". Jadi AI membaca **seksi yang salah** saat menyusun aturan cookie login, lalu percaya diri. Diperbaiki jadi anchor literal `§7 Security Checklist` di `:15` dan `:38`.
- **Path template salah tulis** (penunjuk mati ke-7): `workflows/stack/4.14-2-supabase-prisma.md:168` → `templates/GENERATE_TYPES_SCRIPT.md`; berkas nyatanya di `templates/github/GENERATE_TYPES_SCRIPT.md`.
- **Jalan pintas 15 capability pack di berkas aturan** (`§4.13`): `login→cap/auth.md · bayar→cap/pembayaran.md · …`. Dulu AI **wajib** membuka `workflows/INDEX.md` (16.567 char) hanya untuk memetakan "login" ke berkasnya. Bayar **+553 char sekali per sesi**, potong **16.567 char tiap tugas kapabilitas** — impas setelah tugas pertama. ⚠️ Isi `INDEX.md` **tidak disentuh sedikit pun**: pemicu LENGKAP tetap sumber-tunggal di sana (jalan pintas ini cuma path), jadi keputusan ADR-019 tetap dihormati.

**Angka jujur:** berkas aturan always-load **NAIK 1.485 char** (jalan pintas pack + aturan kecepatan + rujukan Palang Fakta) — praktis menghabiskan hemat putaran sebelumnya. Itu **pertukaran yang disengaja**: bayar sekali-per-sesi untuk memotong **104.288 char (~26 rb token) tiap tugas kapabilitas**. Untuk aplikasi utuh yang realistis dibangun 4-5 sesi, ini selisih yang jauh lebih besar daripada apa pun yang bisa diperas dari berkas aturan.

### Ditambah — penjaga mesin untuk rak `templates/` (permukaan yang DULU nol dijaga)

> Ketiga bug di atas lolos karena satu sebab: `lib/workflows-ref-check.mjs` hanya menjaga rujukan berawalan `workflows/`. Seluruh **26 rujukan ke `templates/`** tak diperiksa siapa pun. Penjaga ditulis **DULUAN** lalu dijalankan untuk membuktikan ia benar-benar menemukan ketiga bug itu (red→green), baru rutenya diperbaiki.

- **3 pemeriksaan baru** di `lib/workflows-ref-check.mjs`: (7) `tmpl-forward` — berkas tujuan ada? **[PENTING]**; (8) `tmpl-kirim` — berkasnya ikut terkirim ke project client (dibaca dari `lib/kit-files.json`)? **[PENTING]**, menutup kelas bug "ada di repo owner, hilang di komputer client"; (9) `tmpl-anchor` — anchor `§X` menunjuk judul NYATA? **[RAPIKAN]**.
- **Pencocokan anchor SENGAJA ketat** (`anchorCocok`): judul harus **diawali** teks anchor, bukan sekadar memuatnya di tengah. Cocok-longgar akan meloloskan `§keamanan` ke judul yang salah — persis bug di atas. Diuji lawan 6 anchor nyata: 5 anchor bernomor (`§3`, `§2.3`, `§6`, `§7`, `§2.6b`, `§8`) semua cocok, hanya `§keamanan` yang jatuh — **nol alarm-palsu**.
- **Pemantau ukuran `templates/`** dengan ambang TERPISAH `DEFAULT_TEMPLATE_BUDGET = 25.000` (lebih longgar dari 18.000 untuk `workflows/` — templates memang wajar lebih besar karena berisi contoh siap-tempel). Level **RAPIKAN, tak pernah memblokir**. Sebelumnya 8 berkas `templates/` di atas 18.000 char lolos tanpa terpantau, yang terbesar `MCP_SETUP.md` 64.143 char.
- **Riwayat dikecualikan** memakai daftar `LEGACY_EXEMPT` yang sudah ada (CHANGELOG/arsip/`docs/plans`) — berkas yang dulu ada lalu dihapus WAJIB tetap boleh tersebut di sejarah. +13 tes pengunci (`tests/workflows-refs.test.mjs`: 14 → 27).

### Ditambah — `npx lintasai enable-fact-gate`: Palang Fakta akhirnya bisa dinyalakan

- **Masalahnya:** `lib/fact-gate.mjs` dikirim ke **setiap** client dan sudah teruji, tapi **0 perintah CLI · 0 dipasang installer · 0 disebut di seluruh berkas aturan**. Robot penegak §7.3a itu mati total di tiap client, dan AI tak pernah tahu ia ada. ADR-014 sendiri mencatat *"enable-command = backlog"* — ini mengeksekusi backlog itu, bukan keputusan arah baru.
- **`lib/ensure-fact-gate-hook.mjs`** (baru, meniru pola `ensure-risk-gate-hook.mjs` — idempoten, defensif, tulis atomik) + perintah `enable-fact-gate` + satu baris rujukan di §8.2 supaya AI tahu ia ada. Matcher `Edit|Write|MultiEdit` (**sengaja tanpa `Bash`** — beda dari risk-gate yang menjaga perintah berbahaya).
- ⚠️ **TETAP DEFAULT MATI.** Menyalakannya otomatis = mengubah perilaku di semua client terpasang tanpa diminta. Dikunci tes: `tests/ensure-fact-gate-hook.test.mjs` memastikan installer TIDAK pernah memanggilnya (10 tes).

### Diubah — panggilan alat yang tak saling bergantung dikirim BARENG (kecepatan)

- `CLAUDE_universal_v1.md` §6.3: beberapa `Read`/`Grep` yang tak saling bergantung dikirim dalam SATU giliran, bukan antre — waktu tunggu jadi selama yang paling lama saja. Menutup celah nyata: §5 *"Operasi independen jalan bareng"* selama ini menargetkan **kode yang ditulis client** (`Promise.all`/`asyncio.gather`), bukan cara AI memanggil alat; akibatnya satu-satunya bentuk paralel yang dinamai kit adalah fan-out agen — yang justru default dimatikan. Ditegaskan: ini **BUKAN** izin fan-out (§4.19 tetap NOL fan-out).

### Diperbaiki — 6 penunjuk berkas MATI yang sudah terkirim ke client (2 di titik paling rawan bug)

> Kelas bug yang **tak terlihat dari komputer owner**: di repo kit semua berkas ada, jadi rujukan apa pun terasa benar. Di project client hanya berkas yang terdaftar `lib/kit-files.json` + `package.json files[]` yang mendarat.

- **2 lubang persis di titik paling rawan bug aplikasi — ditambal dengan isi, bukan janji.** `workflows/cap/auth.md:17` dulu menyerah soal kontrol peran (*"Detail model RBAC/ABAC lanjut = peta-jalan `stack/4.14-5b` — belum tersedia"*) dan `workflows/cap/pembayaran.md:32` menyerah soal penerimaan webhook (*"peta-jalan `stack/4.14-10` — belum tersedia"*); kedua berkas peta-jalan itu **memang tidak pernah ada** (`ls workflows/stack/` = 4.14-1 s/d 4.14-9). Padahal `templates/CHECKLIST_KEBUTUHAN_DOMAIN.md:18-19` justru memancing client menyebut "peran kasir vs admin" dan "audit trail siapa void/kasih diskon" — dua-duanya bermuara ke berkas kosong. Sekarang isinya ditulis langsung di pack: **RBAC minimum** (izin sebagai kata kerja bukan jabatan · satu titik cek terpusat · default-deny · cek di server bukan sembunyikan tombol · jejak aksi sensitif) dan **4 aturan terima-webhook** (baca badan MENTAH sebelum parse · banding tanda tangan konstan-waktu `timingSafeEqual` · simpan `event_id` UNIQUE anti proses-dobel · balas 2xx dulu, kerja berat di antrean). Menutup dua kelas bug yang baru ketahuan setelah uang bergerak: izin bocor dan pembayaran terhitung dobel.
- **4 rujukan ADR menggantung** diubah jadi sebutan telanjang (pola sah `tests/adr-rujukan-klien.test.mjs:26-30`): `workflows/4.6-6.3-doktrin-efisiensi.md:62` → ADR-008 · `workflows/6.5-rekam-pelajaran-frontier.md:8` → ADR-006 · `workflows/7.11-peta-project.md:40` → ADR-011 · `templates/PROMPT_LIBRARY.md:1031` → ADR-009. Keempat ADR itu dinegasikan di `package.json` sehingga TIDAK pernah ada di komputer client. (Rujukan `docs/decisions/ADR-002` di `workflows/8.2-anti-halusinasi.md:53` **sehat** — ADR-002 memang terkirim.)
- **Penjaga diperluas supaya kelas bug ini berhenti senyap:** `tests/adr-rujukan-klien.test.mjs` dulu cuma memindai `['CLAUDE_universal_v1.md']` (1 berkas); sekarang memindai `workflows/` + `templates/` juga = **139 berkas**. Aturannya TIDAK berubah (tetap hanya rujukan ber-PATH; sebutan telanjang sengaja diabaikan — penjaga LP-007).

### Ditambah — robot anggaran token kini MENELUSURI rantai `@import` (bukan daftar kaku)

- **`lib/rules-budget-check.mjs`: `traceImports()` baru + `MAX_IMPORT_DEPTH = 4`** (sesuai batas 4 lompatan di dokumentasi resmi Claude Code). Dulu daftar berkas yang diukur disusun KAKU (`CLAUDE_universal_v1.md` + `AGENTS.md` + `CLAUDE.md`) dan tak pernah membaca baris `@import` — artinya berkas aturan **keempat** yang kelak ditambahkan lewat `@import` akan luput dari pemantauan biaya token, persis kelas celah yang baru ditutup ADR-019 untuk `AGENTS.md`. Sifatnya **ADITIF + dedup by path absolut**, jadi angka untuk struktur yang ada sekarang **identik** (79.923 char, terverifikasi sebelum-sesudah). Fail-safe total: path menggantung dilewati, siklus A→B→A berhenti. +5 tes pengunci (`tests/rules-budget.test.mjs`: 14 → 19).

### Diubah — hemat token berkas aturan always-load (RINGAN + SEDANG)

> **Angka jujur: 78.992 → 77.156 char (−1.836 char ≈ −459 token tiap sesi client).** Perkiraan awal rencana (−5.737) **tidak tercapai dan itu temuan, bukan kegagalan**: saat tiap kandidat disanggah satu per satu, mayoritas isi yang "kelihatan duplikat" ternyata **mandat load-bearing**, bukan detail. Contoh paling jelas: §7.7 Bus Factor justru **bertambah 4 char** karena 6 kategori file CRITICAL hanya hidup di berkas aturan (raknya sendiri menulis "aturan WAJIB-scoring tetap di sana"). Berkas aturan gemuk karena **padat pagar**, bukan bertele-tele.

- **Dipadatkan (isi identik sudah ada di rak on-demand):** §8.2 Aturan 2 Humble Mode (4 tingkat keyakinan ≡ `workflows/8.2-anti-halusinasi.md:29-36`) · §8.2 Aturan 1 (analogi ≡ rak `:23`; **peringatan slopsquatting DIPERTAHANKAN** — unik, cuma ada di berkas aturan) · §6.3 (gema "robot deterministik dulu" yang sudah jadi sub-seksi penuh di §4.6) · §4 DoD 4 baris gema → 1 checkbox gabungan (§4.6 dan §7.3a **tidak disentuh** — Tingkat 1) · §4.1b 4 label mini-pelajaran → 1 baris · §15 butir ide opsional (label diterjemahkan ke Indonesia sekalian, §2.1).
- **Dilebur:** §14.1.0 + §14.1 = dua stub popup kembar yang menyatakan aturan sama dan menunjuk rak yang SAMA dua kali → satu seksi, satu pointer. Jangkar `Klarifikasi Terminologi Popup` (dipakai `tests/install-anchors.test.mjs:31`) dan butir "destruktif → opsi paling AMAN di [1]" dipertahankan.
- **Dipindah ke rak yang SUDAH ADA + terdaftar `workflows/INDEX.md`, menyisakan stub bernomor di tempat:** §4.3 · §4.4 · §4.5 · §4.9 · §4.10 · §7.6 · §7.7 · §7.10 · §7.11. Nomor seksi TIDAK dinomori ulang (`docs/RESEP_PERUBAHAN.md:194`) sehingga rujukan lintas-berkas dan ingatan AI di client lama tetap menemukan alamatnya. Mandat yang WAJIB tinggal: §4.9 "Pengecualian 8 skill divisi WAJIB" (pagar Tingkat-1) · §4.5 "`@latest` WAJIB" (jebakan cache npx) · §7.7 6 kategori file CRITICAL (pemicunya penilaian AI, bukan frasa user — tak kasat mata = rute tak pernah terpicu).
- **Yang sengaja TIDAK dipangkas** (diputuskan sadar, jangan diulang analisisnya): §5/§9/§10/§11 (tingkat BERAT — dikecualikan owner) · memecah berkas aturan pakai `@import` (**`@import` dimuat penuh di awal sesi = NOL hemat**; lebih buruk, `lib/kimi-agents-gen.mjs` menyalin SATU berkas dengan janji "IDENTIK, tak ada yang dipangkas" → pengguna Kimi kehilangan aturan diam-diam) · mengganti nama `CLAUDE_universal_v1.md` (terdaftar `KIT_CORE_ENTRIES` fail-closed → membatalkan update di SEMUA client) · migrasi ke Skill native (ADR-017 masih berlaku) · throttle `lib/lang-reminder.mjs` (ditolak owner, ADR-019).

### Ditambah — §4.17 "Perkuat, Jangan Kurung" punya rumah isi (kebutuhan: otak AI native menang saat kit salah)

- **`workflows/4.17-perkuat-jangan-kurung.md`** (baru): doktrin 3 lapis (🧠 otak AI native menalar · 🧰 kit membekali · 🤖 robot memastikan fakta) + **4 keadaan di mana kit KALAH dari kenyataan** + **cara menyimpang yang benar** (sebut aturan mana · kenapa tak cocok di sini dengan bukti `berkas:baris` · apa gantinya) + **BATAS KERAS 7 pagar** yang klausa ini TIDAK bisa dipakai melewatinya (§8, §8.1, §8.2, §4.6, §2.1, §4.13, §7.3a — disebut satu per satu, bukan "pagar Tingkat-1" yang kabur) + klausa **"dokumen kit ≠ bukti"**.
- Di berkas aturan, §4.17 **tetap 1 baris** (+~60 char) — yang berubah cuma cakupannya: dari "perlengkapan kit (8 divisi, stack-pack, capability pack)" jadi "SELURUH isi kit Tingkat-2 — aturan, resep pack, checklist, peta/dokumen". Ini **melaksanakan** keputusan ADR-009 ("di aturan always-load cukup 1 baris pointer di §4.17"), bukan membalikkannya.
- **Koreksi premis:** klaim "berkas aturan punya nol klausa-keluar" tidak benar — sudah ada minimal 6 dengan diksi berbeda (§4.17 "bisa dilewati", §4.17 "otak Claude = sopir", §1.1 "ada jalan lebih baik → katakan terus terang", §7.3a "beda dokumen vs kode → percaya kode", §12 "pemeriksa salah? → lapor + minta keputusan owner", §6.1 "konflik memory vs realita → percaya realita"). Yang kurang bukan klausanya, tapi **rumah isi + cakupannya**.

### Diubah — perlengkapan ditarik saat dibutuhkan, bukan borongan di muka

- **`workflows/4.14-stack-packs.md`:** ditambah klausa pas-ukuran (padanan yang sudah lama ada di `workflows/cap-packs.md:15`) + `4.14-1b-frontend-lanjutan.md` (17.818 char) kini ditarik **saat benar-benar menggarap komponen/animasi**, tidak lagi otomatis bersamaan dengan `4.14-1-nextjs.md` (18.451 char). Alasan mutu, bukan cuma token: makin banyak resep dijejalkan sebelum AI melihat kode NYATA client, makin besar peluang AI mengikuti resep alih-alih pola yang sudah benar di project itu. ⚠️ **Pengecualian ditulis eksplisit:** `stack/4.14-5-owasp.md` tetap ditarik SEBELUM kontrak auth/pembayaran ditulis (§4.17 titik risiko + §4.16 kontrak duluan).
- **`workflows/4.2c-aplikasi-utuh.md`:** langkah 6 baru — sesi pertama WAJIB menutup dengan menulis `docs/plans/<aplikasi>.md` pakai format ringkasan-mandiri 5-hal (`workflows/4.16-build-sequence.md`), dan **sesi lanjutan cukup membaca rencana itu + berkas kode target** tanpa mengulang rute pembuka. Aplikasi utuh realistis = 4-5 sesi; tiap sesi yang tak mengulang rute pembuka menambah hemat di atas angka always-load.

### Ditambah — serap Ponytail (MIT): robot "Anggaran Kerumitan" + Buku Utang Teknis

- **Robot "Anggaran Kerumitan"** (`npx lintasai complexity-budget`): menandai otomatis **berkas gemuk** (≥500 baris) + **fungsi/blok panjang** (≥100 baris badan) = sarang bug + boros token saat AI membacanya, TANPA kamu perlu baca kode. Deterministik, CUMA-BACA, ~0 token AI. **File auto-generate (Prisma, Supabase `database.types.ts`, `*.d.ts`) otomatis dibuang** supaya tak jadi alarm-palsu — uji lapangan: di satu project client 40 file Prisma auto-generate = ~85% derau bila tak dibuang. Level **RAPIKAN — tak pernah memblokir** gerbang (bahkan `--strict`); di repo kit sendiri turun ke INFO supaya tak menyandera Gerbang 0/0/0. Ikut otomatis di `npx lintasai preflight`. Mengisi lubang nyata: ESLint `max-lines`/`max-lines-per-function` MATI-default → mayoritas project tak punya penjaga ukuran. Adaptasi ide Ponytail (MIT © 2026 DietrichGebert). (`lib/complexity-budget.mjs`, `docs/complexity-budget.md`)
- **Buku Utang Teknis** (`templates/BUKU_UTANG_TEKNIS.example.md` + `workflows/4.20-utang-teknis.md`): rumah on-demand untuk refactor/temuan yang **sengaja ditunda** biar tak busuk diam-diam (beda dari Buku Pelajaran §6.4 = bug yang *lolos*). Owner-gated (AI usul → owner setuju), label 2-sumbu (keseriusan × usaha, **bukan skor-angka** §8.2-3b), gate mulai kerja BERAT via `REFACTOR_STANDARD.md`. Adaptasi ide Ponytail `/debt` (MIT).

### Diubah
- `lib/swallowed-error-check.mjs`: penjelajah berkas bersama (`listCodeFiles`) kini melewati folder cadangan kit `.claude-kit.backup-*` (dulu lolos karena namanya jatuh di antara pola `\.backup-` dan `\.claude-kit\`). Menghapus derau "perkakas kit yang dicadangkan di project client" untuk SEMUA robot cuma-baca (complexity-budget, swallowed-check, dll).

### Catatan serap — Caveman (MIT © 2026 Julius Brussee)
- **Nihil diserap dari Caveman.** Nilai intinya (kompres output ~65% jadi gaya "manusia gua" + mode `wenyan`) berlawanan dengan mandat kejelasan-untuk-non-programmer (§2.1 + tie-breaker §0). Statistik token `/caveman-stats` **di-drop permanen** (cuma *melihat* token — tak menghemat; host RDP multi-user rawan bocor antar-user §8.1 #6). Detail vonis per-fitur: `docs/serap-skill/KATALOG.md` Sumber 5.

### Ditambah — hemat token boros-berulang di project client (ADR-019)

- **Robot "Anggaran Token GABUNGAN"** (`lib/rules-budget-check.mjs`: `findCompanionAlwaysLoadFiles()` + `runAlwaysLoadBudget()`, ADITIF — fungsi lama tak disentuh): `npx lintasai preflight` sekarang juga menghitung `AGENTS.md` + `CLAUDE.md` client (dulu cuma `CLAUDE_universal_v1.md` sendirian), karena ketiganya sama-sama ter-`@import` tiap sesi. Menutup celah pemantauan — `AGENTS.md` didesain untuk tumbuh (opt-in §15, catatan tim) dan pertumbuhannya dulu tak terpantau.
- **`lib/hook-session-state.mjs`** (baru): util state per-sesi di `os.tmpdir()` (pola diadopsi dari `lib/fact-gate.mjs`, produksi sejak ADR-014) — fail-open total, dikunci per `session_id`.

### Diubah — sekali-per-rentang-kerja untuk pengingat "rekam pelajaran"

- **`lib/feedback-capture.mjs`** (+ paritas `lib/kimi/feedback-capture-kimi.mjs`): pengingat §6.5 sekarang **sekali per rentang-kerja** (dirty→commit), bukan tiap `Stop` selama git kotor seperti sebelumnya — selaras rule aslinya sendiri ("sekali per tugas, bukan tiap pesan") dan rencana yang sudah tercatat sejak awal di `docs/feedback-capture.md`. Hemat terhitung: rentang-kerja 15 giliran tanpa commit turun dari ~1.590 token jadi ~106 token (~93%). `session_id` kosong → throttle mati total (fail-safe, perilaku identik versi lama).
- **`CLAUDE_universal_v1.md` §6:** koreksi klaim ukuran `workflows/INDEX.md` ("~2 KB" → akurat, ~16 KB/~4rb token — meleset ~8× di versi lama) + tambah pengecualian sempit untuk `JALANKAN_KIT.md` Bagian 2-7 saat dijalankan sebagai Phase 5b (§4.3b), menutup kontradiksi tertulis dengan kebijakan "Grep dulu" untuk prompt root >20 KB.
- **`lib/lang-reminder.mjs` (hook paling boros token, ~220-321 token/giliran) SENGAJA TIDAK diubah** — dipertimbangkan (throttle agresif/konservatif), ditolak owner karena teks 8-divisi ditandai "TIAP prompt" Tingkat-1. Keputusan dicatat di `docs/decisions/ADR-019-*.md` supaya tak dianalisis ulang dari nol.
- Detail keputusan + alternatif yang ditolak: `docs/decisions/ADR-019-hemat-token-feedback-capture-dan-anggaran-gabungan.md`.

### Diperbaiki — gerbang mutu tak pernah mencoba membangun aplikasi (lubang "LULUS palsu")

- **Pemeriksa baru "Build aplikasi"** (`tests/preflight.mjs::runAppBuild`): `npx lintasai preflight` sekarang menjalankan `npm run build` milik project — **GENTING kalau gagal**. Sebelum ini gerbang punya 14 pemeriksa dan **tak satu pun mengompilasi aplikasi**, sehingga robot bisa mencetak "HASIL: LULUS" di atas project yang gagal `next build`. Ini kelas kegagalan paling murah ditangkap mesin (deterministik, ~0 token AI) dan justru satu-satunya yang tak dijaga. Anti-alarm-palsu: project tanpa script `build` dilewati diam-diam (INFO), mode kit juga dilewati (kit = paket CLI).
- **Efek samping yang ikut tertutup:** pemeriksa build sengaja dipanggil **paling awal**, sebelum "Anggaran ukuran halaman". Robot anggaran halaman selama ini **selalu auto-lewat** ("tak ada .next/ build — dilewati") karena tak ada yang pernah membangun; sekarang ia akhirnya punya hasil build untuk ditimbang.
- **CI: janji kosong dicabut** (`templates/github/workflows/preflight.yml`). Langkah build di sana dibungkus `continue-on-error: true` dengan komentar yang menjanjikan *"robot mutu di langkah berikutnya yang melaporkan masalahnya"* — padahal langkah berikutnya (`npx lintasai preflight`) tak punya pemeriksa build sama sekali. Langkah terpisah itu dihapus; preflight sendiri yang membangun, dan kegagalannya benar-benar mematikan gerbang. Dijaga tes regresi agar `continue-on-error` tak dihidupkan lagi diam-diam.
- **Dikunci `tests/preflight-app-build.test.mjs`** (7 tes), termasuk **uji negatif**: project dengan build yang sengaja dibikin gagal WAJIB menghasilkan GENTING. Pemeriksa yang belum pernah menolak apa pun belum terbukti bekerja.
- **DIPERTIMBANGKAN & DITOLAK:** menaikkan temuan cek-tipe (`tsc`/`mypy`) jadi pemblokir di `--strict`. Dibatalkan karena `tests/preflight-robot-baru.test.mjs:54` mengunci kontrak "stack-check selalu non-blokir" dengan alasan tertulis *"robot baru tanpa data laju-alarm-palsu tak boleh menyandera rilis"* — melemahkan tes itu agar perubahan lolos = persis yang §12 larang. Keputusan diserahkan ke owner.

### Diperbaiki — dua perintah Tingkat-1 yang saling bertabrakan di berkas aturan

- **§4.1 tak lagi menyuruh menulis "Tidak relevan"** (`CLAUDE_universal_v1.md`). §4.1 mewajibkan menulis baris `**Divisi** — Tidak relevan (alasan)` untuk divisi tak terkait, sementara §4.17 **melarang** hal yang sama secara eksplisit ("DILARANG menulis laporan proses … 'divisi X tidak relevan'") dengan bukti uji buta *"versi ber-laporan-proses kalah 4-5, versi tanpa menang 9-3"*. AI dipaksa memilih, dan pilihan apa pun melanggar aturan Tingkat-1. Diselaraskan ke kalimat yang sudah ada di §4.1 sendiri: "tampilkan HANYA lensa yang punya temuan".
- **Contoh di `workflows/4.1-tinjauan-divisi.md` dibersihkan**: 6 baris "Tidak relevan" + instruksi skeleton yang masih mengajarkan pola terlarang dihapus (−12 baris). Berkas aturan **menyusut**, tidak bertambah.

### [BREAKING] Ritual "8 divisi wajib tiap prompt" DICABUT — lintasAI jadi perpustakaan rujukan (2026-07-19)

**Apa yang berubah buat kamu:** AI tidak lagi menimbang daftar 8 divisi di tiap prompt. **Standarnya
tidak hilang** — justru sebagian dinaikkan ke aturan yang PASTI dibaca AI tiap sesi. Yang hilang cuma
ritual pencentangannya.

**Kenapa:** dua uji buta di project klien nyata (prompt natural staff non-programmer, penilai buta yang
memverifikasi langsung ke kode) menemukan ritual itu **merugikan** — sisi yang memakainya kalah **1 lawan
11** dan **2 lawan 10**, dan justru menemukan **LEBIH SEDIKIT** aspek yang tak disebut client (11 vs 15;
14 vs 19) padahal itu alasan keberadaannya. Dugaan mekanismenya: daftar 8 kotak **menjangkarkan**
perhatian — AI berhenti menggali setelah kotak ke-8. Sisi tanpa ritual juga membaca **lebih banyak kode**
(24 vs 20 berkas).

**Yang TETAP aman — 4 pagar tak bisa dimatikan (dari 7 jadi 6 pagar keras):**
- Keamanan + anti-bocor rahasia (§8, §8.1)
- Anti-ngarang: tiap klaim wajib berbukti + konfirmasi ketik-verbatim untuk aksi merusak (§8.2)
- Bahasa Indonesia gaya non-programmer di SETIAP jawaban (§2.1)
- Gerbang "belum boleh bilang selesai sebelum terbukti" (§4.6) + baca-kode-sebelum-mengedit (§7.3a)

**Yang DINAIKKAN ke aturan inti** (dulu cuma di rak yang terukur dibuka 14%):
- **§10** — aksesibilitas **WCAG 2.2 AA konkret** (teks alternatif gambar, label form bukan placeholder,
  peran ARIA, target sentuh min 24px, animasi bisa di-pause, jangan andalkan warna saja) · **larangan
  mengirim tampilan template mentah** + tetapkan-arah-desain-dulu + daftar 6 pola yang bikin murah +
  6 kualitas tampilan · **sitemap.xml + robots.txt** untuk situs publik
- **§5** — desain API: bentuk respons konsisten, kode status HTTP yang benar (401/403/409/422/429),
  versi `/v1/`
- **§9** — RLS multi-penyewa (aturan siapa boleh baca baris mana di level database)

**Yang DIHAPUS** (4 panduan yang isinya cuma mengulang aturan utama — satu fakta, satu rumah):
`workflows/div/4.13-{frontend,database,devops,keamanan}.md`. **Keamanan tidak turun kelas** — isinya
sudah ada di §8 yang Tingkat-1 dan dibaca tiap sesi, bukan rak yang dibuka sesekali.
**Yang DISIMPAN** (isinya tak ada duanya): panduan webdesign anti-generik, UI/UX WCAG 2.2, desain API
backend, SEO. Ketiganya kini punya **pemicu mesin** di `lib/rak-pemicu.mjs` supaya tetap terjangkau.

**Ongkos jujur:** berkas aturan naik 81.942 → 86.610 karakter (masih 67,7% dari ambang 128.000). Kit jadi
sedikit **lebih boros token, bukan lebih hemat** — yang dibeli mutu, ongkosnya token.

**Batas jujur:** angka uji buta = jumlah aspek/temuan (bukan sesi) dari **2 uji** saja, dan semuanya
memakai model kelas terkuat. Pemicu mesin baru **tidak terbukti** menggerakkan angka (mekanisme serupa
sudah diukur NEGATIF) — dipasang karena murah, bukan karena terbukti. Latar lengkap: `ADR-023`.

**Perlu tindakan?** Tidak ada. Jalankan `npx lintasai@latest update` seperti biasa. Kalau kamu ingin
perilaku lama, lihat `UPGRADING.md`.

## [2.9.1] - 2026-07-18

### Diperbaiki — celah taksonomi Tingkat 1 (§4.6 + §7.3a) + pemadatan token berkas aturan

- **§4.6 (Gerbang Verifikasi Pra-Rilis) dan §7.3a (baca-kode-sebelum-edit) kini resmi tercatat TINGKAT 1** di daftar Dua Tingkat Aturan (`CLAUDE_universal_v1.md`). Sebelumnya kedua aturan ini sudah BERPERILAKU wajib-tanpa-kecuali (§7.3a bahkan dijaga mesin lewat Read-before-Edit) tapi taksonomi resmi menandainya sebagai bagian "checklist §4 / dokumentasi §7" yang boleh ditawar Tingkat 2 — celah tafsir yang berisiko disalahartikan sebagai "boleh dimatikan per project". Ditutup tanpa mengubah isi/perilaku aturan itu sendiri, cuma menegaskan statusnya.
- **Pemadatan §4.7, §7.3a, §2.1.1 Kategori#4**: menghapus restatement yang sebelumnya mengulang >70% isi rak on-demand (`workflows/4.7-alur-berpemandu.md`, `workflows/7.3a-modifikasi-baca-kode.md`) atau seksi lain (§4.1) — nol informasi hilang (detail lengkap tetap ada di rak, cuma dibaca saat dipicu), hemat ~630 karakter (~157 token) dari berkas aturan yang di-load penuh tiap sesi kerja.

## [2.9.0] - 2026-07-17

### Ditambah — kit lintasAI kini jalan native di **Kimi Code CLI** juga (bukan cuma Claude Code)

- **Aturan penuh di Kimi (kualitas sama seperti Claude).** Kimi Code membaca berkas `AGENTS.md` otomatis tiap sesi (bukan `CLAUDE.md`/`@import` seperti Claude). Pemasang kini otomatis membuat **`.kimi-code/AGENTS.md`** berisi **salinan PENUH** aturan `CLAUDE_universal_v1.md` — jadi begitu project dibuka di Kimi Code, aturan yang menyetir mutu (Bahasa Indonesia non-programmer, 8 divisi, anti-ngarang, gerbang QA) **identik** dengan di Claude, tak ada yang tertinggal. Berkas ini dibuat-ulang otomatis tiap update; **tak mengganggu pengguna Claude-only** (Claude tak membaca folder `.kimi-code/`, berkasnya gitignored). Perintah manual: `npx lintasai kimi-sync`. (`lib/kimi-agents-gen.mjs`)
- **Palang Rem keamanan versi Kimi (opsional, hybrid).** Adaptor hook memakai ULANG otak keputusan yang sama dengan Claude (`lib/risk-gate.js`), dipetakan ke kontrak hook Kimi (TOML `[[hooks]]`, bukan JSON): perintah **ekstrem/tak-bisa-dibatalkan** (`rm -rf`, `DROP/TRUNCATE`, unduh-lalu-jalankan, terobos-pagar, format disk) **ditolak keras**; yang berisiko-tapi-pulih (`DELETE ... WHERE`, `prisma migrate`, sentuh `.env`) **diperingatkan** lalu lewat dialog persetujuan **bawaan Kimi**. Pengingat bahasa/8-divisi + rekam-pelajaran juga tersedia. Pasang (OPT-IN + **wajib diuji di Kimi**): `npx lintasai enable-kimi-hooks`. (`lib/kimi/*`)
- **Kenapa hook OPT-IN, bukan otomatis:** dokumentasi resmi Kimi memastikan hook di config GLOBAL; dukungan hook PER-PROJECT belum resmi didokumentasikan. Supaya TAK merilis perilaku yang belum teruji, pemasangan hook = perintah manual yang di-uji owner di Kimi dulu (panduan + uji-mandiri di `KIMI_CODE_SETUP.md`). Kalau hook per-project tak terpicu: aman — keamanan tetap dijaga persetujuan bawaan Kimi + aturan. Jalur aturan (di atas) TIDAK butuh hook.
- **Model-agnostik (K3 TIDAK wajib).** Dukungan Kimi menempel ke *Kimi Code CLI* (fitur baca AGENTS.md + hook = fitur CLI berlisensi MIT), **bukan** model tertentu → jalan di **K2.7 Code (`kimi-for-coding`, tersedia semua tier), K3 (butuh Moderato+), atau model provider lain** via `config.toml`. Tier langganan hanya membatasi akses MODEL, bukan fitur kit. (`KIMI_CODE_SETUP.md`)
- **Bonus:** Claude Code juga bisa dijalankan dengan model Kimi K2/K3 lewat `ANTHROPIC_BASE_URL` (tanpa mengubah kit) — dicatat di `KIMI_CODE_SETUP.md`.
- Keputusan desain lengkap: `docs/decisions/ADR-015-native-kimi-code.md`. Jalur Claude Code **tak berubah sama sekali** (semua tambahan di samping; 1230 tes + jalur lama tetap hijau). Panduan pasang + verifikasi-mandiri: `KIMI_CODE_SETUP.md`.

### Ditambah — kit belajar dari tiap client tanpa "mengubah dirinya sendiri": sistem **"rekam pelajaran"** (4 robot, human-in-the-loop)

- **Kit kini mencatat sendiri pelajaran teknis "frontier"** (pola/standar IT profesional yang belum dijaga kit) yang muncul saat kerja di project client, ke berkas **LOKAL** ter-redaksi di `docs/pelajaran-lintasai/`. Yang mencatat = client; yang **memutuskan** jadi standar kit = **OWNER** (manusia di tengah keputusan) — bukan AI diam-diam mengubah aturannya sendiri (anti "auto-evolve" §6.4/§6.5). Kemampuan ini ikut paket + otomatis aktif tiap sesi. Dibangun di atas `ADR-006`. (`lib/feedback-capture.mjs`)
- **Pengingat akhir-tugas (hook `Stop`, default-nyala, TAK memblokir).** Di akhir tugas ber-kode, AI diingatkan menimbang: "ada teknik profesional yang belum dijaga kit?" **Fail-open** — kalau hook gagal, kerja tetap jalan; sekali per tugas, bukan tiap pesan. Opt-out: ketik "matikan rekam pelajaran" / centang `AGENTS.md`. (`lib/ensure-feedback-capture-hook.mjs`, addendum `docs/decisions/ADR-008`)
- **Sensor rahasia 2-lapis SEBELUM apa pun tercatat.** Robot redaksi menyensor secret/data-pribadi/jalur-bisnis + menyamarkan bukti, dengan penjaga anti salah-sensor. (`lib/feedback-scrub.mjs`)
- **Identitas anonim + agregator per-organisasi.** ID organisasi/repo/staff di-hash anonim dari git (nilai mentah dibuang, §8.1 #6); agregator merangkum per-organisasi (**1 organisasi = 1 suara**), diurut menurut jangkauan — **tanpa stempel "LULUS"** (sering-muncul = prioritas, BUKAN tanda benar). (`lib/project-id.mjs`, `lib/feedback-aggregate.mjs`)
- **Pagar keras:** tanpa kirim-otomatis (kirim ke owner = opt-in), tanpa skor angka, tanpa AI mengubah perilakunya sendiri. Aturan: `CLAUDE_universal_v1.md` §6.5; detail `workflows/6.5-rekam-pelajaran-frontier.md` + spesifikasi `templates/feedback/rekam-pelajaran.md`.

### Ditambah — 3 gerbang mutu client dinaikkan ke penegakan mesin (sesuai profil tim NOL peran QA/DevOps)

- **Checkpoint `server-only` (Next.js).** Panduan penjaga kunci-server dinaikkan dari saran → **checkpoint wajib** Gerbang Bukti-Jalan: project Next.js dengan secret server (mis. `service_role` Supabase) wajib pasang paket `server-only` + marker di modul rahasia → build gagal otomatis kalau kunci bocor ke browser. (`workflows/stack/4.14-1-nextjs.md`)
- **Resep gerbang lint keamanan + a11y (opt-in, bertahap).** Section baru `STACK_GUIDE.md` §7.6: cara memasang ESLint yang menangkap XSS (`dangerouslySetInnerHTML`/innerHTML tak-aman) sebagai `error` + a11y/`key={index}` sebagai `warn` — gerbang mesin untuk tim tanpa peran QA. Bertahap + opt-in supaya tak membanjiri merah (anti alarm-palsu). Pointer dari panduan Next.js. (`templates/STACK_GUIDE.md`, `workflows/stack/4.14-1-nextjs.md`)
- **Palang Rem DB: pengingat verbatim-produksi.** Untuk DROP/TRUNCATE, DELETE-tanpa-WHERE, dan deleteMany/updateMany-tanpa-where, pesan konfirmasi kini menyuruh AI meminta konfirmasi ketik-frasa (§8.2 Aturan 5) bila database PRODUKSI — dialog klik tetap backstop mesin (mekanisme tak berubah). (`lib/risk-gate.js`)

> Efek di project client baru terasa setelah kit di-update (`npx lintasai@latest update`) + buka chat baru; resep server-only/ESLint aktif per-project saat membangun app Next.js.

---

## [2.8.0] - 2026-07-15

### Diubah — `npx lintasai update` kini jalan untuk SEMUA client (sumber npm, bukan repo privat)

- **Masalahnya:** repo standar tim `ojokesusu/lintasAI` **privat**, padahal `npx lintasai update` mengambil bahannya dari sana lewat `git clone`. Di komputer client yang tak diundang ke repo, perintah itu **berhenti tanpa meng-update apa pun** — selama ini mereka harus pasang ulang lewat `npm create lintasai@latest`. Di komputer owner perintah itu jalan, jadi masalahnya tak terlihat dari sisi pembuat.
- **Sekarang:** cukup **`npx lintasai@latest update`** untuk siapa pun. Bahannya = paket npm publik yang **sudah diunduh + diverifikasi npm sendiri** sebelum perintahnya jalan — **tak butuh akun GitHub, akses repo, maupun git terpasang**. Kit lama **tak perlu** pasang ulang dulu: perintah itu menjalankan updater versi terbaru dari npx, bukan updater lama di `.claude-kit/`.
- **Tulis `@latest`.** Tanpa itu `npx` bisa memakai versi lama (paket lokal di `node_modules` menang; cache npx juga membekukan versi di npm < 11.2.0). Kalau itu terjadi, updater **menolak jalan** + menyebut perintah yang benar — ia tak akan diam-diam memasang versi lama.
- **`--from-repo`** = jalur git lama (clone + verifikasi tanda tangan GPG), untuk owner/tim yang diundang ke repo (mis. menguji tag pra-rilis). **`--allow-downgrade`** = pintu darurat kalau memang sengaja mau turun versi.
- **Aturan lama "client eksternal harus `npm create lintasai@latest`" DICABUT.** `npm create` kini murni untuk **pasang BARU**. Dokumen yang menyatakan aturan lama sudah diselaraskan (`CLAUDE_universal_v1.md` §4.5, `UPDATE_KIT_PROMPT_v1.md` Step 0, `workflows/4.5-update-strategy.md`, `templates/UPDATE_GUIDE.md`).

### Ditambah — update tak lagi bisa membuat kit client lenyap

- **Siapkan → periksa → tukar.** Versi baru disiapkan di folder sebelah, **diperiksa kelengkapannya**, baru ditukar (2 langkah cepat). Dulu urutannya kebalikan: folder kit di-rename jadi cadangan **dulu**, baru versi baru diambil — dan karena tak ada satu pun penangan interupsi di kode, Ctrl-C/mati listrik di tengah = `.claude-kit` **hilang**. Kalau apa pun gagal sebelum tukar, kit client kini **tak tersentuh sama sekali**. (`lib/kit-staging.mjs`)
- **Penyelamat kit yang terlanjur lenyap** (bekas update versi lama yang mati di tengah): update kini mengenali folder cadangan yang tertinggal, lalu menunjukkan cadangannya + cara mengembalikannya. Dulu perintahnya gagal sambil menyalahkan "berkas terkunci/antivirus" dan tak pernah menyebut cadangan yang duduk diam di sebelahnya — client non-programmer buntu total.
- **Kunci "cuma 1 update per project"** (`lib/update-lock.mjs`): dua update berjalan bersamaan bisa saling menimpa dan mengubur kit lama. Kunci yang lebih tua dari 30 menit dianggap bangkai dan diambil alih otomatis, supaya project tak terkunci selamanya setelah mati listrik.
- **`doctor` kini memberi tahu kalau kit kedaluwarsa** (banding ke npm, bukan ke repo — jadi client tanpa akses repo ikut terlayani). Dulu doctor **buta**: daftar berkas wajib dibaca dari kit yang terpasang itu sendiri, jadi kit v2.6.0 divonis "sehat, semua utuh" walau berkas v2.7.0 tak ada. Offline → INFO, bukan merah (jangan bikin alarm palsu gara-gara jaringan kantor).

### Diperbaiki [SECURITY] — dokumen internal repo-dev bocor ke folder kit client

- `docs/serap-skill/**` (4 berkas riset internal) + `docs/BUKU_PELAJARAN.md` **ikut tersalin** ke `.claude-kit/` client saat pemasang dijalankan dari repo-dev: penyaring salin tak sepadan dengan negasi `package.json files[]`. Ketahuan lewat **uji pemasangan nyata**, bukan pembacaan kode. Penyaring kini sepadan + dikunci tes (`tests/setup-copy-filter.test.mjs`).

### Diperbaiki — update bisa diam-diam memasang kerjaan yang BELUM dirilis

- Kalau catatan-pasang hilang, seluruh pengecekan versi mati diam-diam (`canCheckRemote` dihitung **sebelum** versi diisi) → pin-ke-tag gagal → `git clone` jatuh ke branch **`main`**, yaitu kerjaan yang belum dirilis. Sekarang update **berhenti** kecuali diminta eksplisit `--branch main`.
- **Update yang dibatalkan tak lagi melapor "sukses".** Dulu `return 0` walau tak ada apa pun yang berubah → skrip/CI/AI yang hanya melihat kode-keluar menyimpulkan update berhasil.
- **Rujukan menggantung di sisi client:** `CLAUDE_universal_v1.md` menunjuk `docs/decisions/ADR-009` yang **sengaja tak dikirim** ke client (penjaga LP-007) → AI client menemukan berkas kosong. Penunjuk path dihapus (sebutan jangkar `(ADR-009)` tetap). Dikunci penjaga baru `tests/adr-rujukan-klien.test.mjs`.
- **Klaim retensi cadangan yang menyesatkan** di `workflows/4.5-update-strategy.md` ("cadangan lama dibersihkan otomatis") diluruskan: pembersihan **opt-in** lewat `--cleanup-backups`, default tak menghapus apa pun.

### Catatan teknis

- Memanggil `npm` dari Node di Windows: `spawnSync('npm')`→ENOENT, `'npm.cmd'`→EINVAL (ditolak sejak tambalan CVE-2024-27980), `shell:true`→jalan tapi memicu DEP0190 ("argumen tidak di-escape" = celah injeksi). Jalur yang dipakai: `node` + `npm-cli.js` **tanpa shell** (`lib/npm-query.mjs`).
- Tes: 1103 → 1148. Termasuk tes ujung-ke-ujung pertama untuk jalur update yang **berhasil** — Langkah 4-7 (pasang-ulang, beda CHANGELOG, doctor, laporan migrasi) selama ini **nol cakupan tes**, diakui sendiri di `tests/update-kit.test.mjs`.

## [2.7.0] - 2026-07-15

### Ditambah — Naik-kelas standar profesional stack-pack (5 gap Next.js/Supabase produksi)

Kit sudah setara standar expert di mayoritas praktik (Core Web Vitals, resilience, error boundary, i18n, WCAG, RLS-ON, otorisasi server-side); 5 gap terhadap checklist produksi resmi (nextjs.org/supabase.com/web.dev) ditutup — aditif ke stack-pack, tidak mengubah alur.

- **Untuk non-programmer:** app kamu kini punya lebih banyak "sabuk pengaman kelas pro": uji otomatis bahwa data orang lain benar-benar tak bisa diintip, halaman yang tak lambat/basi, dan checklist klik-Dashboard biar aman sebelum online.
- **Untuk programmer:** (1) uji policy RLS otomatis pgTAP (`templates/supabase-rls.test.sql` + resep di `4.14-2`) — wire ke Gerbang Bukti-Jalan §4.19; (2) type-safety native Supabase (`supabase gen types` + `createClient<Database>` + typed `.rpc()` + `strict`/`no-explicit-any`); (3) Next.js Caching/ISR/`revalidateTag`/`revalidatePath` sadar-versi (`4.14-4-deploy`); (4) Core Web Vitals berangka (LCP<2.5d/INP<200ms/CLS<0.1) jadi gerbang DoD halaman publik + wajib RUM (§10); (5) checklist pengerasan Auth Supabase pra-launch (leaked-password protection dll., `STACK_GUIDE.md` §7.5). Backlog: E2E Playwright fitur besar, rotasi secret.

### Ditambah — Palang Fakta (fact-gate): penegak-mesin pra-edit berkas berdampak-tinggi (OPT-IN)

- **Untuk non-programmer:** pengaman opsional yang bisa kamu nyalakan — sebelum AI mengubah berkas penting (login, database, keamanan), ia "dipaksa" menyebut dulu siapa saja yang memakai berkas itu + data apa yang tersentuh, biar tak asal ubah dan bikin error. Default MATI; kamu yang memutuskan menyalakan.
- **Untuk programmer:** `lib/fact-gate.mjs` = hook PreToolUse (adopsi ECC gateguard-fact-force, MIT, ditulis-ulang Bahasa Indonesia). Sebelum Edit/Write PERTAMA berkas berdampak-tinggi (auth/DB/migrasi/RLS/API/route/keamanan) per sesi → block + minta 4 fakta (importer · fungsi terdampak · skema data · instruksi verbatim). Dampening per-sesi (sekali/berkas via state di tmp) + skip pohon rendah-nilai (tests/generated) + fail-open. DEFAULT MATI (opt-in — beda risk-gate yang default nyala); memperkuat-mesin §7.3a/§5/§4.6. Sinergi: pakai-ulang blok `importers:` dari plan-scout. Keputusan = `docs/decisions/ADR-014`. Dijaga `tests/fact-gate.test.mjs`.

### Ditambah — Rencana Cepat-Akurat Plan Mode (§4.19) + robot plan-scout

Aturan baru supaya saat AI menyusun RENCANA (Plan mode Claude Code atau penyajian rencana di mode lain), hasilnya lebih cepat, akurat, dan mudah dipahami — tanpa mengekang penalaran AI.

- **Untuk non-programmer:** kalau kamu minta AI "jelasin kondisi project", "tambah/hapus/upgrade fitur", atau pakai Plan mode — jawabannya kini disajikan bertahap dengan 2 versi tiap bagian (👨‍🎓 versi teknis untuk belajar + 🙂 versi bahasa sehari-hari), memisahkan mana yang sudah "✅ dipastikan" vs "❓ masih dugaan", dan menutup dengan "sudah kuperiksa A/B/C, belum periksa D/E" biar kamu tak salah ambil keputusan. AI juga membaca lebih sedikit berkas tapi yang tepat, jadi lebih hemat + cepat.
- **Untuk programmer:** mandat §4.19 (always-load, ~230 token pointer) + rak `workflows/4.19-plan-mode.md` (on-demand): Matriks Intent→Kedalaman→Wajib-✅ (menggantikan ambang "3-berkas-jenuh" flat), Pernyataan Cakupan wajib untuk output kondisi/saran, ambang berhenti content-based (klaim RLS/izin → baca migrasi ber-nomor tertinggi per objek), sub-protokol HAPUS Sapuan-Referensi-Terbalik, tabel kandidat 8-dimensi, Stack-DoD (termasuk UI/UX/a11y). Robot `npx lintasai plan-scout` (pra-pindai STATELESS: kata-kunci + migration-timeline + reverse-ref). Hook `lang-reminder` menambah blok pengingat kondisional saat `permission_mode==="plan"` (fail-safe; 0 token di mode lain). Koreksi jujur: pagar lama "titik-risiko→✅ wajib" ternyata BERBAHAYA (memaksa ✅ di atas data basi) → diamandemen. Adopsi: Gerbang Klarifikasi (Spec Kit), EARS Indonesia (Kiro). Keputusan + alternatif ditolak = `docs/decisions/ADR-013`. Dijaga `tests/plan-mode-rule.test.mjs` + `tests/plan-scout.test.mjs` + `tests/lang-reminder.test.mjs`.

---

## [2.6.0] - 2026-07-14

### [SECURITY] Menutup celah keamanan standar-profesional (Gelombang 1: item GENTING)

Tindak lanjut assessment `docs/serap-skill/BANDING-SECURITY-STANDAR-PRO-2026-07-14.md` (banding security lintasAI vs ECC terhadap baseline OWASP 2025/API/ASVS 5.0/LLM). Dikerjakan per-item, owner-gated.

- **CSP (Content-Security-Policy) yang kosong → diisi nyata.** Seksi "7.4 CSP Header" di `templates/STACK_GUIDE.md` sebelumnya berjudul CSP + mengklaim "mencegah XSS" TAPI blok header-nya tak memuat satu pun directive `Content-Security-Policy` (rasa aman palsu). Kini: CSP dasar nyata (Tingkat 1) + pola nonce ketat bertingkat (Tingkat 2) + `X-Frame-Options` + peringatan trade-off dynamic-rendering. Diverifikasi ke dokumentasi resmi Next.js (guide CSP, dicek 2026-07); pola nonce diserap dari ECC `rules/web/security.md` (MIT © Affaan Mustafa).

  **Untuk non-programmer:** dulu ada "satpam XSS" yang namanya tertulis tapi orangnya tak ada di pos — sekarang satpamnya benar-benar dipasang, plus versi lebih ketat untuk halaman ber-data sensitif.

  **Untuk programmer:** `templates/STACK_GUIDE.md` §7.4 dirombak; entri roadmap `perkuat-jangan-kurung-roadmap.md:44` ditandai selesai. Tak ada breaking — template panduan, bukan kode runtime.

- **Peringatan CVE-2025-29927 (bypass login Next.js middleware, CVSS 9.1 KRITIS) ditambahkan** ke `workflows/stack/4.14-5-owasp.md`. Header `x-middleware-subrequest` bisa melewati cek otorisasi yang hanya ada di middleware. Mitigasi berlapis: upgrade Next.js ke versi patch (12.3.5/13.5.9/14.2.25/15.2.3+) + jangan andalkan middleware sebagai satu-satunya penjaga (cek ulang di route handler/Server Action + RLS). Fakta diverifikasi ke NVD (dicek 2026-07); bukan dari ECC (celah ini di ECC pun tak dibahas).

  **Untuk non-programmer:** menambah peringatan soal satu "pintu rahasia" di sistem Next.js — panduannya sekarang menyuruh pasang satpam berlapis, bukan cuma di gerbang depan.

- **Supabase RLS diperkuat** di `templates/RLS_SETUP_PROMPT.md` (v1→v1.1): (1) verifikasi kini menyertakan **Security Advisor** resmi Supabase (Dashboard → Advisors → Security, atau `mcp__supabase__get_advisors`) yang otomatis menangkap tabel LUPA di-ENABLE RLS; (2) anti-pattern §4.5 baru — **`service_role` key bocor ke client = bypass TOTAL RLS** (kesalahan #1 stack Supabase).

  **Untuk non-programmer:** menambah "alat pemindai otomatis" untuk keamanan database + peringatan tegas: jangan sampai "kunci master database" nyasar ke browser pengunjung — sekali bocor, semua kunci pintu jadi percuma.

- **Aturan anti-slopsquatting** ditambahkan ke `CLAUDE_universal_v1.md` §8.2 Aturan 1: sebelum menyuruh `install` paket tak-familiar, AI wajib memastikan paket benar ada + ejaan persis di registry resmi. Slopsquatting = AI mengarang nama paket, penyerang mendaftarkan nama-halu itu berisi malware — risiko langsung karena tim membangun DENGAN AI. Always-load bertambah minimal (anggaran token aturan tetap aman).

  **Untuk non-programmer:** kalau AI menyarankan memasang "komponen jadi" yang namanya asing, sekarang AI wajib mengecek dulu komponen itu benar-benar ada + ejaannya tepat — mencegah memasang komponen palsu berisi jebakan.

- **Baseline OWASP dipetakan ulang ke Top 10:2025** di `workflows/stack/4.14-5-owasp.md` (verifikasi ke owasp.org/Top10/2025/): daftar diperbarui + 2 kategori BARU 2025 diberi panduan — **A03 Software Supply Chain Failures** (pin versi/lockfile + SCA + dependency-confusion + slopsquatting + SBOM) dan **A10 Mishandling of Exceptional Conditions** (fail-open: saat error, sistem harus default-deny).

  **Untuk non-programmer:** panduan keamanan sekarang mengikuti standar dunia versi terbaru (2025), termasuk 2 bahaya baru: "bahan baku kode dari pemasok" dan "pintu yang malah terbuka saat alatnya rusak".

### [SECURITY] Gelombang 2 (celah PENTING) — Klaster 1: kelas kerentanan "senyap"

Ditambahkan ke `workflows/stack/4.14-5-owasp.md`: 6 kelas kerentanan yang tak tertangkap scanner biasa dan sebelumnya kosong di kit — **insecure deserialization** (A08), **XXE**, **ReDoS**, **TOCTOU/race bernama**, **open-redirect**, **SSRF-mendalam** (allowlist host + blok metadata cloud). Kelas universal diserap dari `security-reviewer`+`perl-security` ECC (MIT © Affaan Mustafa), sintaksis niche dibuang.

**Untuk non-programmer:** menambah 6 "jenis serangan tersembunyi" yang tak ketahuan alat pindai otomatis, plus cara mencegahnya — melengkapi pertahanan standar profesional.

### [SECURITY] Gelombang 2 — Klaster 2: Auth lanjutan

Ke `workflows/cap/auth.md`: **(1) JWT pitfalls** — verifikasi tanda-tangan + tolak `alg:none` + kunci algoritma (anti key-confusion RS256→HS256) + cek klaim `exp/aud/iss` (kritis untuk Supabase yang berbasis JWT). **(2) 2FA/MFA + passkeys/WebAuthn** — lapis kedua wajib untuk data sensitif; sebelumnya pack ini eksplisit mengaku "2FA belum dibahas".

**Untuk non-programmer:** login sekarang punya panduan "kartu-akses digital anti-palsu" + "kunci kedua" (kode sekali-pakai / sidik jari) untuk akun penting.

### [SECURITY] Gelombang 2 — Klaster 3: Frontend & mass-assignment

Ke `workflows/stack/4.14-5-owasp.md`: **(1) XSS `dangerouslySetInnerHTML`** (sanitasi di call-site + allowlist tag), **(2) prototype pollution** (tolak `__proto__`, `Object.create(null)`, validasi skema), **(3) mass assignment** (allowlist field; Prisma `data` eksplisit — melengkapi DRF §4.14-7 & Laravel §4.14-8 yang sudah ada). Diserap dari `rules/react`+`typescript-reviewer`+`laravel-security` ECC (MIT © Affaan Mustafa).

**Untuk non-programmer:** menambah pencegahan 3 celah umum di sisi tampilan & formulir — menempel "tulisan tamu" dengan aman, mencegah "ubah cetakan pabrik" objek, dan mencegah pelamar menambah kolom "jabatan" sendiri.

### [SECURITY] Gelombang 2 — Klaster 4: Gerbang keamanan otomatis di CI

Ke `workflows/stack/4.14-4-deploy.md` (sub-seksi baru): panduan 6 jenis pemindai keamanan di pipeline dengan label WAJIB/DISARANKAN/OPSIONAL + status "sudah-di-kit vs tambah" — **SCA** (kit: npm audit/govulncheck; +Dependabot/pip-audit), **SAST** (kit: bandit; +semgrep/CodeQL untuk JS/TS), **secret-scan** (kit: secret-guard), **container** (Trivy), **DAST** (OWASP ZAP), **SBOM** (CycloneDX). Robot `lib/stack-check.mjs` tidak diubah (panduan dulu).

**Untuk non-programmer:** panduan memasang "alat pemindai otomatis" di jalur rilis, dengan jelas mana yang wajib vs opsional.

### [SECURITY] Gelombang 2 — Klaster 5: Perlindungan data (UU PDP/DSAR + enkripsi PII)

Template baru `templates/PRIVASI_PDP_NON_LEGAL.md` (non-legal): 6 kewajiban inti UU PDP (UU 27/2022, berlaku penuh Okt 2024), hak subjek data **DSAR** (akses/koreksi/hapus/portabilitas/tarik-consent), dan cara amankan PII (enkripsi kolom at-rest via Supabase Vault/`pgcrypto` + KMS + rotasi kunci + jangan log PII mentah). Didaftarkan di `kit-files.json`; dirujuk dari `cap/kepatuhan-teregulasi.md` + lensa Legal `4.1-tinjauan-divisi.md`; roadmap ditandai selesai.

**Untuk non-programmer:** menambah panduan praktis hukum data pribadi Indonesia — apa yang wajib (izin, hak hapus, lapor kebocoran) + cara menyimpan data sensitif terkunci. Tetap bukan pengganti pengacara.

### [SECURITY] Gelombang 2 — Klaster 6: Denial-of-wallet + GraphQL + subdomain takeover (penutup)

**(1) Denial-of-wallet** & **(2) subdomain takeover** → `workflows/stack/4.14-4-deploy.md`: serangan biaya khas serverless (tagihan meledak walau situs sehat) + pengambilalihan sub-domain terlantar (CNAME dangling → phishing). **(3) GraphQL security** (kondisional) → `workflows/stack/4.14-5-owasp.md`: matikan introspection + batasi depth/batching (kalau pakai `pg_graphql`).

**Untuk non-programmer:** menambah pencegahan "tagihan cloud dijebol", "papan nama toko dipakai orang lain", dan pagar untuk API GraphQL (kalau dipakai).

### [SECURITY] Gelombang 3 (celah RAPIKAN) — pemantapan

- **Header isolasi cross-origin (COOP/CORP/COEP) melengkapi §7.4 `templates/STACK_GUIDE.md`.** Tiga header "pengunci antar-jendela browser" yang masih bolong (header lain — `frame-ancestors`/`Referrer-Policy`/`Permissions-Policy`/HSTS — sudah tertutup sejak Gelombang 1): `Cross-Origin-Opener-Policy: same-origin-allow-popups` (blokir pembajakan antar-tab/tabnabbing TANPA merusak popup login Google/OAuth; nilai terketat `same-origin` diberi catatan kapan pantas) + `Cross-Origin-Resource-Policy: same-site` (aset tak bisa dicomot situs lain; sekalian pertahanan kelas Spectre) masuk blok header bawaan; **COEP** dilabeli OPSIONAL + peringatan keras (`require-corp` memblokir aset pihak-ketiga tanpa CORP/CORS — hanya untuk kebutuhan `SharedArrayBuffer`/isolasi-penuh, alternatif `credentialless`). Nilai diverifikasi ke MDN + OWASP HTTP Headers Cheat Sheet (dicek 2026-07). Bangun-baru, BUKAN serapan — berkas headers ECC (`rules/web/security.md`) pun tak memuat COOP/COEP.

  **Untuk non-programmer:** pagar halaman web dilengkapi 3 "gembok antar-jendela": tab lain tak bisa membajak jendela aplikasi kita, aset kita tak bisa dicomot situs lain, dan gembok paling ketat diberi label "opsional — baca efek sampingnya dulu" supaya tak bikin halaman client tiba-tiba "bolong".

- **Panduan keamanan infra cloud (IAM · WAF · backup/DR)** ditambahkan ke `workflows/stack/4.14-4-deploy.md` — sub-seksi "☁️ Keamanan infra cloud": (1) **IAM/akses akun cloud** — MFA wajib akun admin, akun root bukan untuk kerja harian, token ber-scope sempit + OIDC, tinjau akses berkala; (2) **pin action GitHub ke commit SHA penuh** — tag bisa dipindah penyerang (insiden nyata `tj-actions/changed-files` CVE-2025-30066 Mar 2025, CVSS 8.6, katalog KEV CISA; rekomendasi resmi GitHub); (3) **WAF Cloudflare** sadar-plan (OWASP Core Ruleset = Pro+, Free hanya ruleset dasar) + rate limit + bot protection + SSL/TLS Full strict; (4) **backup/DR** — fakta backup Supabase per-plan (Free TIDAK di-backup otomatis; Pro 7 hr/Team 14/Enterprise 30; PITR add-on ber-syarat), uji-restore kuartalan ("backup tak teruji = belum punya backup"), RPO/RTO sebagai keputusan owner, proteksi-hapus + backup storage. Diserap-suling dari ECC `security-review/cloud-infrastructure-security.md` (MIT © Affaan Mustafa) — contoh AWS/VPC/Terraform dibuang (bukan stack tim); semua fakta layanan diverifikasi ke dok resmi Cloudflare/Supabase/GitHub/NVD (dicek 2026-07). Berkas tetap di bawah anggaran 18.000 char.

  **Untuk non-programmer:** panduan "keamanan gedung" server: kunci ruangan dibagi per-orang seperlunya (bukan semua pegang kunci master), pagar penyaring tamu di depan situs, dan salinan cadangan data yang rutin DICOBA dipulihkan — bukan cuma "katanya ada cadangan". Plus peringatan: paket Supabase gratisan TIDAK punya cadangan otomatis.

- **Path traversal di LUAR upload (per-bahasa)** ditambahkan ke `workflows/stack/4.14-5-owasp.md` daftar kelas "senyap": sebelumnya kit hanya menjaga sisi upload (`cap/upload-storage.md`), padahal celah yang sama menyerang endpoint download/ekspor, penyaji berkas statik, pemilih template, dan ekstraksi arsip (**zip-slip**). Isi: pola benar 3-tingkat (peta ID→path > normalisasi-absolut + cek keluar-folder > jangan cuma tolak string `..`) + resep per-bahasa stack tim — Node/TS (`path.resolve` + cek awalan), Python 3.9+ (`Path.resolve()` + `is_relative_to`), Go (`os.OpenRoot` Go 1.24+ yang tahan symlink / `filepath.IsLocal` Go 1.20+ dengan catatan jujur batasnya), PHP/Laravel (`realpath` + cek awalan / `Storage`). Pemicu per-bahasa diserap dari agen reviewer ECC (MIT © Affaan Mustafa); API mitigasi modern BUKAN dari ECC — diverifikasi ke dokumentasi resmi Python/Go (dicek 2026-07).

  **Untuk non-programmer:** kit dulu cuma menjaga "loket penerimaan paket" (upload); sekarang "loket pengambilan" (download/ekspor) juga dijaga — penipu tak bisa lagi menulis alamat rak palsu "../../ruang-brankas" supaya petugas mengambilkan berkas rahasia.

- **Threat-modeling formal (STRIDE) + pemantauan kejadian keamanan (SIEM-lite)** — dua rumah sesuai peran (bangun-baru, B13; ECC pun tak punya):
  - `templates/THREAT_MODEL_NON_LEGAL.md` (v1 → v1.1): **peta KEDUA** — checklist **STRIDE** (6 modus ancaman aplikasi: menyamar / mengubah / menyangkal / mengintip / melumpuhkan / panjat-hak) untuk menaikkan kelas threat-model 3-baris §8 pada fitur berisiko, lengkap tabel modus→sifat-dilanggar→contoh→penangkal-yang-sudah-di-kit + cara pakai ±10 menit. Definisi diverifikasi ke OWASP Threat Modeling Cheat Sheet (dicek 2026-07). Peta lama (ancaman orang-dalam) tak diubah.
  - `templates/OBSERVABILITY_PRODUKSI.md` (v1 → v1.1): **Pilar 4 — SIEM-lite**: catat kejadian keamanan kunci (login gagal, ganti role, aksi admin, 401/403) + **3-5 alarm anomali** (brute force, aksi admin jam janggal, lonjakan biaya) + retensi/ekspor log sebagai bukti forensik — memakai alat yang SUDAH ada di stack (Supabase Logs Explorer, Cloudflare Security Events, alert Sentry; Vercel Drains = Pro+, semua dicek 2026-07). Jujur berjenjang: SIEM penuh (Elastic/Wazuh/Splunk) = opsional kelas enterprise.
  - `CLAUDE_universal_v1.md` §8: baris threat-model yang sudah ada diperpanjang dengan penunjuk STRIDE (+0 baris baru — anggaran always-load aman, diverifikasi robot).

  **Untuk non-programmer:** dua pelengkap terakhir standar-pro: (1) daftar-periksa "6 modus maling" yang baku untuk tiap fitur berisiko — satpam memeriksa satu per satu, bukan pakai firasat; (2) alarm "toko DIBOBOL" — sistem mencatat siapa mencoba dobrak pintu login dan langsung membunyikan lonceng, bukan baru sadar seminggu kemudian.

### Verifikasi
Item GENTING (5) + Klaster PENTING + item RAPIKAN Gelombang 3 lulus Gerbang Pra-Rilis §4.6: `node tests/preflight.mjs` = GENTING 0 · PENTING 0 · RAPIKAN 0 (1039 tes lulus) tiap langkah. Semua fakta eksternal (dok Next.js CSP, CVE-2025-29927 di NVD, OWASP Top 10:2025) diverifikasi ke sumber resmi saat menulis, bukan dari ingatan (§8.2).

### Diperbaiki — drift teks risk-gate "OPT-IN" (10 titik) + penjaga permanen istilah-pensiun (LP-008)

- **10 titik komentar/teks basi yang masih mengklaim Palang Rem `risk-gate` "OPT-IN / default kit MATI / opsional" diperbaiki** ke fakta benar (default NYALA sejak v1.61.0): `lib/risk-gate.js` (header), `bin/lintasai.js` (komentar registry + teks help), `lib/lang-hook-wiring.mjs`, `lib/install-secret-hook.mjs`, `lib/ensure-preflight-ci.mjs` (analogi basi dihapus), `setup-pola-b.mjs` (kontradiksi internal baris 1013 vs 1029), `docs/architecture.md`, `docs/install-secret-hook.md`, `templates/hooks/risk-gate.settings.example.json` (+ koreksi ringan 2 penyebutan di ADR-008). Kelas-bug "komentar kode basi soal kebijakan default" kini dijaga MESIN: 2 entri istilah-pensiun baru di `lib/consistency-check.mjs` (pola sebaris ber-guard anti-alarm-palsu + pola frasa-unik) + cakupan pindai `ExtraFiles` diperluas ke 8 berkas lib/bin/docs/json; 6 tes pengunci baru; dicatat `docs/BUKU_PELAJARAN.md` LP-008. Urutan = bukti-hidup: penjaga dipasang dulu → terbukti menangkap persis 10 titik → baru diperbaiki → robot BERSIH.

  **Untuk non-programmer:** ada 10 catatan lama yang masih bilang "rem keselamatan mati, nyalakan sendiri" padahal rem itu sudah menyala otomatis sejak lama — AI yang membacanya bisa memberi info keliru ke client. Semua catatan basi dibetulkan, dan sekarang ada robot yang langsung berteriak kalau catatan seperti itu muncul lagi.

### Ditambah — Blok Belajar Junior-Profesi "📚 Belajar dari task ini" (§4.1b) + label profesi dinamis di blok Tinjauan (§4.1)

- **Tiap output substantif AI kini ditutup mini-pelajaran 5 baris:** 👨‍🎓 **Junior-<profesi>** (label dinamis ikut topik — Junior-Backend / Junior-SEO / Junior-Cyber Security / …; topik non-teknis → Junior-<topik bebas> mis. Junior-Media Sosial; maksimal 2 label) · 🙂 **Arti awam** · 💡 **Kenapa penting** · ⚠️ **Jebakan umum** · 🚀 **Jalan ke senior** (1 langkah konkret yang bisa langsung dikerjakan). Balasan super pendek dilewati; alur berpemandu §4.7 → blok cukup sekali di rekap penutup.
- **Blok 🎯 Tinjauan lintasAI Divisi ganti label dinamis:** tiap divisi kini 👨‍🎓 **Junior-<profesi>** + 🙂 **Non-<profesi>** (mis. Junior-Backend + Non-Backend) menggantikan label statis "Junior-programmer + Non-Programmer" — kapan-tampilnya TIDAK berubah (tetap hanya saat ada temuan nyata; "nol temuan itu sah"). Label lama dijaga mesin lewat istilah-pensiun baru `label-tinjauan-junior-programmer`.
- **Pagar fakta dipertegas:** isi blok tunduk anti-halusinasi §8.2 — baris ⚠️/🚀 wajib dari pengetahuan mapan/pekerjaan nyata; AI ragu → wajib jujur bilang belum yakin, DILARANG mengarang demi mengisi blok.
- Sekalian dibetulkan: drift lama di `POST_SETUP_CHECKLIST_PROMPT_v1.md` ("PRE-SEND 4 kategori" padahal aturan induk 5 kategori — kategori popup hilang).

  **Untuk non-programmer:** tiap jawaban AI yang berisi sekarang diakhiri "pelajaran kecil" 5 baris — arti awamnya, kenapa penting, jebakan yang sering menjerat pemula, dan satu langkah nyata untuk naik kelas — dengan label profesi sesuai topik (mis. Junior-Backend). Tujuannya kamu naik tangga pelan-pelan: non-programmer → junior → senior. Kalau AI tidak yakin soal suatu fakta, dia wajib bilang jujur, bukan mengarang.

  **Untuk programmer:** mandat ringkas `CLAUDE_universal_v1.md` §4.1b + detail on-demand rak `workflows/4.1b-blok-belajar` [DIHAPUS ADR-026] (dulu terdaftar INDEX + `lib/kit-files.json`); PRE-SEND Kategori #3 diperluas + Kategori #4 relabel dinamis; pengingat per-prompt blok ke-3 di `lib/lang-reminder.mjs` (+236 char ≈ ~59 token/prompt, diukur nyata); label = penalaran Claude, BUKAN router kata-kunci (ADR-009/ADR-012); dikunci `tests/blok-belajar-rule.test.mjs` + `tests/lang-reminder.test.mjs` + istilah-pensiun `lib/consistency-check.mjs` + LP-007 `tests/package-bundle.test.mjs` (ADR-012 repo-dev only). Biaya blok output (±200 token/jawaban substantif) = pilihan sadar owner, tercatat di ADR-012.

## [2.5.0] - 2026-07-12

### Diperbaiki — paket klien lebih bersih: dokumen pengembangan internal tak lagi ikut terpasang

Beberapa dokumen "dapur pengembangan kit" tanpa sengaja ikut terkirim ke paket klien: folder `docs/arsip/`
(4 berkas audit + perbandingan internal, memuat nama kit pihak ketiga) — regresi commit `76b6008` yang
memindahkannya dari akar (tak terkirim) ke `docs/` (folder yang di-whitelist = terkirim) — plus 3 ADR
keputusan internal baru (009/010/011).

**Untuk non-programmer:** saat update ke 2.5.0, klien tak lagi menerima berkas catatan-internal kit yang
tak mereka perlukan (lebih ramping + tak ada nama proyek pihak ketiga yang nyasar). Fitur yang klien pakai
tetap utuh. Tak ada yang perlu diubah di project klien.

**Untuk programmer:**
- `package.json` `files[]` + `.npmignore` + `shouldCopyKitEntry` (`setup-pola-b.mjs`): kecualikan
  `docs/arsip/**` + ADR-009/010/011 (pertahanan-berlapis: jalur npm + salin dev-direct).
- `docs/project-map.md` (dok pendamping fitur klien, sah) diresmikan ke `lib/kit-files.json` grup `docs`
  agar terlacak robot (dulu terkirim "diam-diam" via folder).
- Penjaga permanen: 2 tes regresi di `tests/package-bundle.test.mjs` (`npm pack` WAJIB 0 berkas `docs/arsip/`
  + 0 ADR internal dinegasi) → kelas-bug "dokumen dev bocor ke klien" jadi tes yang menangkap otomatis
  (Buku Pelajaran LP-007). `docs/serap-skill/**` sudah aman sejak sebelumnya (terverifikasi 0 berkas di tarball).

### Dihapus — Aturan dokumentasi always-on §7.1 AUTO-SYNC + §7.2 LAZY-GENERATE (+ §7.2b) → docs jadi on-demand

Menghapus beban token per-edit: dulu AI wajib baca-ulang + perbarui `.md` pendamping tiap menyentuh kode (§7.1) dan mengecek 6 kategori file penting tiap buat file (§7.2). Ongkosnya perilaku per-tugas, bukan ukuran teks. §7.3 READ-MINIMAL **tetap**. Keputusan owner.

**Untuk non-programmer:** AI berhenti "mengasuh" catatan `.md` otomatis tiap kali menyentuh kode (itu memakan waktu/token tiap tugas). Catatan tetap dibuat/diperbarui, tapi **saat memang perlu** (on-demand). Dokumen yang sudah ada tetap valid — tak ada yang perlu diubah di project client.

**Untuk programmer:**
- `CLAUDE_universal_v1.md` §7: header + ringkasan "3 aturan" diringkas jadi 1 (hanya READ-MINIMAL); subseksi §7.1/§7.2/§7.2b dihapus; definisi "file CRITICAL" di-inline ke §7.7; sinkron `modules` §7.9 **dipertahankan** (perilaku beda, hanya label §7.1 dibuang); checkbox DoD §4 + larangan §12 + klausa Mode Hemat §15 disesuaikan.
- 2 berkas rak dicabut serempak (file + `lib/kit-files.json` + `workflows/INDEX.md`): berkas seksi **7.2** (lazy-generate-glob) & **7.2b** (folder-grouping).
- ~20 tautan-mati dibersihkan di `JALANKAN_KIT.md`, `PROJECT_LIFECYCLE_PROMPT_v1.md`, `templates/_PATTERNS.md`, PR-template, glossary, DB-scan-prompt, dll. Grep "§7.1/§7.2/AUTO-SYNC/LAZY-GENERATE" = **nol** di luar arsip. Preflight **0/0/0 (1025 tes)**.

### Ditambah — Robot `npx lintasai project-map` (peta aktivitas git on-demand) → umpan draf roadmap human-gated

Pengganti positif §7.1/§7.2: robot **deterministik, cuma-baca, on-demand** yang membaca `git log` cabang lalu memuntahkan **fakta** (commit per-modul/per-tipe Conventional Commit, jendela tag/waktu, modul tak-tersentuh) untuk membantu AI menyusun draf roadmap/denah yang **tetap disetujui manusia**. Anggaran token berkas aturan justru **turun** (~17.845, always-load +0 untuk robot on-demand). Patuh ADR-001 (fakta bukan tebakan graf, tak klaim lengkap) & ADR-009 (perlengkapan, bukan pengganti otak).

**Untuk non-programmer:** kalau staff minta "bikin roadmap / apa progres project / denah", AI kini punya alat cepat yang merangkum "bagian mana yang banyak/sedikit disentuh belakangan" dari riwayat perubahan — lalu menyusun draf yang **kamu setujui dulu** sebelum ditulis. Alat ini cuma membaca, tak mengubah apa pun.

**Untuk programmer:**
- `lib/project-map.mjs` (fungsi murni `parseGitLog`/`parseConventionalSubject`/`mapFileToModule`/`groupCommits`/renderer + orkestrator git baca-saja; exit 1 gagal-nyaring kalau bukan repo git / ref tak ada). Modul dipetakan dari `project.lintas.jsonc` bila ada, else folder tingkat-atas.
- Registrasi `bin/lintasai.js` (`COMMANDS_NODE` + `shouldPassProjectRoot` + help) + `lib/kit-files.json` (`node_lib` + `workflows`). Tes fixture `tests/project-map.test.mjs` (10 tes, tanpa git nyata).
- Dokumen `docs/project-map.md` (pendamping) + alur human-gated `workflows/7.11-peta-project.md` (+ baris `workflows/INDEX.md` + stub §7.11 di `CLAUDE_universal_v1.md`). Keputusan + rekonsiliasi ADR-001 = `docs/decisions/ADR-011` (repo-dev).
- **Versi TIDAK dinaikkan** — dicatat di sini sampai owner atur rilis (perubahan backward-compatible → rekomendasi naik MENENGAH).

### Ditambah — Kebijakan izin industri teregulasi yang SAH (judi/gaming sebagai contoh utama)

Menegaskan bahwa membangun software untuk **industri teregulasi yang legal di yurisdiksi tujuan** (judi/gaming untuk negara yang melegalkan, fintech berizin) = **diizinkan**. Ini **bukan** menghapus larangan: kit tak pernah punya larangan judi — penolakan yang dilaporkan client (~v1.61.0) berasal dari perilaku bawaan Claude, bukan aturan kit. Keputusan owner (via popup): cakupan payung "industri teregulasi", rambu kepatuhan = **saran kuat (bukan gerbang)**, batas keras "jangan bantu melanggar hukum" tetap. Keputusan penuh = `docs/decisions/ADR-010`.

**Untuk non-programmer:** kalau client di negara yang melegalkan judi minta bikin situs/app judi, AI kini membantunya (bukan menolak) + memandu rambu penting: batasi wilayah layanan (blokir Indonesia & negara terlarang), cek umur pemain, judi bertanggung jawab, pantau transaksi. Kit tetap jujur: "ini **bukan** nasihat hukum — lisensi & tinjauan legal wajib". Penegasan tambahan: **bahasa tidak menentukan legalitas** — developer Indonesia yang ngoding pakai Bahasa Indonesia & bikin UI berbahasa Indonesia dulu (lalu diterjemahkan ke bahasa pasar tujuan) tetap dibantu penuh; yang menentukan legal/tidak = negara yang dilayani, bukan bahasanya.

**Untuk programmer:**
- `CLAUDE_universal_v1.md` §8.1 #9 — klausa carve-out "industri teregulasi yang SAH = boleh dibangun, jangan ditolak/dimoralisasi" + batas keras + pointer pack (always-load naik tipis, tetap di bawah anggaran token; tak melemahkan §8.1 #8/#10).
- `CLAUDE_universal_v1.md` §4.17 — "industri teregulasi (judi/lisensi/fintech)" ditambah ke daftar pemicu risiko.
- Pack baru `workflows/cap/kepatuhan-teregulasi.md` (6-bagian, tiru `moderasi-konten.md`): izin+batas eksplisit, geo-block server-side, umur/KYC, judi bertanggung jawab, AML+audit-trail, integritas RNG; reuse-first (pembayaran/OWASP/analytics/upload-storage/moderasi/auth). Katalog jadi **15 pack**.
- Domain 🎰 baru di `templates/CHECKLIST_KEBUTUHAN_DOMAIN.md` (pemantik pertanyaan yurisdiksi/lisensi/KYC/geo-block/AML).
- **Penegasan "bahasa ≠ penanda yurisdiksi":** frasa di §8.1 #9 + butir "🌐 Bahasa prompt/UI ≠ penanda yurisdiksi" di pack + rujuk-silang ke `workflows/cap/i18n.md` (bangun 1 bahasa dulu lalu terjemahkan) + bullet "Bahasa & pasar" di checklist domain. Prompt/UI Bahasa Indonesia (memang wajib §2.1) lalu diterjemahkan = sah; TIDAK menganulir batas keras (b) (bahasa dev ≠ pemain yang dilayani).
- Wiring: `lib/kit-files.json` + `workflows/INDEX.md` + `workflows/cap-packs.md`. ADR-010 = repo-dev. **Versi TIDAK dinaikkan** — dicatat di sini sampai owner atur rilis (fitur backward-compatible → nanti naik MENENGAH).

### Ditambah — Gelombang 2b: 5 Capability Pack (ekspor-laporan · push-notification · moderasi-konten · pencarian · feature-flag)

Melanjutkan arsitektur "Perkuat, Jangan Kurung" (Gelombang 1 + 2). Lingkup dikunci owner via popup = **5 pack** (dari 7 kandidat peta-jalan); audit-trail & pemrosesan-media sengaja **tidak** dibangun jadi pack terpisah (tumpang-tindih Gelombang-3 DB / `cap/upload-storage.md` → cukup dirujuk, hindari mendahului Gelombang-3). Katalog kini **14 pack**. Semua **on-demand** — anggaran token berkas aturan tetap **~17.841 (always-load +0)**. Lolos preflight strict **0/0/0 (1015 tes)** + tinjauan adversarial 7-pemeriksa mode-aman cuma-baca.

**Untuk non-programmer:** staff kini bisa minta 5 kemampuan umum lagi dengan bahasa sehari-hari ("ekspor data/cetak PDF/laporan bulanan", "push notification", "moderasi/saring komentar", "fitur pencarian", "kill switch/A-B test") → AI merakit versi kelas-industri yang aman tanpa staff perlu tahu istilahnya.

**5 pack baru** (struktur tiru `cap/auth.md`: Kontrak · Langkah rakit · Gotcha · Rujuk-silang reuse-first · Threat-model 3-baris · Batas jujur + cek-versi):
- `cap/ekspor-laporan.md` — otorisasi ekspor per-baris (anti-IDOR massal) + anti **CSV-injection** + ekspor besar via latar/streaming (anti-OOM) + rate-limit/kuota per-user + PDF-dari-HTML sanitasi (anti XSS/SSRF) + link kadaluarsa + retensi. Rujuk background-job/upload-storage/email/i18n.
- `cap/push-notification.md` — izin di momen-tepat + Web Push/VAPID (+ caveat iOS-PWA) / FCM/APNs + kirim-latar idempoten + bersihkan token mati + preferensi/berhenti + push=best-effort (bukan kanal OTP). Rujuk realtime/email/analytics.
- `cap/moderasi-konten.md` — dua-lapis (saring otomatis + tinjauan manusia) + jalur hukum CSAM (blokir+lapor, jangan hapus-sepihak) + banding + anti-brigading + lindungi moderator/pelapor. Rujuk background-job/upload-storage/ai-rag-aman.
- `cap/pencarian.md` — full-text (`tsvector`+GIN) / faset + saring-izin server-side + kunci tenant + paginasi kursor + debounce autocomplete; **semantik/vektor sengaja dirujuk ke peta-jalan Gelombang-3**, tak disalin.
- `cap/feature-flag.md` — pack **tipis**: kontrak + default-MATI (fail-safe) + rollout hash-deterministik + flag publik-vs-server-only; **inti mekanik menunjuk** `templates/feature-flags-advanced.md` (reuse-first, tak menyalin).

**Wiring:** 5 entri `lib/kit-files.json` + 5 baris `workflows/INDEX.md` (pemicu "Kapan dibaca") + tabel `workflows/cap-packs.md` (14 pack, catatan jujur "menutup kapabilitas umum, bukan seluruh kemungkinan" + audit-trail/media dirujuk ke Gelombang-3).

**Tinjauan adversarial (7 pemeriksa paralel cuma-baca) — 0 GENTING · 3 PENTING · 9 RAPIKAN, SEMUA dibenahi:**
- **PENTING (moderasi CSAM) — ditandai 2 lensa independen (keamanan + anti-halusinasi):** frasa "JANGAN menyimpan/meneruskan" menggabungkan "jangan sebar" (benar) dengan "jangan simpan" (bisa **terbalik** — sebagian yurisdiksi mewajibkan **mengamankan bukti**, menghapus = memusnahkan barang bukti). Diperjelas: pisahkan jangan-sebar dari kewajiban-simpan + tegaskan jangan-hapus-sepihak + konsultasi hukum wajib.
- **PENTING (push Web Push iOS):** ditambah caveat "di iOS hanya jalan sebagai PWA, bukan tab Safari" di langkah + Batas jujur (segmen iPhone-browser praktis tak tercakup → fallback email/in-app).
- **PENTING (ekspor DoS):** threat-model sebut DoS tapi mitigasi kurang rate-limit → ditambah batas laju/kuota/konkurensi ekspor per-user (konsisten dengan pack pencarian/push).
- **9 RAPIKAN:** gloss jargon non-programmer (tsvector/GIN, XSS, IDOR, DoS, OFFSET/kursor — §2.1 Tingkat-1) + debounce autocomplete + 2 rujuk-silang antar-keluarga (moderasi→notifikasi, push→analytics) + pointer "Gelombang-3" diarahkan ke rumah rencana (`docs/plans/...roadmap.md`) agar tak menyesatkan.
- **Bersih terverifikasi:** lensa konsistensi-struktur **0 temuan** (6 bagian + penanda baris-1 lengkap di 5 pack); lensa crossref mengonfirmasi **reuse-first tanpa penyalinan** (feature-flag & pencarian benar merujuk, bukan menyalin) + semua rujukan keras ADA; klaim faktual (VAPID/FCM/APNs, tsvector+GIN, 404/410 token mati, karakter CSV-injection, sha256) diverifikasi benar + hedging versi kuat. Preflight ulang pasca-perbaikan tetap **0/0/0**.

### Ditambah — Gelombang 2: 6 Capability Pack sisa (upload · realtime · email · background-job · i18n · analytics)

Melanjutkan arsitektur "Perkuat, Jangan Kurung" (Gelombang 1): 6 Capability Pack terakhir di folder `workflows/cap/` — katalog kini **9 pack** (Auth · Pembayaran · AI-RAG + 6 baru). Semua **on-demand** (anggaran token berkas aturan tetap ~17.841 — always-load **+0**). Lolos preflight strict **0/0/0 (1015 tes)** + tinjauan adversarial 7-pemeriksa mode-aman cuma-baca.

**Untuk non-programmer:** staff kini bisa minta 6 kemampuan umum lagi dengan bahasa sehari-hari ("upload foto", "chat langsung", "kirim email/OTP", "proses di latar", "banyak bahasa", "lacak kunjungan") → AI merakit versi kelas-industri yang aman tanpa staff perlu tahu istilahnya.

**6 pack baru** (struktur tiru `cap/auth.md`: Kontrak · Langkah rakit · Gotcha · Rujuk-silang reuse-first · Threat-model 3-baris · Batas jujur + cek-versi):
- `cap/upload-storage.md` — unggah langsung ke storage (pre-signed URL) + 5-pagar keamanan (rujuk OWASP `4.14-5`) + nama-key acak server-side (anti path-traversal) + retensi/lifecycle.
- `cap/realtime.md` — SSE/WebSocket/Supabase Realtime + otorisasi per-kanal server-side + reconnect/resync + pagar **CSWSH** (anti pembajakan handshake lintas-situs).
- `cap/email-notifikasi.md` — deliverability SPF/DKIM/DMARC + kirim-latar idempoten + OTP aman (hash/expiry/batas-percobaan/sekali-pakai) + anti-abuse + kelola bounce.
- `cap/background-job.md` — antrean persisten (bukan di memori) + idempoten + retry/backoff + DLQ + lease/visibility-timeout + kunci cron (rujuk `SKIP LOCKED` di `4.14-2`).
- `cap/i18n.md` — pisah teks-kode + plural ICU + format `Intl` (UTC-simpan/lokal-tampil) + RTL properti-logis + `hreflang`.
- `cap/analytics.md` — 3 aksi inti + consent/UU PDP + tanpa-PII-ke-pihak-ketiga + event kritis diukur server-side (anti adblock).

**Wiring:** 6 entri `lib/kit-files.json` + 6 baris `workflows/INDEX.md` (pemicu "Kapan dibaca") + tabel `workflows/cap-packs.md` (9 pack "✅ tersedia" + catatan jujur "menutup kapabilitas umum, bukan seluruh kemungkinan").

**Tinjauan adversarial (7 pemeriksa paralel cuma-baca) menemukan + membenahi:** 1 **PENTING keamanan** (celah CSWSH di `realtime` — WebSocket-DIY cookie-auth butuh validasi `Origin`/token) + 4× rujukan peta-jalan menggantung dirapikan (`templates/PRIVASI_PDP_NON_LEGAL` tanpa `.md`) + 1 label "peta-jalan" basi di `pembayaran.md` (background-job kini live) + 3 gloss jargon (backpressure/transient/rate-limit). Jujur: 2 dari 7 pemeriksa mengembalikan output degradasi → dua pack itu (`email`, `analytics`) ditinjau-ulang manual. **0 GENTING.** Rujukan roadmap ke berkas Gelombang-3 yang belum ada dibetulkan ke bentuk peta-jalan (pulihkan preflight 0/0/0).

### Ditambah — Arsitektur "Perkuat, Jangan Kurung" + fondasi Aplikasi-Utuh + 3 Capability Pack (Gelombang 1)

Menjawab sasaran owner: **non-programmer cukup prompt natural → aplikasi kelas-industri, tanpa mengekang otak Claude, hemat token + cepat**. Lolos audit adversarial 2-pemeriksa (klaim terverifikasi `berkas:baris`) + preflight strict **0/0/0 (1015 tes)**. **Always-load +~1.000 char saja** (anggaran token ~17.841/32.000 — semua kedalaman on-demand, nol beban per-pesan/hook).

**Untuk non-programmer:** kit dikunci jadi *"Claude = otak, lintasAI = perlengkapan, robot = fakta"* — kit membekali & memverifikasi, tak menggantikan penalaran Claude. Ditambah: AI kini memecah "bikin aplikasi utuh" jadi tahapan yang bisa dipakai + menanyakan kebutuhan yang sering terlupa, dan punya "resep siap-rakit" untuk login/pembayaran/chatbot-AI.

**Fondasi (Gelombang 1):**
- `docs/decisions/ADR-009` (doktrin arsitektur, maintainer-facing) + **1-baris pointer §4.17**; tugas sepele tanpa upacara (pas-ukuran + bisa dilewati).
- Pointer **§4.16** (urutan-bangun) di §4.13 — sebelumnya doktrin ini tak dirujuk sama sekali di always-load (`grep 4.16`=0). + §3 diperkuat: task non-sepele tampilkan **konfirmasi-lingkup terlihat** sebelum koding (reuse ritual §4.2/Prompt-1, bukan ritual baru).
- **`workflows/4.2c-aplikasi-utuh.md`** (baru): pola Aplikasi-Utuh (konfirmasi-lingkup → Peta Aplikasi irisan-vertikal ber-tag aspek → pancing kebutuhan per-domain) + **Prompt 23** di `PROMPT_LIBRARY.md` + **`templates/CHECKLIST_KEBUTUHAN_DOMAIN.md`** (baru; pemantik pertanyaan, bukan jaminan lengkap).

**Capability Packs (baru — folder `workflows/cap/`, on-demand):** `cap-packs.md` (induk + cara self-routing soft lewat INDEX, BUKAN router kata-kunci) + `cap/auth.md` (login/sesi/RBAC; rujuk-silang OWASP, jangan salin) + `cap/pembayaran.md` (idempotency-key + webhook idempoten & verif-tanda-tangan → **tutup 1 kondisi GENTING-rilis §4.6**) + `cap/ai-rag-aman.md` (mengamankan fitur AI **buatan client** — gap: §8.1 hanya lindungi asisten; menutup input-LLM-tak-tepercaya, authz retrieval anti-bocor-lintas-tenant, batas biaya, PII, jujur "tak ada filter sempurna"). Sisa pack (upload/realtime/email/dll) + pendalaman per-aspek = peta-jalan bertahap.

### Diperbaiki — tinjauan pra-rilis BABAK 2 (permintaan owner "cek 1x lagi") + serap 1 skill poles UI

Tinjauan ulang menyeluruh serapan ECC belum-commit dengan **13 pemeriksa paralel mode-aman cuma-baca** (verify per-klaster + cek-ulang versi ke web + pindai 278 skill ECC vs profil tim) + robot deterministik. **0 GENTING.** Semua klaim versi TIME-BOXED **diuji-ulang independen ke web → TERBUKTI benar** (Node 20 EOL 30 Apr 2026, Node 24 Active LTS default Vercel, GitHub Actions checkout@v7/setup-node@v6/upload-artifact@v7/build-push@v7, zod v4 `z.url()`, Tailwind `h-dvh` v3.4, dvh/svh/lvh baseline, WCAG 1.4.4/1.4.10). Preflight strict 0/0/0 (1015 tes).

**Untuk non-programmer:** dicek ulang "kalau staff menyalin contoh apa adanya, benar jalan?" — ketemu 3 hal yang bisa bikin gagal/salah di sisi client → sudah dibenahi. Sekalian ditambah 1 "mode poles" agar UI buatan AI terasa lebih rapi.

**PENTING (3) — dibenahi:**
- `workflows/stack/4.14-4-deploy.md` §health: (a) jalur health disamakan `/health` → **`/api/health`** di prosa + bagian Kubernetes (kode Next.js App Router `app/api/health/route.ts` ter-map ke `/api/health`; salah alamat = 404 di uptime monitor / probe K8s); (b) tambah baris `import { db } from "@/lib/db"` di blok `health/detailed` (tanpa itu build gagal `Cannot find name 'db'`); sekalian probe K8s diperjelas (liveness/startup → `/api/health`, readiness boleh → `/api/health/detailed`).
- `package.json`: **`docs/serap-skill/**` dikecualikan dari paket npm** — tadinya bocor ikut ke client (3 berkas dapur repo-dev) padahal 2 template yang terkirim (`SKILL_KONTEN_ANTISLOP.md`, `UJI_KEPATUHAN_ATURAN.md`) menyebutnya "tak ikut terpasang di client"; asimetri dengan `docs/plans/**` yang sudah dikecualikan. Dibuktikan `npm pack` (tarball 220 → 217 berkas).

### Ditambah — serap ECC `make-interfaces-feel-better` (poles design-engineering UI; di luar 44-kandidat)

Serapan skill ECC **`make-interfaces-feel-better`** (origin komunitas, via pustaka ECC v2.0.0 — **ditulis-ulang** non-programmer + dinetralkan, bukan salinan). Ditemukan lewat pindai kelengkapan 278 skill (gap frontend/webdesign, 0 padanan di kit). Owner setujui SERAP via popup. **Always-load +0 baris** (semua on-demand). 4 resep poles inti → `workflows/stack/4.14-1b-frontend-lanjutan.md` (14.960 → **17.587 char-JS < 18.000**, tak perlu pecah): `font-variant-numeric: tabular-nums` (angka harga/saldo tak geser saat berubah), concentric radius (radius luar = dalam + padding), `text-wrap: balance`/`pretty`, larangan `transition: all`/`will-change: all` (jank HP murah). Sadar-versi ditulis "cek target terpasang" (Baseline modern). Preflight strict 0/0/0.

### Diperbaiki — tinjauan pra-rilis serapan ECC: 11 perbaikan template (0 GENTING · 6 PENTING · 5 RAPIKAN)

Sebelum serapan ECC di window ini dibagikan ke client, dicek ulang menyeluruh (robot deterministik + 5 pemeriksa adversarial mode-aman cuma-baca + verifikasi klaim versi ke web). **0 GENTING** (tak ada bahaya-fatal / bocor-rahasia / data-hilang); temuan terpusat di contoh Dockerfile yang disalin mentah client. Semua dibenahi; preflight strict 0/0/0 (1015 tes). Klaim "sadar-versi" (Node 24 LTS / Node 20 EOL, GitHub Actions v6/v7, zod v4 `z.url()`, timeout Supabase 8s/3s, kebijakan Google) **diuji-ulang independen ke web → TERBUKTI benar** → dibiarkan; rekomendasi Node 24 terverifikasi didukung Vercel (default).

**Untuk non-programmer:** contoh resep baru dicek "kalau disalin apa adanya, benar-benar jalan?" — ketemu beberapa yang bisa bikin gagal/bingung di sisi client (bukan bahaya-fatal) → sudah diperbaiki semua.

**PENTING (6) — bisa merugikan client kalau disalin persis:**
- `templates/STACK_MIGRATION_GUIDE.md` §2.3 (4 perbaikan): (a) `HEALTHCHECK` Next.js `wget --no-verbose --tries=1` → `wget -q --spider` — `node:24-alpine` cuma punya wget versi mini (BusyBox) yang tak kenal flag lama → container salah-ditandai "sakit" (unhealthy) walau app sehat; (b) contoh `CMD` FastAPI dipisah dari Django (`gunicorn config.wsgi` cuma benar untuk Django; FastAPI = jenis "ASGI" → butuh worker uvicorn) — blok tadinya berlabel "FastAPI/Django" tapi cuma jalan untuk Django; (c) tambah `ENV HOSTNAME="0.0.0.0"` + `PORT` di runner (sebagian versi Next dengar cuma "dalam container" → tak terjangkau dari luar); (d) catatan data-upload pakai `volumes:` (named volume), JANGAN `tmpfs` (RAM, hilang tiap restart).
- `package.json`: `ADR-008` dikecualikan dari paket npm — tadinya bocor ikut ke paket, padahal `README` (yang ikut terkirim) berkata "cuma ada di GitHub" (drift "satu berkas lupa disetel", §4.6). Dibuktikan `npm pack`.
- `templates/github/workflows/app-cicd.yml.example`: peringatan prasyarat script `lint`/`typecheck`/`test` (project Next.js baru belum punya `typecheck`/`test` → CI merah "Missing script" yang membingungkan).

**RAPIKAN (5):** komentar cache `setup-node@v6` diperjelas; rujukan "§health" yang menggantung dibetulkan; caveat keamanan `/health/detailed` (jangan bocor `version` app ke publik, §8); glosari "load balancer"; penanda "berkas repo-dev" pada footnote 2 template (`SKILL_KONTEN_ANTISLOP.md`, `UJI_KEPATUHAN_ATURAN.md`).

Belum menaikkan versi paket — keputusan rilis owner.

### Ditambah — serapan resep ECC Gelombang 1 (23 Quick Win + 5 delta coding-standards)

Onderdil **MIT © Affaan Mustafa** (pustaka skill ECC v2.0.0) — **ditulis-ulang** Bahasa Indonesia non-programmer (bukan disalin) + dinetralkan untuk project apa pun. Fokus stack tim: Next.js + Supabase + Python + Vercel/Railway/Render. Semua masuk berkas **on-demand per-stack** (nyala saat stack terdeteksi); always-load hanya **+3 baris** di §5. Preflight strict **GENTING 0 · PENTING 0 · RAPIKAN 0**, 1015 tes lulus.

**Untuk non-programmer:** kit jadi lebih pintar soal database, backend, keamanan, dan tampilan-ramah-difabel — tanpa membebani aturan yang dibaca AI tiap sesi (nyaris tak nambah). AI kini otomatis mengingatkan jebakan-jebakan yang sering bikin bug diam-diam (data dobel karena dua-klik, halaman goyang, kolom rahasia bocor, dll).

**Untuk programmer — penempatan per-berkas (sumber ECC dalam kurung):**
- `workflows/stack/4.14-2-supabase-prisma.md`: strategi ID Prisma (cuid/uuid/autoincrement), RLS `(SELECT auth.uid())` initPlan, `.select` kolom vs `*`, `CREATE INDEX CONCURRENTLY` + jalur Prisma `--create-only`, paginasi cursor/keyset anti-goyang, `FOR UPDATE SKIP LOCKED`. (`prisma-patterns`, `postgres-patterns`, `database-migrations`, `api-design`, `backend-patterns`, `coding-standards`)
- `templates/STACK_GUIDE.md`: **§5 Database baru** (urutan composite index + partial + covering, 3 query audit + `REVOKE`, tipe data Postgres); caveat `proxy.ts` Next 16 di §3.4. (`postgres-patterns`, `database-migrations`, `nextjs-turbopack`)
- `workflows/stack/4.14-7-python.md`: cek-unik anti-balapan (`IntegrityError`), `raise ... from e`, anti-blokir event loop, Pydantic v2, DRF `fields='__all__'` bocor. (`fastapi-patterns`, `python-patterns`, `django-reviewer`)
- `workflows/stack/4.14-5-owasp.md`: CORS `*`+credentials, token scoped + 401 vs 403. (`fastapi-reviewer`, `laravel-security`, `fastapi-patterns`)
- `workflows/stack/4.14-1-nextjs.md`: `key={index}`, `import "server-only"`, `proxy.ts` sadar-versi (**diverifikasi ke dok resmi Next.js 16**), WCAG 2.2 item 9-12 (focus ring/reflow/redundant-entry/kontras-non-teks 3:1), anti-pola a11y, catatan immutability React. (`react-patterns`, `nextjs-turbopack`, `accessibility`, `a11y-architect`, `coding-standards`)
- `workflows/4.15-pola-bantu.md`: tes regresi dinamai-per-bug + pola AAA. (`ai-regression-testing`, `coding-standards`)
- `workflows/4.6-6.3-doktrin-efisiensi.md`: Sample-and-Expand (ambang baca 70%/15/3) + "kontrak = pemanggil". (`spec-miner`)
- `workflows/4.16-build-sequence.md`: irisan vertikal tipis (fase mergeable mandiri). (`planner`)
- `workflows/13-glossary.md`: entri exception chaining.
- `CLAUDE_universal_v1.md` §5 (**always-load, +3 baris**): immutability, async paralel (`Promise.all`), penamaan KISS/DRY/YAGNI.

Sumber & vetting: `docs/plans/ECC_BORROW_LIST.md` (Gelombang 1 ditandai DIEKSEKUSI). 🟡 Bertahap (#24-42) + 🔴 Strategi Besar (#43-45) menyusul sesi terpisah. Belum menaikkan versi paket — keputusan rilis owner.

### Ditambah — serapan ECC Gelombang 2 Grup A (14 resep Bertahap 🟡)

Lanjutan serapan MIT © Affaan Mustafa (ditulis-ulang non-programmer). Owner memilih: Grup A (14 bersih) sekarang; Grup B berat ditunda; **#40 (skor visual 0-10) & #41 (council di §4.1) DITOLAK** (bertentangan dengan anti-skor-biner §8.2 3b + perampingan §4.1). Always-load hanya **+1 baris** (§4.6 daftar GENTING-rilis). Preflight strict 0/0/0.
- **Berkas baru `workflows/stack/4.14-1b-frontend-lanjutan.md`** (induk 4.14-1 penuh → dipecah §4.18): tes komponen React (RTL/MSW/`renderHook` gotcha), race `useEffect` + AbortController, Motion/Framer anti-CLS. (`react-testing`, `rules/react/hooks`, `motion-ui`) + entri INDEX + pointer di `4.14-stack-packs.md`.
- `workflows/stack/4.14-7-python.md`: setelan produksi Django (SSL/HSTS/cookie/Argon2), jebakan ORM (`bulk_create`/`save()` hilang-data), tabel error migrasi (fake-jangan-hapus), tes cepat `factory_boy`. (`django-security`, `django-reviewer`, `django-build-resolver`, `django-tdd`, `python-testing`)
- `workflows/stack/4.14-5-owasp.md`: file upload aman (magic-bytes + signed URL), auth kuat (breach-check HIBP + regenerasi sesi + blokir email sekali-pakai). (`django-security`, `laravel-security`)
- `workflows/4.15-pola-bantu.md`: paritas sandbox↔produksi (Pola B), menulis tes Playwright stabil (Pola D). (`ai-regression-testing`, `e2e-testing`)
- `templates/OPERASI_DATABASE_AMAN.md`: backfill ter-batch DO-loop (mengulang-sendiri, `FOR UPDATE SKIP LOCKED`). (`database-migrations`)
- `AUDIT_POST_SETUP_PROMPT_v1.md`: dimensi meta 🧮 Anggaran Konteks/Token (deterministik). (`context-budget`)
- `CLAUDE_universal_v1.md` §4.6 + `workflows/4.6-6.3-doktrin-efisiensi.md`: 6 kondisi GENTING penghenti-rilis (daftar, **tanpa** skor biner). (`production-audit`)

**Grup B (berat):** ✅ DISERAP 2026-07-11 — lihat bagian "serapan ECC Gelombang 2 Grup B" di bawah.
**Ditolak:** #40 audit visual skor 0-10, #41 council di §4.1 — alasan di `docs/plans/ECC_BORROW_LIST.md`.

### Ditambah — serapan ECC Gelombang 2 Grup B (3 resep berat 🟡: CI/CD, env+health, Dockerfile)

Lanjutan serapan MIT © Affaan Mustafa (ditulis-ulang non-programmer). Grup B butuh berkas/template baru. **Sadar-versi ditegakkan** (§8.2 Aturan 1): angka versi di sumber ECC diverifikasi ke dok resmi — ternyata banyak sudah drift, jadi template pakai versi **terbaru terverifikasi** + komentar tanggal, bukan angka ECC lama. Owner setujui via popup: terapkan semua + versi terbaru + benahi Node EOL. Preflight strict 0/0/0.

**Untuk non-programmer:** kit sekarang punya (1) contoh "ban berjalan otomatis" (pipeline) yang menguji + menayangkan kode; (2) cara app menolak jalan kalau setelan rahasianya salah (biar tak mati mendadak di tengah jalan) + "cek detak jantung" berlapis; (3) resep mengemas app jadi "paket beku" yang aman (bukan dijalankan admin) + pakai bahan versi yang masih didukung. Sekaligus ketahuan rekomendasi Node di kit sudah kedaluwarsa (Node 20 habis-dukungan) → diperbarui.

**Untuk programmer — penempatan per-berkas (sumber ECC dalam kurung):**
- **Berkas baru `templates/github/workflows/app-cicd.yml.example`** (#32): pipeline GitHub Actions 3-tahap (test di semua push/PR; build+deploy hanya `main` → ghcr.io). Komentar 2-lapis + blok SADAR-VERSI. Versi di-pin terbaru terverifikasi 2026-07-11: `checkout@v7`, `setup-node@v6` (`cache: "npm"` eksplisit — cache auto kini npm-only), `upload-artifact@v7`, `setup-buildx@v4`, `login@v4`, `build-push@v7`, cache `type=gha`, `permissions: packages: write`. Didaftarkan di `lib/kit-files.json` (`github_assets`) + rujukan di `workflows/stack/4.14-4-deploy.md` & checklist `STACK_GUIDE.md` §10. (`deployment-patterns`)
- `workflows/stack/4.14-4-deploy.md` **§health baru** (#33): validasi env fail-fast **zod v4** (`z.url()` — bukan v3 `z.string().url()`; diverifikasi zod 4.4.3) + health berlapis (`/health` cepat + `/health/detailed` cek DB → 503 "degraded") + probe Kubernetes. Pointer silang dari `templates/OBSERVABILITY_PRODUKSI.md` Pilar 3 (yang sudah punya `/health` sederhana — anti-dobel). (`deployment-patterns`)
- `templates/STACK_MIGRATION_GUIDE.md` §2.3 **di-upgrade** (#34, versi 1→2): Dockerfile Next.js minimal `node:20` → produksi multi-stage (deps→build→runner), user non-root, `HEALTHCHECK` → `/api/health`, layer-cache (COPY dependency dulu), pin `node:24-alpine`, `.dockerignore`, varian Python (uv), hardening compose (`no-new-privileges`/`read_only`/`cap_drop`). Ringkas 5-aturan + pointer di `4.14-4-deploy.md`. (`docker-patterns`, `deployment-patterns`)
- `templates/STACK_VERSIONS.md` **diperbaiki** (temuan sadar-versi): rekomendasi Node `20.x LTS` (sudah **EOL 2026-04-30**) → **24.x LTS Active** (Min 22 / Rec 24 / Tested 24) + catatan EOL terverifikasi ke nodejs.org.

### Ditambah — serapan ECC Strategi Besar #45 (template skill konten anti-"AI-slop" SEO off-page)

Serapan **MIT © Affaan Mustafa** (ditulis-ulang non-programmer), menggabung 5 skill konten ECC jadi 1 template **skill kustom §4.9 opt-in** — **BUKAN** baseline always-load (selaras §4.13 #8: off-page = skill kustom). **Sumber ECC ternyata MASIH ADA** (peringatan "mungkin hilang" tak terbukti) → ditulis dari 5 berkas asli yang **dibaca utuh**, bukan dari ringkasan. **Sadar-versi ditegakkan** (§8.2 Aturan 1): klaim kebijakan Google (E-E-A-T, "helpful content") diverifikasi ke dok resmi terbaru — "Helpful Content System" sudah dilebur ke sinyal inti (5 Mar 2024), AI-slop berisiko spam "scaled content abuse"; template pakai fakta terbaru + pointer "cek dok resmi", bukan hardcode. Owner pilih penempatan `templates/` via popup. Preflight strict 0/0/0.

**Untuk non-programmer:** kit sekarang punya "mode menulis" opsional yang bikin konten buatan AI (artikel, iklan, postingan medsos, landing) tidak terdengar generik/klise ("game-changer", "di era serba cepat ini", "klik di sini") — dan yang paling penting: **melarang AI mengarang testimoni/statistik palsu**. Penting untuk tim SEO: Google tak benci tulisan AI, tapi benci tulisan kosong produksi-massal untuk ngakalin peringkat. Skill ini **opt-in** (dihidupkan saat butuh), jadi tak membebani aturan yang dibaca AI tiap sesi.

**Untuk programmer — penempatan per-berkas (sumber ECC dalam kurung):**
- **Berkas baru `templates/SKILL_KONTEN_ANTISLOP.md`** (#45): template skill kustom §4.9 siap-adopsi, 2-lapis (👨‍💻+🙂), 5 komponen — (1) daftar-larang frasa AI-slop + heuristik "copot-ke-kompetitor" (`marketing-campaign:106`); (2) gerbang mutu copy (tes-5-detik above-fold, 1-CTA/aset, klaim-iklan=landing — `marketing-campaign:62-96`); (3) crosspost adaptasi per KENDALA bukan stereotipe, X/LinkedIn/Threads/Bluesky/blog (`crosspost:18-91`); (4) Brand Voice Profile reusable dari 5-20 sampel nyata + skema VOICE PROFILE (`brand-voice:20-98` + `voice-profile-schema`); (5) konten source-first (bukti bukan adjektif, JANGAN karang bukti = perluasan §8.2 Anti-Halusinasi — `article-writing:25`). Didaftarkan di `lib/kit-files.json` (`templates`). (`content-engine`, `marketing-campaign`, `article-writing`, `brand-voice`, `crosspost`)
- `workflows/4.13-skill-divisi.md` §4.13 #8 SEO: +1 baris pointer ke template (on-demand, bukan always-load).

Sisa ECC: 🔴 Strategi Besar #43, #44 (butuh desain/runtime). Belum menaikkan versi paket — keputusan rilis owner.

### Ditambah — serapan ECC Strategi Besar #43 (uji kepatuhan aturan di bawah tekanan)

Serapan **MIT © Affaan Mustafa** (ditulis-ulang non-programmer) dari ECC `skill-comply` — sebuah **metode MANUAL owner-gated** untuk mengukur apakah sebuah aturan/skill **benar-benar dipatuhi perilakunya**, bukan sekadar teksnya masih utuh. Inti "Prompt Independence" (Kepatuhan-Tanpa-Disuruh): aturan kuat tetap dipatuhi walau prompt justru menggoda melanggar. **2 risiko prinsip ditangani sadar-penuh:** (a) mekanisme skor asli — `compliance_rate` (`grader.py:116`) + vonis-otomatis-dua-nilai/biner `recommend_hook_promotion` (`grader.py:122`) — **SENGAJA DIBUANG** (langgar anti-skor-biner §8.2 3b, pola sama seperti #42 production-audit), diganti label GENTING/PENTING/RAPIKAN + "bukti diperiksa vs bukti hilang"; (b) diserap sebagai **metode manual**, BUKAN program-penjalan-otomatis (runner) / mengubah-aturan-sendiri (self-evolve) (§6.4) — langkah yang sering bocor hanya **diusulkan** ke owner untuk dijadikan penjaga mesin (menyambung #44), owner yang menyetujui. **Sumber ECC MASIH ADA** → dibaca utuh (`SKILL.md`, `scenario_generator.md`, `classifier.md`, `grader.py`; `agent-self-evaluation` juga dilirik — skor 1-5-nya justru contoh yang TAK diserap). Preflight strict 0/0/0.

**Untuk non-programmer:** kit sekarang punya "latihan kejut" opsional untuk mengecek apakah AI benar-benar menjalankan sebuah aturan — bahkan saat ada yang merayu melanggarnya ("buruan, jangan tanya, ini darurat!"). Kalau AI cuma patuh ketika diingatkan tapi bocor saat ditekan, itu ketahuan lebih awal (sebelum jadi masalah nyata). Alat ini **dipanggil saat perlu** (bukan tiap sesi) dan **kamu yang pegang kendali** — AI tidak mengubah aturannya sendiri, cuma mengusulkan.

**Untuk programmer — penempatan per-berkas (sumber ECC dalam kurung):**
- **Berkas baru `templates/UJI_KEPATUHAN_ATURAN.md`** (#43): template on-demand owner-gated, 2-lapis (👨‍💻+🙂), prosedur 4 langkah (pilih 1 aturan + "kunci jawaban" → 3 skenario ketegasan menurun mendukung/netral/menggoda → amati mode aman → lapor tanpa skor angka) + pagar keamanan (skenario "menggoda" wajib target sandbox, bukan eksekusi bahaya nyata) + tabel anti-pola + jembatan #44. Didaftarkan di `lib/kit-files.json` (`templates`, dikirim ke client). (`skill-comply`)
- `workflows/4.6-6.3-doktrin-efisiensi.md` (§4.6) + `CLAUDE_universal_v1.md` §2.1.1 (**always-load, +1 baris**): pointer ke template. Beda dari `tests/tingkat1-guard.test.mjs` yang menjaga **keutuhan-teks** aturan — ini menguji **kepatuhan-perilaku**.

Sisa ECC: 🔴 Strategi Besar **#44** (diserap berikutnya sebagai keputusan opsi — lihat bagian di bawah). Belum menaikkan versi paket — keputusan rilis owner.

### Ditambah — serapan ECC Strategi Besar #44 (keputusan opsi hook penegak checklist → ADR-008; ECC TUNTAS)

Serapan **MIT © Affaan Mustafa** dari ECC `agents/chief-of-staff.md`. Owner memilih (via popup): **dokumen-opsi + ADR**, **BUKAN** memasang hook. Ini menutup **sisa terakhir** ECC — gelombang serapan ECC **TUNTAS**. **Verifikasi teknis (§8.2 no-quote-no-claim) membalik mekanisme sumber:** klaim sumber "`PostToolUse` memblokir 'selesai' + LLM tak bisa skip" diverifikasi ke dokumentasi resmi Claude Code (via agen `claude-code-guide`) — ternyata **keliru**; `PostToolUse` *reactive* (tak bisa menahan, tool sudah jalan), event yang benar untuk menahan "selesai" = **`Stop` hook**, dan itu pun cuma **menguatkan** (bukan gembok mutlak). Klaim "~20% lupa" (tanpa sitasi) di-hedge. Preflight strict 0/0/0.

**Untuk non-programmer:** kit menimbang "satpam ketiga" — hook yang mengecek semua langkah wajib beres sebelum AI bilang "selesai". Keputusannya: **belum dipasang** (opsional, dinyalakan sendiri kalau perlu). Yang dicatat rapi = alasan + cara benar membuatnya kalau kelak dibutuhkan, plus koreksi penting: cara yang ditulis sumber ternyata **salah-pintu** untuk alat kita. Dua pagar yang tak boleh dilanggar kalau kelak dibuat: (1) satpam ini **tidak boleh menilai dirinya sendiri** "sudah beres" — harus dicek robot dari bukti nyata (kalau tidak, pengaman bisa dibujuk = bukan pengaman); (2) **tidak boleh mengunci kerja tim** kalau salah menduga.

**Untuk programmer — penempatan per-berkas (sumber ECC dalam kurung):**
- **Berkas baru `docs/decisions/ADR-008-hook-penegak-checklist-penyelesaian.md`** (repo-dev, TIDAK di `kit-files.json` — jangkauan "repo-dev dulu"): keputusan adopsi konsep sebagai **opsi opt-in default mati** (§4.12); mekanisme = **`Stop` hook** (bukan `PostToolUse`); penilaian "tuntas" WAJIB **deterministik** (robot cek `git`/tes/`preflight`, bukan AI bilang "sudah" — anti-bypass §8.1 #10); **fail-OPEN**; anti-self-evolve (menegakkan checklist yang SUDAH ADA, §6.4); beda peran dari `risk-gate.js` (`PreToolUse`-RISIKO vs `Stop`-PENYELESAIAN); runtime **ditunda** sampai ada pemicu nyata + persetujuan owner. (`chief-of-staff.md:100-144`)
- `CLAUDE_universal_v1.md` §2.1.1 (**always-load, +1 kalimat**): pointer opsi hook (opt-in, default mati, belum dibangun) → detail on-demand.
- `workflows/4.6-6.3-doktrin-efisiensi.md` (on-demand, dikirim ke client): sub-bagian opsi hook + koreksi teknis 2-lapis (`PostToolUse` vs `Stop`) + 4 syarat desain.
- `templates/UJI_KEPATUHAN_ATURAN.md`: rujukan #44 diperbarui (ADR-002 → **ADR-008** sebagai rumah keputusan #44).
- `docs/decisions/README.md` + `docs/serap-skill/KATALOG.md` + `docs/plans/ECC_BORROW_LIST.md`: registri & status (#44 → keputusan-ADR; sisa ECC 0/tuntas).

Belum menaikkan versi paket — keputusan rilis owner.

### Ditambah — serapan ECC frontend-lanjutan (6 jebakan CSS/viewport/a11y + debounce; di luar 44-kandidat)

Serapan **MIT © Affaan Mustafa** (ECC v2.0.0, **ditulis-ulang** non-programmer) dari 2 skill yang **belum tercakup** daftar 44-kandidat `ECC_BORROW_LIST.md`: `frontend-slides` (`viewport-base.css`, `STYLE_PRESETS.md`, `animation-patterns.md`) + `frontend-patterns` (`useDebounce`). *(Klarifikasi: "ECC TUNTAS" pada #44 merujuk 44/45 kandidat asli; telaah frontend ini menemukan 6 gotcha tambahan di luar daftar itu.)* Mengikuti proses baku `docs/serap-skill/PLAYBOOK.md` (7 langkah + 6 pagar). **Dedup diverifikasi** (Grep kit, semua ABSENT/PARTIAL): `dvh/svh/100vh`, `minmax/auto-fit`, `debounce`, `will-change`, `clamp(`, `calc(-1 * …)` = 0 hit di `workflows/`. **Sadar-versi ditegakkan** (§8.2 Aturan 1): Tailwind `h-dvh`/`min-h-dvh` diverifikasi = **v3.4** (blog resmi Tailwind) + dvh/svh/lvh Baseline "widely available" (Chrome 108 / Safari 15.4 / Firefox 101, ~2022+; caniuse) — ditulis **"cek versi terpasang"**, tak di-hardcode. **Always-load +0 baris** (semua on-demand). Semua 6 masuk **`workflows/stack/4.14-1b-frontend-lanjutan.md`** (14.960 char-JS < 18.000 → tak perlu berkas baru). Preflight strict **GENTING 0 · PENTING 0 · RAPIKAN 0**, 1015 tes lulus.

**Untuk non-programmer:** kit jadi lebih paham jebakan tampilan-HP yang sering bikin pusing tim: (1) layar "1 penuh" yang malah ketutup bilah alamat browser HP; (2) rak kartu produk yang "tumpah" ke samping di layar sempit (harus geser kiri-kanan); (3) kotak pencarian yang menembak database tiap huruf (boros + hasil kedip-kedip) — diperbaiki dengan "tunggu user selesai mengetik dulu"; (4) efek animasi yang dipasang berlebihan malah bikin HP murah berat; (5) huruf yang menolak membesar saat pengguna berpenglihatan-terbatas menaikkan ukuran font (aksesibilitas + bisa kena aturan hukum); (6) satu salah-tulis rumus ukuran CSS yang diabaikan browser diam-diam. Semua relevan langsung untuk fitur "daftar produk + pencarian" dan target uji layar HP ~360px.

**Untuk programmer — penempatan (semua → `workflows/stack/4.14-1b-frontend-lanjutan.md`; sumber ECC + vonis dalam kurung):**
- **A. Full-height `100dvh` berlapis** — ✅ SERAP: `height: 100vh; height: 100dvh;` + panduan `svh`/`lvh` (overlay pakai `svh` anti-CLS) + Tailwind `h-dvh`/`min-h-dvh` (≥3.4). (`viewport-base.css:21-22`, `STYLE_PRESETS.md:57,168`)
- **B. Grid kartu `repeat(auto-fit, minmax(min(100%, 250px), 1fr))`** — ✅ SERAP: cegah scrollbar horizontal (langgar WCAG Reflow) saat kontainer < 250px, tanpa media query. (`viewport-base.css:77`)
- **D. Debounce input pencarian (`useDebounce`)** — ✅ SERAP: potong jumlah query (1 bukan 6); beda peran dari `useDeferredValue`/`AbortController`/SWR; GOTCHA: SWR/Query TAK men-debounce. (`frontend-patterns/SKILL.md:223-248`)
- **C. `will-change` seperlunya** — ☑️ SERAP-OPSIONAL (tempel ke blok Motion pilar 2): berlebihan = KEBALIKAN optimasi (memori GPU bengkak, jank di HP RAM kecil). (`animation-patterns.md:122`)
- **F. Fluid `clamp()` + jebakan WCAG 2.2 SC 1.4.4** — ☑️ SERAP-OPSIONAL: `vw`-murni di tengah `clamp` → teks tak bisa diperbesar (a11y); selalu campur `rem`. Pelengkap Reflow #10 (SC 1.4.10) di `4.14-1`. (`viewport-base.css:42-56`)
- **E. Negasi fungsi CSS `calc(-1 * clamp(...))`** — ☑️ SERAP-OPSIONAL: `-clamp(...)`/`-min(...)` diabaikan browser diam-diam (bug hening). (`STYLE_PRESETS.md:298-314`)
- Blok **Kredit** di `4.14-1b` diperbarui (+`frontend-slides`/`frontend-patterns`); registri `docs/serap-skill/KATALOG.md` ditambah gelombang "frontend-lanjutan" (ter-vetting +6, diserap 48→54).

Belum menaikkan versi paket — keputusan rilis owner.

### Ditambah — serapan ECC gelombang Database (guardrail timeout+caveat managed · upsert idempoten · lock-ordering · peringatan SKIP LOCKED; di luar 44-kandidat)

Serapan **MIT © Affaan Mustafa** (ECC v2.0.0, **ditulis-ulang** non-programmer + dinetralkan) dari 4 sumber DB yang **belum tercakup** daftar 44-kandidat: `postgres-patterns`, `prisma-patterns`, `mysql-patterns` + agen `database-reviewer`. Mengikuti proses baku `docs/serap-skill/PLAYBOOK.md` (7 langkah + 6 pagar) — tiap sumber dibaca **verbatim di `file:baris`** sebelum menulis (pagar #2 no-quote-no-claim). **Dedup diverifikasi** (Grep kit, 0 padanan): `statement_timeout`/`idle_in_transaction`, `ON CONFLICT`/`EXCLUDED`/`upsert`/`skipDuplicates`, lock-ordering/`ORDER BY id FOR UPDATE`, salah-pakai `SKIP LOCKED` = ABSENT. **Sadar-versi ditegakkan** (§8.2 Aturan 1): semuanya ditulis "cek versi terpasang" (Postgres `FOR UPDATE`/`ON CONFLICT`, Django `select_for_update`, Prisma `upsert`/`skipDuplicates` — TAK di-hardcode). **Always-load +0 baris** (semua on-demand). Ukuran robot dijaga: `4.14-2-supabase-prisma.md` = **16.838 char-JS < 18.000** (tak perlu pecah). Preflight strict **GENTING 0 · PENTING 0 · RAPIKAN 0**, 1015 tes lulus.

**Untuk non-programmer:** kit sekarang paham 4 pengaman database yang sering bikin bug diam-diam pada uang/stok: (1) "rem otomatis" biar 1 query/transaksi nyasar tak menyandera server — dengan catatan penting bahwa DB kita "sewa terkelola" (Supabase-managed), jadi TAK boleh utak-atik "panel listrik utama" seperti tutorial server-sendiri; (2) tombol "simpan pintar" (upsert) yang aman diulang-ulang tanpa bikin data dobel; (3) aturan "selalu ambil sesuai nomor urut" saat transfer saldo/poin biar dua transaksi tak saling-tunggu-selamanya (deadlock); (4) peringatan keras: teknik "lewati yang sedang dilayani" (SKIP LOCKED) bagus untuk antrean tugas tapi BERBAHAYA untuk menghitung total uang — hasilnya bisa diam-diam kurang tanpa error apa pun.

**Untuk programmer — penempatan per-berkas (sumber ECC `file:baris` dalam kurung):**
- `templates/STACK_GUIDE.md` **§5.4 baru** "Pengaman timeout query & transaksi (guardrails)": `statement_timeout` (disetel di role query API `authenticated`/`anon` yang default-nya MENANG atas `authenticator` — 8s/3s — + wajib `NOTIFY pgrst, 'reload config'`) + `idle_in_transaction_session_timeout` (di `authenticator`), beda-lapisan dari timeout Prisma `$transaction`/`pool_timeout`. **Caveat inti:** sumber ECC memakai gaya self-hosted `ALTER SYSTEM SET …` + `SELECT pg_reload_conf();` yang **TIDAK jalan di Supabase-managed** (bukan superuser) → dialihkan ke `ALTER ROLE`/`ALTER DATABASE … SET` / Dashboard; `max_connections` = tier compute. (`postgres-patterns:124-137`)
- `workflows/stack/4.14-2-supabase-prisma.md` (3 sisipan):
  - **Upsert idempoten** (setelah tabel anti-pola Prisma, sebelum paginasi cursor): `ON CONFLICT (…) DO UPDATE`/`DO NOTHING` (`EXCLUDED`) + Prisma `upsert()` (non-atomik → tetap pasang UNIQUE di DB + tangkap `P2002`; `@updatedAt` ikut ter-set di `upsert`) + `createMany({ skipDuplicates })` impor massal anti-dobel. (`postgres-patterns:70-76`, `prisma-patterns:63,344`)
  - **Kunci banyak baris urutan KONSISTEN** (anti-deadlock transfer saldo/poin; setelah blok `FOR UPDATE SKIP LOCKED`): `SELECT … WHERE id IN (…) ORDER BY id FOR UPDATE` + Django `select_for_update().order_by('id')` + retry berbatas SQLSTATE `40P01`/`40001`. **Dialihkan MySQL→Postgres/Django.** (`database-reviewer.md:67`, `mysql-patterns:196-219`)
  - **Peringatan salah-pakai `SKIP LOCKED`** (2 baris DI DALAM blok SKIP LOCKED, setelah catatan versinya): JANGAN untuk baca data integritas-sensitif (saldo/stok/akuntansi) — sengaja melewati baris terkunci → "pemandangan tak lengkap" → hasil penjumlahan diam-diam SALAH; SKIP LOCKED hanya untuk antrian. (`mysql-patterns:39-41,240-241`)

Registri `docs/serap-skill/KATALOG.md` + `docs/plans/ECC_BORROW_LIST.md` ditandai **DISERAP** untuk gelombang DB ini. Belum menaikkan versi paket — keputusan rilis owner.

## [2.4.1] - 2026-07-10

### Diubah — perampingan `CLAUDE_universal_v1.md` (always-load) babak 4: dedup ke rak `workflows/`

**Untuk non-programmer:** berkas aturan yang dibaca AI tiap sesi dirampingkan lagi — uraian panjang yang detailnya SUDAH ada di rak `workflows/` (hasil v2.4.0) tidak lagi ditulis dobel di aturan inti; cukup mandat singkat + alamat berkasnya. Satu-satunya isi yang benar-benar pindah rumah ("4 disiplin operasional" §6.3) mendarat utuh di raknya. Hemat ~980 token per sesi, per client, setiap sesi — tanpa satu aturan pun hilang (dijaga tes frasa-jangkar).

**Untuk programmer:**
- **Dedup ke rak** (detail sudah ada di `workflows/`, ringkasan dobel dipadatkan jadi mandat + pointer): §15 (3 mode opsional), §4.18 protokol, §4.11 Refactor Bertingkat, §14.1 popup, §4.12 Co-Pilot (pagar WAJIB tetap tertulis penuh), §4.1 contoh blok terisi.
- **MOVE:** "4 disiplin operasional" (§6.3) → `workflows/4.6-6.3-doktrin-efisiensi.md` (satu-satunya konten yang benar-benar berpindah; ringkasan 1-baris + pointer tetap di inti).
- **CONDENSE di tempat:** §4.6 sub-blok "Cara cepat DAN benar"+"Hemat token" digabung, §4.17, blok "Dua Tingkat Aturan", §1.1 (analogi dipangkas — disetujui owner), §4.1 aturan-isi.
- **DITAHAN sengaja (risiko > manfaat):** §4.13, §6.1/§6.2, §4.7 — frasa-jangkarnya rapat dengan tes penjaga, hemat marginal.
- **Hasil terukur:** always-load 72.320 → **68.394 char (~980 token/sesi lebih hemat)**. Frasa-jangkar Tingkat-1 utuh — dijaga `tingkat1-guard`/`mode-hemat-guard`/`compaction-rule`/`skills-divisi`/`modify-workflow-rule`; 0 aturan berubah makna.

### Diperbaiki — audit rilis pra-terbit (buru-bug lintas-sudut kereta v1.63→2.4.1): 7 temuan valid ditambal + 2 penjaga permanen baru

**Untuk non-programmer:** sebelum benar-benar mengirim versi ini ke publik, kit "dibongkar" oleh banyak pemeriksa dari sudut berbeda untuk mencari cacat yang tersisa dari perombakan besar (menghapus PowerShell). Ketemu 7 hal yang perlu dirapikan — dua di antaranya penting: (1) satu "satpam otomatis" bisa keliru menuduh berkas MILIK project client sebagai "rujukan rusak" lalu memblokir tombol rilis mereka; (2) alat pemeriksa kesehatan kit ("doctor") lupa mengecek 39 berkas panduan baru, jadi bisa bilang "sehat" padahal ada yang hilang. Semua sudah ditambal, dan dua "penjaga permanen" (tes otomatis) dipasang supaya dua bug itu tak bisa kambuh diam-diam.

**Untuk programmer:**
- **[PENTING] `lib/workflows-ref-check.mjs`** — regex `PATH_REF_RE` diberi batas-kiri (negative lookbehind). Sebelumnya path client yang memuat segmen `workflows/` di tengah (mis. `docs/workflows/x.md`, `.github/workflows/README.md`, `src/workflows/y.md` yang disebut di `AGENTS.md`/`CLAUDE.md` kustom client) salah-tangkap → temuan "rujukan putus" PALSU tingkat PENTING → memblokir `preflight --strict` (gerbang rilis client). Dikunci tes negatif+positif baru di `tests/workflows-refs.test.mjs`.
- **[PENTING] `kit.mjs` (doctor cek file-inti)** — grup `workflows` (39 berkas rak, ditambah v2.4.0) MASUK daftar verifikasi installer tapi TERLEWAT dari daftar integritas doctor → client yang kehilangan folder `.claude-kit/workflows/` tetap divonis "sehat". `workflows` ditambahkan ke daftar grup doctor. Penjaga baru di `tests/kit-doctor-files.test.mjs`: doctor tak boleh menjaga LEBIH SEDIKIT grup daripada installer.
- **[RAPIKAN] `kit.mjs` (deteksi artefak)** — doctor kini juga mendeteksi sisa alat PowerShell v1 DI DALAM `.claude-kit/` (mis. setelah "update" via `npm create lintasai@latest` yang menimpa-tumpuk, bukan `npx lintasai update` yang cadangkan-lalu-segar) → INFO ajakan bersihkan + peringatan jangan jalankan `update-kit.ps1` lama. Stub `setup-pola-b.ps1` dikecualikan.
- **[RAPIKAN] Rujukan basi pasca-hapus-PowerShell disapu** (kereta v2 lolos-sisa): `UPGRADING.md`/`CHANGELOG.md` rollback `@1.63`→`@1.62` (v1.63.0 tak pernah terbit npm); `bin/lintasai.js` pesan blokir non-Windows (buang klaim "v1.x/PowerShell+WPF/tunggu v2.0+"); `Get-PackageManager`→`getPackageManager` (`AUDIT_POST_SETUP_PROMPT_v1.md`, `templates/PROMPT_LIBRARY.md`); `install-secret-hook.ps1`→`lib/install-secret-hook.mjs` (`templates/hooks/pre-commit-secret-scan.sh`); buang `lib/portfolio-read.ps1` (`templates/lintasai-portfolio.example.yml`).
- **[RAPIKAN] §4.12** — 2 penunjuk pengaman ("cek-silang skeptis" §8.2 + "persetujuan lama diverifikasi ulang" §6.1) yang terpangkas saat dedup babak-4 dikembalikan ke baris "Pengaman SELALU" (disiplinnya sendiri tetap hidup di §6.1/§8.2; ini memulihkan pointer).
- **Verifikasi:** 1015 tes Node hijau (+2 penjaga baru) + `preflight --strict` 0/0/0 + simulasi E2E client (pasang segar / update v1.62→2.4.1 / migrasi kartu `.psd1` / doctor-v2-atas-kit-v1) diulang hijau setelah tambalan.

---

## [2.4.0] - 2026-07-10

### Diubah — navigasi rujukan on-demand: LINTASAI_WORKFLOWS_v1.md dipecah per seksi ke `workflows/` + robot penjaga rujukan

**Untuk non-programmer:** buku rujukan besar yang dulu dibaca AI dengan cara "menebak halaman lewat pencarian judul" ternyata sering nyasar — audit membuktikan 11 dari 25 penunjuknya gagal ketemu dan 1 penunjuk mengarah ke halaman yang tidak pernah ada; saat nyasar, AI membaca SELURUH buku (~44-51 ribu token sekali kejadian) atau lebih buruk: mengarang isinya. Sekarang buku itu dipecah jadi 39 berkas kecil berlabel di folder `workflows/` — penunjuknya berupa alamat berkas yang pasti, dan ada "satpam otomatis" yang memastikan semua penunjuk nyambung SEBELUM rilis. Isi aturan tidak berkurang satu kalimat pun (dibuktikan robot pembanding baris). Client tidak perlu melakukan apa pun — update biasa sudah membawa semuanya.

**Untuk programmer:**
- **Pecah-per-seksi:** `LINTASAI_WORKFLOWS_v1.md` (1.772 baris / ~177 KB) → 39 berkas `workflows/<nomor>-<slug>.md` (+ `workflows/INDEX.md`), potong per rentang-baris terverifikasi (bukan per-judul — 6 judul palsu di pagar kode); bukti isi-utuh: 1.762 baris verbatim, 0 beda. Kasus khusus disembuhkan: §7.3a (anchor menggantung) kini berkas sendiri; §4.1 yang terbelah 2 lokasi disatukan; §4.6+§6.3 (judul gabungan) = 1 berkas 2 id; §4.14 (37,7 KB) terpecah per paket stack di `workflows/stack/` (lookup stack: ~9-11rb → ~1-3rb token).
- **Rujukan = path literal:** semua `LINTASAI_WORKFLOWS_v1.md §X` (40 titik di 6 berkas hidup) ditulis-ulang jadi path `workflows/...md`; aturan-baca §6 diganti (Read 1× / fallback INDEX ≤2 panggilan; pola grep-judul DIBUANG). Berkas lama jadi **pengalih tipis** (dikunci <4 KB) — rujukan basi dari memory/AGENTS kustom tetap tersambung.
- **Robot penjaga baru `lib/workflows-ref-check.mjs`** (cuma-baca, ~0 token, inti PURE): 6 cek — forward (rujukan→berkas nyata), reverse (nol berkas yatim), istilah-pensiun (pola lama dilarang balik), penanda `<!-- LINTAS:SEKSI §id -->` baris-1 + id unik, INDEX sinkron, anggaran ≤18 KB/berkas. CLI `--report` = inventaris rujukan. Terpasang di `npx lintasai preflight` (langkah "Rujukan rak workflows/", auto-skip anggun untuk kit/client lama) + pengunci `tests/workflows-refs.test.mjs` (uji negatif per-cek + regresi keras repo nyata + sinkron kit-files/tarball).
- **Wiring kirim:** grup `workflows` di `lib/kit-files.json` (dua-arah dikunci tes), `package.json` files[] +`workflows/`, verifikasi `setup-pola-b.mjs` + `REQUIRED_GROUPS`, `install-windows.mjs` menyalin rak ke `~/.claude/workflows/`. Tier 2 (AI-auto-sync), BUKAN breaking — client lama tak memburuk; efek terasa setelah update + buka chat baru.

---

## [2.3.0] - 2026-07-10

### Ditambahkan — penjaga anti-bloat berkas aturan (pelajaran sesi kompaksi jadi robot permanen)

**Untuk non-programmer:** kita baru sadar berkas aturan yang dibaca AI tiap sesi bisa menggembung pelan-pelan tanpa ketahuan (itu yang bikin boros token). Sekarang dipasang "satpam otomatis": tiap kali cek pra-rilis jalan, ia mengukur ukuran berkas aturan — kalau kegemukan, langsung diberi tanda supaya dirapikan. Plus aturan tegas: cerita/tanggal/sejarah masuk CHANGELOG, bukan berkas aturan. Ini mengubah pelajaran (yang tadinya ketemu manual) jadi penjaga permanen — di kit DAN tiap project client.

**Untuk programmer:**
- **Robot baru `lib/rules-budget-check.mjs`** — ukur ukuran `CLAUDE_universal_v1.md` (always-load) vs anggaran (default 128.000 char / ~32K token). Cuma-baca, deterministik. Cari berkas di root (kit) atau `.claude-kit/` (client) → auto-skip anggun kalau tak ada. CLI: `node lib/rules-budget-check.mjs [--budget-chars N]`.
- **Terpasang di `npx lintasai preflight`** ("Anggaran token berkas aturan"): lewat anggaran → RAPIKAN (saran, non-blokir harian). Terdaftar di `lib/kit-files.json` (node_lib) → ikut ke client.
- **Pengunci `tests/rules-budget.test.mjs`** — (a) fungsi ukur PURE, (b) **HARD regresi**: berkas aturan NYATA wajib di bawah anggaran (kalau ada yang membengkak → suite MERAH sebelum rilis), (c) aturan penempatan §14 + pointer robot terkunci.
- **Aturan penempatan konten (§14, always-load):** mandat singkat + pointer di berkas aturan; detail/contoh/tabel → `LINTASAI_WORKFLOWS_v1.md`; cerita asal-usul/insiden/kredit/tanggal → `CHANGELOG.md`/`docs/decisions/`. Menegakkan pola §4.18 Compaction yang sebelumnya cuma implisit.
- Anggaran = **langit-langit anti-regresi**, bukan target; naikkan HANYA dengan alasan sadar (aturan Tingkat-1 baru), bukan untuk menampung bloat.

---

## [2.2.2] - 2026-07-10

### Diubah — kompaksi lanjutan §7 & §4.6 `CLAUDE_universal_v1.md` (always-load)

**Untuk non-programmer:** merapikan lagi berkas aturan yang dibaca AI tiap sesi — bagian yang menjelaskan hal sama 2× dipadatkan, dan contoh/analogi panjang yang jarang dipakai dipindah ke berkas rujukan. Aturan dokumentasi & gerbang cek-mutu tetap berfungsi persis sama.

**Untuk programmer:**
- **§7.1 AUTO-SYNC:** blok "Default behavior tiap sesi" dihapus (mengulang 3 langkah WAJIB di atasnya) → disisakan 1 baris prinsip ("`.md` = bagian code + self-review diff").
- **§7.2 LAZY-GENERATE:** "Kenapa LAZY" (3 bullet) dipadatkan jadi 1 baris.
- **§7.3a:** paragraf "Kenapa bukan dokumen saja" + 2 analogi (Google Maps/brankas) + checklist mikro 5-centang DIPINDAH ke `LINTASAI_WORKFLOWS_v1.md` (echo §7.3a). Always-load tetap punya 4-langkah inti + catatan Read-before-Edit + pengunci — semua frasa-jangkar `modify-workflow-rule` utuh.
- **§4.6:** daftar "7 prinsip efisiensi" (yang juga sudah ada lengkap di §6.3 + workflows) diringkas jadi ringkasan pendek + pointer — hentikan triplikasi.
- **Hasil:** always-load ~31.090 → **~30.670 token/sesi** (turun ~420 token). 989 tes + `tingkat1-guard`/`compaction-rule`/`modify-workflow-rule`/`mode-hemat-guard` hijau; 0 fungsi berubah. §8.2 (anti-halusinasi) SENGAJA tak disentuh — pilar Tingkat-1, contoh dipertahankan.

---

## [2.2.1] - 2026-07-10

### Diubah — buang narasi "asal-usul aturan" dari `CLAUDE_universal_v1.md` (always-load)

**Untuk non-programmer:** berkas aturan yang dibaca AI tiap sesi dibersihkan dari "cerita kenapa aturan ini dibuat" — tanggal insiden lama, kredit sumber, dan justifikasi historis. Cerita ini menarik untuk arsip, tapi **tidak membantu AI membangun web/app** dan dibayar token tiap sesi. Aturannya sendiri berfungsi **persis sama** tanpa cerita itu. Pesan "jangan hidupkan lagi pola lama" (anti-kambuh) tetap dipertahankan — cuma cap tanggalnya yang dibuang.

**Untuk programmer:**
- **Dihapus (provenance/anekdot murni):** paragraf "Kenapa dipertegas" (§2.1, insiden narasi Inggris 2026-06-13), "Locked lesson" (§2.1.1), blockquote atribusi ECC + insiden Aturan 10 (§8.1), "Pelajaran nyata 2026-06" (§8.2 Aturan 3), blockquote "Asal: audit ECC" (§8.2 3b), kredit ECC di §8.2 Aturan 3b/ringkasan-hitung/§3 Plan/§8.2 library-tip.
- **Cap tanggal/versi dibuang** (pesan tetap): §2.1 poin #78, §2.1.1 "substantive", §4.1 (211/271/238), §4.6 (333), §6.3 (562/568), §14.1 (v1.5.20/v1.11.0/v2.0.0). Catatan anti-kambuh (jangan hidupkan lensa/pengecualian lama) dipertahankan.
- **Hasil:** always-load ~31.650 → **~31.090 token/sesi** (turun ~560 token lagi). 989 tes + `tingkat1-guard`/`compaction-rule`/`mode-hemat-guard` tetap hijau; 0 aturan/fungsi berubah. Atribusi ECC aman dibuang: konten memang ditulis-ulang (bukan salinan teks), jadi tak ada kewajiban lisensi.

---

## [2.2.0] - 2026-07-10

### Diubah — kompaksi `CLAUDE_universal_v1.md` (always-load) lanjutan: dedup + padatkan + pindah detail on-demand

**Untuk non-programmer:** berkas aturan yang otomatis dibaca AI tiap sesi dirapikan lagi — bagian yang ditulis dobel dibuang, penjelasan yang bertele-tele dipadatkan, dan detail yang jarang dipakai dipindah ke berkas rujukan (dibaca hanya saat perlu). Hasilnya AI mulai kerja lebih murah + lebih cepat tiap sesi, **tanpa satu pun aturan keselamatan/standar hilang** — semua dijaga robot tes. Contohnya: daftar perintah berbahaya yang tadinya ditulis 2×, sekarang 1× saja; penjelasan format "2 versi jawaban" yang tadinya diulang 6× jadi 1 sumber.

**Untuk programmer:**
- **DEDUP:** daftar perintah destruktif (§8.1 #3) tak lagi menyalin daftar §8.2 Aturan 5; §12 "terobos pagar" merujuk §8.1 #10 (bukan mengulang); catatan migrasi `project.lintas.psd1` di §7.9 tak lagi dobel.
- **CONDENSE:** §4.1 pengulangan aturan blok 2-versi (👨‍🎓/🙂) dipadatkan dari ~6 restatement jadi 1 kanonik (roster "13 divisi" + heading + Knowledge Transfer tetap, dikunci `tingkat1-guard`); §2.1 poin 6 (kosakata internal) + analogi panjang §8.2 dipadatkan.
- **MOVE → `LINTASAI_WORKFLOWS_v1.md` (on-demand):** detail §7.6 Auto-Health-Check (kapan + 6 cek), §7.7 Bus Factor (skor 0-4), §8.1 #4 skenario tier-guard + contoh SALAH/BENAR, §8.2 Aturan 3b daftar "jangan asal di-flag" (a-h). Aturan inti + frasa-jangkar tetap di always-load; hanya elaborasi yang pindah.
- **DELETE usang:** §14.1.0 tak lagi menjelaskan sistem "Popup Tipe B (GUI PowerShell)" yang pensiun sejak v2.0.0.
- **DITAHAN (sengaja):** §9 (DB) + §10 (Frontend/UX/SEO) TIDAK dipindah — itu standar profesional inti yang harus selalu terbaca; sudah berupa one-liner padat.
- **Hasil terukur:** always-load ~33.180 → **~31.650 token/sesi** (turun ~1.530 token, sudah termasuk fitur Mode Hemat v2.1.0 yang tetap ada); detail yang pindah tak lagi dibayar per-sesi. Standar 0 berubah — dijaga `tingkat1-guard`, `compaction-rule`, `modify-workflow-rule`, `mode-hemat-guard`.

---

## [2.1.0] - 2026-07-10

### Ditambahkan — Mode Hemat (Lean Mode): saklar irit-token + cepat, opt-in per proyek

**Untuk non-programmer:** sekarang tiap proyek bisa menyalakan **Mode Hemat** — AI mengerjakan task rutin **lebih cepat + lebih murah token** dengan memangkas "hiasan" jawaban yang tidak diminta (penjelasan 2 versi & blok Tinjauan Divisi saat task sepele, dokumen dibuat hanya saat diminta, narasi to-the-point). Yang penting: **pagar keselamatan TIDAK ikut dimatikan** — keamanan, anti-ngarang, wajib Bahasa Indonesia gaya awam, dan gerbang cek-mutu sebelum rilis tetap menyala. Analogi: seperti "mode hemat baterai" HP — animasi dimatikan, tapi telepon darurat & alarm tetap jalan. Default **MATI**; nyalakan dengan mencentang di `AGENTS.md` bagian "Opt-in" atau ketik "mode hemat" di chat.

**Untuk programmer:**
- `CLAUDE_universal_v1.md` §15: definisi ringkas Mode Hemat (DEFAULT MATI, opt-in) + daftar pagar Tingkat-1 yang **tak pernah** ikut dilonggarkan (§8/§8.1 keamanan, §8.2 anti-halusinasi, §2.1 bahasa non-programmer, §4.6 QA/QC). Di titik risiko (login/bayar/data-pribadi/skema-DB/rilis) mode otomatis "mundur" ke penuh.
- `LINTASAI_WORKFLOWS_v1.md` §15: detail perilaku "Saat AKTIF" (yang dilonggarkan Tingkat-2 vs yang kebal Tingkat-1) + contoh + analogi. Memformalkan doktrin "usaha pas-ukuran" §6.3 jadi saklar eksplisit.
- `AGENTS.md.template`: bagian **Opt-in** baru (sebelumnya dirujuk §15 tapi belum ada di template) — checkbox Mode Hemat + Auto-Confirm + Co-Pilot + ide opsional, semua default tak-tercentang (mati).
- Pengunci anti-rot baru `tests/mode-hemat-guard.test.mjs`: memastikan Mode Hemat tetap DEFAULT MATI + klausa "pagar Tingkat-1 tak pernah dilonggarkan" (beserta anti-halusinasi, bahasa non-programmer, QA/QC) tak bisa terhapus diam-diam saat berkas aturan disunting. Hilang salah satu → suite merah.
- Tak ada perubahan breaking; standar default proyek yang TIDAK menyalakan Mode Hemat identik seperti v2.0.0.

---

## [2.0.0] - 2026-07-10

**[BREAKING]** Rilis BESAR (1.63.0 -> 2.0.0): **hapus total PowerShell — kit kini 100% Node.** Wajib baca panduan pindah-versi: `UPGRADING.md` bagian "v1.62.x / v1.63.x → v2.0.0".

### Diubah [BREAKING] — semua alat PowerShell dihapus; semua perintah lewat `npx lintasai`

**Untuk non-programmer:** sejak v1.63.0 kit membawa "dua mesin" untuk pekerjaan yang sama — mesin **Node** (jalan di semua komputer) dan mesin cadangan **PowerShell** (khusus Windows) yang sudah dicap USANG. Mulai versi ini, mesin cadangan itu **benar-benar dicopot**: skrip lama `kit.ps1`, `update-kit.ps1`, dan kawan-kawannya tidak ada lagi di dalam kit. Semua pekerjaan kini lewat satu pintu: `npx lintasai <perintah>` (mis. `npx lintasai doctor`, `npx lintasai update`). Yang perlu kamu lakukan cuma satu: **update lewat jalur resmi `npx lintasai update`** (JANGAN pakai skrip updater lama), lalu jalankan `npx lintasai doctor` untuk memastikan semua hijau. Catatan: PowerShell sebagai *jendela terminal Windows* (tempat kamu mengetik `npm`/`npx`) tetap kamu pakai seperti biasa — yang dihapus hanya alat kit yang ditulis dalam bahasa PowerShell.

**Untuk programmer:**
- Dihapus: 6 orkestrator akar (`kit.ps1`, `update-kit.ps1`, dll.) + 19 `lib/*.ps1` + 36 suite tes Pester + 3 pelari PS + 4 template `.ps1`/`.psd1` + seluruh wiring PS (`PS_FALLBACK`, parity-check, jalur PS gerbang/CI) — dikerjakan bertahap di kereta v2 (Fase 2–3f, lihat riwayat commit `feat(v2-fase*)!`). Manifest daftar-berkas kini `lib/kit-files.json` (pembaca dua-format: doctor v2 atas kit era-v1 = INFO ajakan update, bukan vonis rusak). Satu-satunya `.ps1` tersisa = **stub penyelamat `setup-pola-b.ps1`** (D6, dipertahankan sampai v3) supaya updater PS lama yang terlanjur jalan tidak tersangkut setengah-jadi; dijaga tes "tarball 0 `.ps*` kecuali stub".
- Migrasi artefak client: kartu `project.lintas.psd1` → `project.lintas.jsonc` via `npx lintasai migrate-project-card` (default SIMULASI, `--apply` untuk sungguhan; idempoten + cadangan ber-cap-waktu + catat buku-besar `.migration-state.json`); `.github/scripts/setup-branch-protection.ps1` → `npx lintasai protect-main` (default SIMULASI). Angka skema artefak TIDAK naik (tetap 1) — yang berubah wadah berkas, bukan format isinya.
- Migration Steps (urut, SIMULASI-dulu): (1) `npx lintasai update` — cadangan `.claude-kit.backup-<cap-waktu>` otomatis; (2) `npx lintasai migrate-project-card` (SIMULASI) → tinjau → `--apply`; (3) verifikasi `npx lintasai doctor` hijau + laporan migrasi "Termigrasi X dari X". Rollback: pulihkan `.claude-kit.backup-<ts>` + `npm install lintasai@1.62` (v1.63.0 = jembatan yang tak diterbitkan ke npm). Detail lengkap: `UPGRADING.md` + keputusan arsitektur `docs/decisions/ADR-007-hapus-total-powershell-v2.md` (supersede ADR-003/004/005).

### Diubah — paket hemat token per-sesi client (±4.700 token/sesi, kualitas dijaga tes pengunci)

**Untuk non-programmer:** AI di project kamu jadi lebih murah + lebih cepat mulai kerja, TANPA menurunkan mutu — yang dipangkas cuma pengulangan yang tidak perlu, dan ada "satpam otomatis" baru yang memastikan aturan keselamatan tidak ikut terpangkas.

**Untuk programmer:**
- `lib/lang-reminder.mjs`: suntikan per-prompt dipadatkan 1.032 → 604 char (−~107 token TIAP prompt); semua frasa yang dikunci `tests/lang-reminder.test.mjs` dipertahankan.
- §7.6 Auto-Health-Check: default berubah dari **tiap sesi** → **sesi pertama pasca pasang/update + reaktif** (tool error berbau lingkungan / user menyebut masalah lingkungan) + manual `npx lintasai doctor` (−~500 token/sesi).
- §7.9/§7.3/§3: kewajiban dobel-baca `project.lintas.jsonc` **bareng** `docs/architecture.md` dihapus — baca **SATU peta** (kartu kalau ada; `architecture.md` menyusul hanya saat butuh narasi/konvensi) (−~400 token/sesi).
- §7.8: dokumen keunggulan/fitur (mis. `KEUNGGULAN.md`) kini **sinkron BATCH 1× pra-rilis** dari CHANGELOG/git log + baris "Terakhir diselaraskan: vX.Y.Z" — bukan tiap perubahan fitur (dokumen besar tak lagi dibaca+ditulis ulang berkali-kali per rilis).
- DoD §4 (checkbox Gerbang §4.6): diselaraskan dengan §4.6/§6.3 — suite tes penuh dijalankan **1× SETELAH edit terakhir** sebelum deklarasi "selesai"; edit-antara cukup tes terdampak. Gerbang tetap tanpa kecuali.
- §4.18 Compaction: pemicu baru (b) — berkas yang dibaca berulang per task (`RESEP_PERUBAHAN.md`/`architecture.md`/kartu) membengkak > ~2× skeleton (~8 KB) → AI tawarkan padatkan; nomor resep dilarang dinomori ulang.
- `AGENTS.md.template` dipadatkan 5.651 → 3.053 char (−~650 token/sesi untuk pemasangan baru; `AGENTS.md` client lama tidak disentuh saat update).
- Diet redaksi seksi Tingkat 2 `CLAUDE_universal_v1.md` (§4.3b/§4.5/§4.7/§4.11/§4.12/§4.13/§6.1-§6.3/§9/§11/§15 dll): 137.271 → 133.047 char — isi aturan utuh, hanya redaksi dipadatkan; pagar Tingkat 1 (§2.1/§2.1.1/§8/§8.1/§8.2/§4.1) TIDAK disentuh.

### Diubah — Tinjauan lintasAI Divisi dirampingkan: 15 → 13 lensa + blok hanya tampil saat ada temuan (keputusan owner 2026-07-10)

**Untuk non-programmer:** dua baris "penjaga" (🤔 Adversarial Reviewer + 🔄 Reversibility) yang dulu menutup hampir tiap jawaban AI **dihapus** — terlalu sering muncul di semua kondisi dengan isi yang tidak penting. Sekarang blok tinjauan hanya muncul kalau memang **ada temuan yang perlu kamu tahu** (atau untuk keputusan besar / kalau kamu minta). Pengaman intinya TIDAK dicopot: AI tetap wajib punya bukti sebelum mengklaim (aturan anti-ngarang §8.2) dan tetap wajib konfirmasi + siapkan rencana-balik sebelum aksi berbahaya.

**Untuk programmer:**
- `CLAUDE_universal_v1.md` §4.1 + §2.1.1 Kategori #4 + §4.17: roster 15 → **13 divisi** (12 original + 📚 Knowledge Transfer); aturan tampilan "default 2 penjaga utama" diganti "**default TANPA blok** — tampilkan hanya lensa dengan temuan nyata; 13 penuh untuk keputusan besar/diminta". Disiplin anti-ngarang tetap di §8.2 (Tingkat 1); rencana-balik tetap ditagih §11 (rollback plan) + §8.2 Aturan 5.
- `LINTASAI_WORKFLOWS_v1.md` §4.1: contoh terisi, skeleton format, dan tabel pertanyaan-per-lensa ikut jadi 13.
- `lib/lang-reminder.mjs`: pengingat per-prompt kini menyebut "blok Tinjauan HANYA saat ada temuan nyata/keputusan besar" (frasa "default 2 penjaga" dihapus).
- Tes pengunci diperbarui: `tests/tingkat1-guard.test.mjs` (roster 13 + penjaga anti-hidup-kembali 2 lensa lama) + `tests/lang-reminder.test.mjs` (13 lensa + frasa temuan-nyata).
- Dokumen pendukung diselaraskan: `KEUNGGULAN_LINTASAI.md` (seksi K + Y + blok tinjauan penutup), `PERBANDINGAN_RINCI_PERDIMENSI.md` (dimensi 11), `docs/PETA_SUMBER_KEBENARAN.md`, `docs/RESEP_PERUBAHAN.md` (contoh angka-konsep).

### Diubah — AI lebih cepat membaca rujukan + 4 bug alur dibereskan (Paket A pindai babak-2)

**Untuk non-programmer:** AI di project kamu sekarang membaca buku rujukan besar **per-bab lewat daftar isi** (bukan menelan seluruh buku = hemat sampai ±44.000 token tiap kali konsultasi), dan 4 kesalahan kecil di buku panduan pemasangan/update dibereskan supaya AI tidak salah mencocokkan pilihanmu.

**Untuk programmer:**
- Aturan **pola-baca berkas rujukan besar** baru di §6: berkas >±20 KB (`LINTASAI_WORKFLOWS_v1.md` 195 KB, `MCP_SETUP.md`, `PROMPT_LIBRARY.md`) DILARANG `Read` utuh — `Grep` judul berawalan angka → `Read` per-seksi; preamble WORKFLOWS diberi peringatan judul-palsu-di-blok-contoh.
- Aturan **darurat popup** baru di §14.1 (dari insiden nyata owner): konteks pilihan wajib tampil di chat SEBELUM popup; user lapor popup bermasalah / 2× menjawab via ketikan bebas → beralih ke daftar teks bernomor, jangan ulangi popup yang sama.
- **4 bug diperbaiki:** label usang "[1] Full"/"Quick" → kanonik "[1] LENGKAP"/"[2] CEPAT" (4 titik `PROJECT_LIFECYCLE` + 2 titik `JALANKAN_KIT`); blok PowerShell sisa di `UPDATE_KIT_PROMPT_v1.md` Step 2 diganti `npx lintasai update --check-only` / `npm view lintasai version` (jalur eksternal); flag `-CleanupBackups` → `--cleanup-backups`; rujukan nomor-baris basi `POST_SETUP` → rujukan tekstual stabil.
- Diet 4 dokumen alur (total −6,1 KB per siklus baca): `JALANKAN_KIT` (cerita Tipe-B pensiun 5× → 1×, blockquote kembar, daftar pengecualian popup), `AUDIT_POST_SETUP` (cerita gelombang 6 lokasi → kanon step 5-7 + pointer; tabel contoh analogi → pointer library), `PROJECT_LIFECYCLE` (blok 5-section → rujukan `_EXAMPLE.md`; mode invocation ringkas), `UPDATE_KIT_PROMPT` (peringatan cadangan jalur npm dipindah ke Step 0 — tempat keputusannya).
- `templates/ANALOGI_LIBRARY.md` v4: +3 entri (God Component, Memory leak, Tahan Penggabungan) — kini 35 jargon; hitungan diselaraskan di semua sebutan.

### Diubah — kiriman ke client −13% (Paket B pindai babak-2)

**Untuk non-programmer:** paket yang diunduh client saat pasang/update kit jadi **13% lebih kecil & lebih cepat** — riwayat perubahan era lama dipindah ke gudang arsip (entri keamanan tetap dibawa), dan catatan internal dapur kit tidak lagi ikut terkirim.

**Untuk programmer:**
- `CHANGELOG.md` 415 KB → 160 KB: 107 entri < v1.33.0 (era pra-npm) pindah ke `CHANGELOG_ARCHIVE.md` (GitHub-only). **6 entri legacy berlabel dipertahankan UTUH** (1.30.1, 1.26.0, 1.23.3, 1.23.2, 1.9.0, 1.7.7 — enumerasi mesin `testChangelogLabel` pada heading+body) supaya banner "pasang SEGERA" client lompat-versi tetap bekerja; celah lama v1.9.0 ditutup (penanda `[SECURITY]` ditanam di body — pemindai rentang membuang heading).
- `package.json` files[]: `.github/` → hanya `workflows/validate.yml`; 11 dokumen internal dikecualikan (7 docs robot + ADR-003..006); entri registry/perujuk terkirim diberi anotasi "(internal kit — tidak ikut paket npm)" — TIDAK dihapus (robot registry tetap hijau).
- Tarball: 944.664 → 823.000 byte gzip (170 berkas); ambang penjaga `tests/package-bundle.test.mjs` diperketat 2 MB → 1 MB (alarm dini anti-bengkak).

### Diubah — 4 robot mutu yang "tidur" dibangunkan (Paket C pindai babak-2; mutu project client naik, biaya token ~0)

**Untuk non-programmer:** kit sudah lama punya beberapa "satpam" siap pakai yang tidak pernah disuruh jaga. Sekarang mereka jaga otomatis: pengecek "kunci server lupa dipasang" (penyebab web mati saat tayang tersering), pengecek "bahan baku kedaluwarsa" (library rentan dibobol), gerbang mutu otomatis di GitHub (ditawarkan saat pasang), dan layar pantau semua repo (ditawarkan saat pecah-repo).

**Untuk programmer:**
- `runEnvKeys` masuk gerbang preflight (tiap run): banding NAMA kunci `.env.example` vs `.env.local` — RAPIKAN non-blokir; nilai rahasia tak pernah tampil (dikunci tes).
- `runStackCheck` masuk gerbang `--strict` saja: tsc / `npm audit` (CVE) / ruff / bandit dkk. via `lib/stack-check.mjs` (+opsi baru `excludeTools` — eslint di-exclude anti-dobel); dibungkus RAPIKAN owner-gated (temuan alat aslinya PENTING = memblokir strict tanpa pembungkus); gagal-jaringan `npm audit` → INFO dilewati, bukan temuan palsu.
- `JALANKAN_KIT.md` 18c: popup kondisional tawaran `npx lintasai enable-preflight-ci` saat project terhubung GitHub (+ update PETA Bagian 0; catatan biaya jujur menit Actions Windows 2× di repo privat).
- `JALANKAN_KIT.md` 19b-ii + `SPLIT_REPO_MIGRATION_PROMPT_v1.md`: tawaran `npx lintasai board` (papan risiko semua repo, cuma-baca — deteksi perubahan `.env` belum aman = GENTING) setelah pecah-repo / saat multi-repo.
- `templates/github/workflows/preflight.yml`: langkah build kondisional Next.js (continue-on-error) sebelum preflight — robot anggaran-halaman kini benar-benar mengukur (dulu auto-lewat tanpa `.next/`).
- **Bug-fix bonus (ketahuan begitu robotnya dibangunkan):** `lib/stack-check.mjs` gagal memanggil alat `.cmd` (mis. `npm`) di Windows dengan Node terpasang di `C:\Program Files` — path patah di spasi saat lewat shell → temuan PALSU "alat melaporkan masalah". Path kini dikutip; `npm audit` benar-benar jalan di Windows umum untuk pertama kalinya.

### Dihapus [BREAKING] — fungsi auto-catat `KEUNGGULAN_LINTASAI.md` dicopot total

**Untuk non-programmer:** dulu kit punya aturan yang MEWAJIBKAN AI menulis-ulang satu dokumen "daftar keunggulan" raksasa (±47 KB) SETIAP kali ada fitur baru — padahal dokumen itu tak pernah dikirim ke project kamu; murni catatan internal dapur kit. Menulis-ulang buku setebal itu berulang kali = boros waktu & boros "jatah kerja" AI (token) tanpa nilai tambah buat kamu. Mulai versi ini aturan itu **dihapus total**: AI tidak lagi diwajibkan merawat dokumen tersebut. Untuk kamu efeknya positif — AI di project-mu tak lagi membuang tenaga di pekerjaan internal itu. Ditandai **BREAKING** karena mengubah perilaku baku AI (satu kewajiban dokumentasi dicabut), sesuai disiplin penomoran versi.

**Untuk programmer:**
- File dev-only `KEUNGGULAN_LINTASAI.md` dihapus (tak pernah masuk kiriman client) + aturan **§7.8** di `CLAUDE_universal_v1.md` dicopot.
- Entri KEUNGGULAN dicabut dari `KIT_VERSION_CHECKS` (`lib/consistency-check.mjs`) → `node kit.mjs bump` kini mengecap **5 berkas** (dulu 6); tes `tests/consistency-check.test.mjs` diselaraskan (5 → 4 findings).
- Rujukan dibersihkan di `CONTRIBUTING.md`, `docs/RESEP_PERUBAHAN.md`, `.github/pull_request_template.md`, `docs/PETA_SUMBER_KEBENARAN.md`, `docs/plans/POLA_REPO_AMAN.md`, `docs/architecture.md`.
- Alasan: dokumen ~47 KB yang wajib ditulis-ulang tiap fitur = boros token/waktu develop tanpa nilai unik.

### Dihapus [BREAKING] — registry "daftar isi docs" `architecture_auto.md` dicopot menyeluruh

**Untuk non-programmer:** kit dulu punya "satpam daftar isi" yang otomatis membuat & merawat sebuah daftar isi semua dokumen (`architecture_auto.md`) di project. Masalahnya: tiap kali ada dokumen `.md` ditambah/dihapus, daftar itu harus dibaca+ditulis ulang — biaya "jatah kerja" AI berulang tanpa manfaat khas, karena untuk navigasi sebenarnya cukup pakai **peta besar** (`architecture.md`, yang TETAP dipertahankan) + fitur cari kata (`Grep`). Mulai versi ini fitur daftar-isi-otomatis itu **dibuang menyeluruh** dari kit. Ditandai **BREAKING** karena mengubah perilaku baku di project client (satu berkas robot + aturannya dicabut).

**Untuk programmer:**
- Peta makro `architecture.md` **DIPERTAHANKAN**; hanya registry TOC yang dibuang.
- Kode robot dihapus dari `lib/project-manifest.mjs` (`getLintasRegistryFinding`, `invokeLintasRegistryCheck`, ref-key `registry`); wiring `runRegistryCheck` dicopot dari `tests/preflight.mjs`; file tes `tests/project-manifest-registry.test.mjs` dihapus.
- Entri deploy dicabut dari `lib/kit-files.json`, `setup-pola-b.mjs`, `install-windows.mjs` (tes install-windows: 9 → 8 berkas).
- Doktrin: **§7.4** ARCHITECTURE REGISTRY dihapus (aturan dokumentasi 4 → 3); **§7.3** READ-MINIMAL kini pakai `architecture.md` + `Grep`.
- 2 file dihapus: `docs/architecture_auto.md` + `templates/architecture_auto.md`.
- ±45 rujukan prosa dibersihkan di 13 file client (`AUDIT_POST_SETUP_PROMPT_v1.md`, `JALANKAN_KIT.md`, `LINTASAI_WORKFLOWS_v1.md`, `PROJECT_LIFECYCLE_PROMPT_v1.md`, `SPLIT_REPO_MIGRATION_PROMPT_v1.md`, `templates/_PATTERNS`, `templates/_EXAMPLE`, `PROMPT_LIBRARY.md`, `MIGRATE_TO_SUBFOLDER_PROMPT_v1.md`, `DB_SCHEMA_SCAN_PROMPT.md`, `RLS_SETUP`, `TEAM_FLOW_SKETCH`, `architecture.md`).
- Alasan: TOC auto-maintained = biaya token berulang tiap tambah/hapus `.md` tanpa nilai unik; navigasi cukup peta makro + `Grep`.

### Ditambah

- `tests/tingkat1-guard.test.mjs` — 11 tes pengunci frasa pagar Tingkat 1 (bahasa non-programmer, PRE-SEND, 8 divisi, Tinjauan, keamanan §8/§8.1/§8.2, tie-breaker §0). Sebelumnya 0 tes menjaga seksi-seksi ini — diet/penyuntingan berikutnya tak bisa diam-diam membuang pagar.
- `tests/install-anchors.test.mjs` — 10 tes pengunci anchor alur pemasangan (heading "Klarifikasi Terminologi Popup"/"Cara Tampil Popup", Popup #1-#3, label kanonik LENGKAP, larangan rujukan nomor-baris basi + label "[1] Full" usang).
- `tests/changelog-archive.test.mjs` — 5 tes penjaga arsip: entri berlabel DILARANG terarsip (pakai `testChangelogLabel` asli), 6 entri legacy tetap utuh, penanda body v1.9.0, arsip tak ikut files[]/kit-files, penunjuk arsip ada.
- `tests/preflight-robot-baru.test.mjs` — 6 tes penjaga `runEnvKeys` + `runStackCheck`: level DILARANG memblokir gerbang (selalu OK/INFO/RAPIKAN) + nilai rahasia `.env` DILARANG bocor ke laporan.

---

> **📦 ARSIP RIWAYAT LAMA (entri < v2.0.0):** entri yang tak-berlabel sudah dihapus dari repo (riwayat lengkap tetap ada di riwayat git). **Pengecualian:** entri berlabel `[SECURITY]`/`[BREAKING]`/`[SCAN-REQUIRED]` di bawah ini SENGAJA dipertahankan utuh supaya banner "pasang SEGERA" untuk client yang lompat banyak versi tetap bekerja (dijaga `tests/changelog-labels.test.mjs`).

## [1.58.0] - 2026-06-24

> Rilis FITUR + KEAMANAN. Naik MENENGAH (1.57.x -> 1.58.0): mode microservice jadi warga kelas satu + penegak Bahasa Indonesia kini sampai ke project klien. Mengandung 1 perbaikan **[SECURITY]** (celah robot .env; disarankan update). Tidak ada perubahan breaking.

### Diperbaiki — Pengalaman update klien (dari audit kesiapan rilis)

Audit kesiapan rilis (2026-06-25) menemukan 3 ganjalan pada alur **update klien** yang diperbaiki sebelum rilis:

- **👨‍💻 Programmer:** (1) **Banner [SECURITY] hilang diam-diam** — `testChangelogLabel`/`Test-LintasChangelogLabel` (update-kit.mjs/.ps1) hanya mengenali label tepat setelah penanda heading, sehingga gaya judul `### Diperbaiki [SECURITY]` LOLOS deteksi → peringatan "pasang SEGERA" tak muncul saat update. Detektor diperluas (kenali `[LABEL]` di mana pun dalam baris heading) + heading entri [SECURITY] dirapikan ke `### [SECURITY] ...` (kompatibel dengan detektor v1.57.1 yang men-scan saat klien update) + tes pengunci di kedua sisi (Node + Pester). (2) **Pesan error update jadi membimbing** — saat gagal `ls-remote`/`clone` (repo privat belum diberi akses / Git belum terpasang) kini muncul 3 kemungkinan penyebab + langkah konkret, bukan "masalah jaringan?" yang menyesatkan. (3) Instruksi pasca-update + `UPDATE_KIT_PROMPT_v1.md` tak lagi menyuruh edit field versi `AGENTS.md` yang sudah dihapus (versi dibaca otomatis dari baris atas CHANGELOG) + prasyarat update (Git terpasang + diundang ke repo) ditulis jelas. Gerbang preflight strict hijau (Node 571, Pester 691, 0 GENTING/PENTING/RAPIKAN).
- **🙂 Non-Programmer:** "tombol update" dirapikan: (1) lampu peringatan keamanan yang dulu gagal nyala gara-gara salah tata-letak judul kini menyala benar (🏢 seperti surat recall mobil yang label "URGENT"-nya kembali terbaca); (2) kalau update gagal, pesannya kini menjelaskan "kenapa + apa yang harus dilakukan" (bukan cuma "gagal"); (3) panduan update tak lagi menyuruh isi nomor versi manual yang gampang basi.

### Diperbaiki — `npm create lintasai` gagal memasang dari paket npm (pemasang mewajibkan berkas tes yang dibuang dari tarball)

Uji-nyata dari tarball npm (2026-06-25) menemukan bug **GENTING**: pemasang menolak install/re-install dari paket npm karena memeriksa kelengkapan terhadap daftar yang masih mewajibkan ~37 berkas tes internal (`*.Tests.ps1`) — padahal "ramping tarball" (di rilis ini juga) sengaja membuangnya. Akibatnya `npm create lintasai` GAGAL "Kit tidak lengkap" untuk **SEMUA** client. Lolos gerbang karena gerbang jalan dari repo (yang punya berkas tes), bukan dari tarball.

- **👨‍💻 Programmer:** `setup-pola-b.{mjs,ps1}` kini TIDAK lagi memverifikasi grup `tests` sebagai "wajib ada" (berkas tes = internal dev, tak dikirim ke client; `kit-files.psd1` tetap mendaftarnya untuk integritas dev, dijaga `install-mapping-sync.Tests.ps1`). 2 penjaga anti-regresi: (a) `package-bundle.Tests.ps1` — tiap berkas wajib pemasang (grup non-tests) WAJIB ada di tarball; (b) `npx-init.Tests.ps1` — mock npm kini akurat (buang berkas tes seperti `files[]`) supaya bug "pemasang wajibkan berkas tak-dikirim" tertangkap end-to-end. Diverifikasi end-to-end: re-install v1.57.1→v1.58.0 dari tarball BERHASIL (exit 0), identitas staff (`.staff-profile.md`) + AGENTS.md custom dipertahankan.
- **🙂 Non-Programmer:** dulu pasang/pasang-ulang lewat `npm create lintasai` langsung error "Kit tidak lengkap" — gara-gara kit mencari alat-uji pabrik yang sengaja tidak dikirim ke pelanggan. Sekarang diperbaiki + dipasang 2 alarm otomatis biar tak terulang. 🏢 Seperti toko yang berhenti menolak pembeli cuma karena kardus tak berisi buku servis pabrik — buku itu memang bukan untuk pembeli.

### Ditambah — Doktrin Berjenjang 8 Divisi (§4.17): "8 divisi dipaksa tiap tugas, atau natural?"

Owner bertanya untuk profil tim non-programmer yang membangun website/app bermodal prompt biasa: lebih baik 8 divisi (§4.13) **dipaksa tiap tugas** atau **dibiarkan natural**? Jawaban kit: **berjenjang** — bukan salah satu ekstrem.

- **👨‍💻 Programmer:** blok **§4.17** baru di `CLAUDE_universal_v1.md` (auto-load) menyatukan §1+§4.1+§4.6+§4.13 jadi satu setelan: 8 divisi selalu *dipertimbangkan* (jaring pengaman non-programmer) tapi kedalaman/pelaporan pas-ukuran (§4.1 default 3-5 lensa); 4 lensa **wajib digali dalam** (Keamanan/Integritas-DB/Aksesibilitas-WCAG/Adversarial) karena tak-kasat-mata + tak bisa diaudit staff non-coding; perketat otomatis di pemicu risiko (login/bayar/PII/upload/halaman-publik/skema-DB/rilis); "periksa penuh" di gerbang pra-rilis §4.6, bukan tiap edit; anti-teater (§8.2 Aturan 3b "nol temuan itu sah"). Penegakan = kepatuhan-AI (bukan rem-mesin) → ditaruh di file auto-load. Tanggal header file-universal + KEUNGGULAN diselaraskan ke 2026-06-25 (§7.8). Nomor §4.17 dipilih karena §4.16 sudah dipakai (Urutan Bangun-Fitur).
- **🙂 Non-Programmer:** kit sekarang punya aturan tegas "kapan 8 ahli kerja keras, kapan santai" — biar hasil tetap profesional tanpa lambat/melelahkan. Yang selalu digali serius = 4 hal yang kamu tak bisa cek sendiri (keamanan, kerapian data, ramah-disabilitas, kejujuran-bukti); dikencangkan otomatis saat menyentuh hal berisiko (login/bayar/data pribadi/mau online). 🏢 Seperti standar keselamatan pabrik: helm selalu dipakai, inspeksi penuh sebelum mesin produksi nyala — bukan tiap geser kursi.

### Diperbaiki — Janji "starter" yang link-nya mati + ramping paket npm (audit kejujuran)

Audit kesiapan (2026-06-24) menemukan 2 hal yang merugikan klien: (1) `templates/PROJECT_STARTER_TEMPLATES.md` menyuruh `git clone` 4 repo starter yang **belum diterbitkan** (semua balik `repository not found`) — staff yang ikut dokumen langsung kena error tak-terdiagnosis; (2) paket npm mengirim **77 berkas tes internal kit** (~640KB) yang tak berguna bagi klien.

- **👨‍💻 Programmer:** (a) Dokumen starter ditandai status jujur ("🚧 Rencana, repo belum tersedia") + perintah `git clone <404>` diganti jalur yang pasti jalan hari ini (`npx create-next-app` / `create-turbo` → `npm create lintasai`). Banner peringatan di atas daftar template. (b) `package.json` files[] kini mengecualikan `!tests/*.test.mjs` + `!tests/*.Tests.ps1` (264 → 187 berkas tarball); **infra preflight tetap ikut** (`tests/preflight.mjs` + runner + smoke) supaya `npx lintasai preflight` di project klien tetap jalan. Penjaga `tests/package-bundle.Tests.ps1` diperkuat: kunci `preflight.mjs` WAJIB ikut + tes internal WAJIB tidak ikut. Gerbang preflight penuh hijau (Node 558, Pester 689, 0 GENTING/PENTING/RAPIKAN).
- **🙂 Non-Programmer:** dulu brosur kit menyuruh "ambil paket contoh dari sini" padahal tokonya belum buka — yang ikut langsung kena jalan buntu. Sekarang ditulis jujur "paket contoh belum ada, ini cara bikin sendiri yang pasti jalan". Plus, paket pemasangan dirampingkan: berhenti mengirim 77 berkas alat-uji internal yang cuma berguna buat kami, bukan buat kamu — seperti **beli HP tapi tak perlu dikirimi alat servis pabriknya**. Fitur cek-kesehatan project (preflight) tetap utuh.

### Ditambah — Mode microservice (varian shared-database) jadi warga kelas satu

Owner ingin membangun project website/app dengan pola microservice sesuai profil tim (banyak engine rahasia -> 1 backend penggabung -> 1 dashboard, berbagi 1 database multi-schema). Kit kini mengenali + mendukung pola ini.

- **👨‍💻 Programmer:** (a) `lib/project-detect.{mjs,ps1}` mengenali repo microservice (engine/dashboard/core) lewat penanda -> tak salah menawarkan pecah-ulang (paritas PS<->Node, 45 tes). (b) Template aturan per-repo baru `templates/split-agents/ENGINE.md` + `DASHBOARD.md` (Mode 2); `BACKEND.md` diberi catatan peran AGGREGATOR/Backend-for-Frontend + disclaimer "angka staff = contoh". (c) `SPLIT_REPO_PREPROVISION_v1.md` + `docs/plans/POLA_REPO_AMAN.md` jadi sumber-kebenaran ke klien; `POLA_REPO_AMAN.md` ikut terbit ke paket. (d) Larangan frontend colok Supabase langsung dari browser (cegah tembus RLS). Label jalur "project kosong -> 6-10 repo" tetap jujur **BETA**; jalur "monorepo -> 3-split" = matang.
- **🙂 Non-Programmer:** sekarang kit paham cara membangun aplikasi pakai pola "banyak kotak kecil yang kerja bareng" (microservice) — tiap algoritma rahasia di gudang (repo) sendiri, satu backend penggabung, satu tampilan. 🏢 Seperti dapur restoran: tiap koki spesialis punya meja sendiri (resepnya aman), pelayan (backend) menggabung jadi 1 piring untuk tamu (dashboard). Jalur dari project KOSONG masih ditandai **BETA** (uji dulu); jalur dari project yang SUDAH JADI sudah matang.

### Diperbaiki — SSOT topologi repo: angka "berapa repo" diluruskan + dijadikan 1 sumber

Scan owner (2026-06-24, lewat "lintasAI skill") menemukan drift: `docs/plans/POLA_REPO_AMAN.md` (paling matang) bilang **2 repo cukup, `shared` opsional** + "jumlah repo ikut wilayah rahasia + tim, bukan angka target", TAPI `SPLIT_REPO`/`JALANKAN_KIT`/`KEUNGGULAN`/`README` masih pakai angka kaku "3 repo" + "6-10" (bahkan "5/6/7"). Pola "satu berkas diubah, yang lain lupa ikut".

- **👨‍💻 Programmer:** `POLA_REPO_AMAN.md` ditetapkan **SUMBER TUNGGAL (SSOT) topologi** + aturan emas jumlah repo; angka kaku di SPLIT_REPO (Mode Selector) / JALANKAN_KIT (peta-langkah + Popup #3 + tabel + Bagian 5c) / KEUNGGULAN / README diganti prinsip "2-3 / ikut wilayah rahasia" + rujuk SSOT. Penjaga anti-drift: baris topologi di `docs/PETA_SUMBER_KEBENARAN.md` (Tabel C) + Resep 7 di `docs/RESEP_PERUBAHAN.md`. Jenis SSOT = "hapus salinan angka → rujuk prinsip" (BUKAN robot — angka topologi tak punya 1-sumber bisa-dihitung + pola "3 repo" ambigu → robot = alarm palsu). + glossary `branch-by-abstraction` & `parallel-change` (`LINTASAI_WORKFLOWS_v1.md` §13 + sinkron `CLAUDE_universal_v1.md` §13) + tautan resep aman di blok refactor 🔴. Gerbang preflight hijau (Node 570, Pester 689, 0 GENTING/PENTING/RAPIKAN). Hanya dokumen, tak ada perubahan kode.
- **🙂 Non-Programmer:** dulu aturan "berapa repo" ditulis beda-beda di banyak berkas (satu bilang 2, lain 3, lain 6-10) → bikin bingung + saling bertentangan. Sekarang ditulis di **1 tempat** (`POLA_REPO_AMAN.md`; yang lain menunjuk ke sana) + diluruskan: jumlah repo = sesuai kebutuhan nyata (berapa "wilayah rahasia" + berapa kelompok staff), BUKAN angka paku-mati. 🏢 Seperti 1 nomor HP disimpan sekali di kontak, bukan diketik ulang di banyak catatan yang gampang salah.

### [SECURITY] Diperbaiki — Robot anti-bocor `.env` tak lagi lolos kredensial asli ber-host "example"

Robot penjaga `lib/split-guard.mjs` (anti-bocor rahasia saat pecah-repo) punya celah: kata petunjuk "ini cuma contoh" (mis. "example") dicocokkan sebagai potongan di SELURUH nilai -> URL database berisi kredensial ASLI ikut di-suppress kalau host-nya kebetulan mengandung "example".

- **👨‍💻 Programmer:** penanda-placeholder kini dicek pada **PASSWORD** URL DB saja (+ host lokal), bukan seluruh nilai (`scanEnvLines` + helper `passwordLooksLikePlaceholder`). `db.example.com` dengan password acak asli kini KETAHUAN (GENTING); contoh dokumen sah (`user:pass@your-db.example.com`) tetap lolos; vendor key (AWS `AKIAIOSFODNN7EXAMPLE`) sengaja TIDAK lewat jalur ini (tetap di-suppress). +6 skenario tes pengunci (43 tes split-guard).
- **🙂 Non-Programmer:** satpam kunci rahasia tadinya punya titik buta — kalau alamat database mengandung kata "example", ia mengira itu cuma contoh lalu membiarkannya lewat, padahal isinya kunci asli. 🏢 Seperti satpam yang tak memeriksa siapa pun yang bilang "ini cuma contoh". Sudah ditambal + dikunci tes. (Untuk model tim ini risikonya kecil karena frontend nol-akses-DB; tetap diperbaiki demi klien lain.)

### Ditambah — Penegak Bahasa Indonesia kini OTOMATIS sampai ke project klien

Hook pengingat "jawab Bahasa Indonesia + gaya non-programmer" (`lib/lang-reminder.mjs`) sebelumnya nyala di repo kit saja; berkasnya sampai ke klien tapi tak terpasang sebagai hook -> tak terpanggil.

- **👨‍💻 Programmer:** `lib/lang-hook-wiring.mjs` (baru) memasang hook `UserPromptSubmit` ke `.claude/settings.json` klien saat init/update (`setup-pola-b.mjs`; update menjalankan ulang setup -> cakupan install + update lewat 1 titik wiring). Idempoten + fail-safe (JSON klien rusak -> tak ditulis, pertahankan kunci kustom) + tulis-atomik + non-blokir (selalu exit 0). `templates/settings.json.template` baru (referensi). 9 tes pengunci. Komentar `lang-reminder.mjs` yang merujuk berkas-hantu dibetulkan.
- **🙂 Non-Programmer:** sekarang setiap staff yang pasang/update lintasAI otomatis dapat "pengingat" yang membuat AI selalu menjawab Bahasa Indonesia gaya mudah-paham — bukan cuma di kit kita. 🏢 Seperti papan pengingat yang otomatis terpasang di tiap cabang toko, bukan cuma di kantor pusat. Pemasangannya hati-hati: tak menimpa pengaturan yang sudah ada, dan kalau pengaturanmu rusak ia memilih tidak menyentuh (aman).

### Ditambah — Robot anti-bocor `.env` saat pecah-repo (`lib/split-guard.mjs`)

- **👨‍💻 Programmer:** robot deterministik cuma-baca + fail-closed memeriksa tiap folder hasil-pecah: `.env` asli nyelip, `.gitignore` tak menutup `.env`, `.env.example` memuat kunci/nilai rahasia (termasuk REDIS/MONGO + `.env.example` realFile), repo tampilan punya struktur DB. Mengubah "andalkan AI ingat" -> mesin. Pendamping `docs/split-guard.md`.
- **🙂 Non-Programmer:** robot yang otomatis mengecek "jangan sampai kunci rahasia ikut ke gudang yang dilihat banyak orang" saat memecah project jadi banyak repo. 🏢 Seperti detektor logam di pintu gudang.

### Ditambah — Gerbang Pra-Rilis 1-perintah (`npm run preflight`) + gerbang CI otomatis

Selama ini pemeriksa mutu (tes Node, ESLint, Pester, smoke, robot kecocokan, pemindai Unicode) dijalankan **manual satu-satu** → gampang "lupa cek sesuatu", dan tak ada cek **kelengkapan rilis** (mis. versi naik tapi CHANGELOG belum punya entrinya). Sekarang ada satu perintah + gerbang otomatis di CI.

- **👨‍💻 Programmer:** `tests/preflight.mjs` (orkestrator Node) menggabung semua pemeriksa + menambah cek kelengkapan rilis (entri CHANGELOG utk versi `package.json`, placeholder kerangka belum diisi, versi-vs-tag, breaking-tanpa-naik-BESAR, kode-vs-tes), memilah ke **GENTING / PENTING / RAPIKAN** dengan satu exit-code. Skrip `npm run preflight` (harian: hanya GENTING memblokir) + `npm run preflight:strict` (rilis: PENTING ikut memblokir); bendera `--skip-ps`/`--node-only`. Reuse robot yang sudah ada (`consistency-check`, `unicode-safety-check`, parser CHANGELOG `version-detect`) — bukan tulis ulang. **CI:** job `preflight` di `validate.yml` (tiap PR/push ke `main`, `--skip-ps` → tak menjalankan tes PowerShell 2x) + langkah `preflight:strict` di `publish-npm.yml` (gerbang sebelum terbit ke npm) → 3 pemeriksa yang dulu blind-spot di CI (robot kecocokan, huruf-tipuan Unicode, kelengkapan rilis) kini dijaga otomatis. Dikunci tes anti-rot (`tests/preflight.test.mjs` + `tests/ci-preflight-wiring.test.mjs`). Pendamping `docs/preflight.md`.
- **🙂 Non-Programmer:** satu tombol **"Cek Kesehatan"** sebelum bilang "selesai/rilis" — kayak tombol cek kesehatan akun di BCA mobile: sekali tekan, semua diperiksa (tes + kecocokan versi + kelengkapan catatan rilis) lalu kasih lampu **merah/kuning/hijau**, bukan kamu cek satu-satu. Sekarang pemeriksaan ini juga **jalan otomatis di server** tiap ada perubahan + tepat sebelum versi baru diterbitkan — jadi "lupa ganti salah satu berkas" atau "catatan rilis belum lengkap" ketahuan lebih awal, bukan saat sudah terbit. 🏢 Seperti pabrik yang menyalakan-uji mesin + cek kelengkapan sebelum produk dikirim.

### Ditambah — LAPIS 1 (SSOT/anti-drift): rapikan angka rapuh + tes paritas robot PowerShell↔Node

Lanjutan cetak-biru anti-bug-berulang (`docs/plans/BUKU_PELAJARAN_DAN_PREFLIGHT.md`) — Tahap B. Menutup pola "ubah A, lupa B": angka turunan-kode yang ditulis tangan (pasti basi) dihapus → rujuk sumbernya, + daftar fakta yang dijaga robot kini dikunci paritasnya antar-bahasa.

- **👨‍💻 Programmer:** (a) De-fragilize: hapus "(43 tes)" dari `docs/split-guard.md` + "36 file" (2 titik) di `LINTASAI_WORKFLOWS_v1.md` → rujuk sumber (`tests/`, `lib/kit-files.psd1`). (b) `docs/RESEP_PERUBAHAN.md` v2: utamakan gerbang `npm run preflight`, cakup kode Node (`.mjs`), checklist "WAJIB ikut" untuk fitur, catatan paritas robot. (c) Tes paritas baru `tests/consistency-parity.Tests.ps1` + helper `tests/dump-kit-consistency.mjs`: membandingkan NILAI-JADI daftar yang dijaga (`KIT_VERSION_CHECKS`/`KIT_FACTS`/`KIT_SOURCE`/`KIT_TEAM_FILES_SOURCE`) PowerShell vs Node → "tambah/ubah fakta di satu sisi, lupa sisi lain" kini langsung MERAH (sebelumnya drift senyap). `KIT_TEAM_FILES_SOURCE` di `consistency-check.mjs` di-export demi paritas; tes skip jujur kalau `node` absen. Terbukti menangkap (uji drift sengaja → merah).
- **🙂 Non-Programmer:** angka yang dulu ditulis tangan di catatan (gampang basi saat jumlahnya berubah) diganti rujukan ke sumber aslinya — biar tak pernah bohong lagi. Plus, "satpam angka" punya 2 kembar (versi PowerShell + versi Node); kini ada pemeriksa yang memastikan keduanya selalu menjaga daftar yang SAMA — kalau beda langsung ketahuan. 🏢 Seperti 2 satpam shift pagi & malam yang wajib pakai daftar tamu sama persis; kalau salah satu pakai daftar beda, alarm bunyi.

### Ditambah — LAPIS 3 (Buku Pelajaran / Lesson Ledger): tiap bug yang lolos jadi penjaga permanen

Lanjutan cetak-biru anti-bug-berulang (`docs/plans/BUKU_PELAJARAN_DAN_PREFLIGHT.md`) — Tahap C. Bentuk **AMAN** dari "AI belajar dari kesalahan": tiap kebobolan dicatat lalu diubah jadi penjaga otomatis, dengan **OWNER yang menyetujui**. Yang mengingat = mesin, bukan "naluri" AI.

- **👨‍💻 Programmer:** `docs/BUKU_PELAJARAN.md` (ledger, format entri mesin-baca, **internal kit** — dikecualikan dari paket via `files[]` `!docs/BUKU_PELAJARAN.md`) + aturan alur human-in-the-loop di `CLAUDE_universal_v1.md` §6.4 (AI USULKAN → owner SETUJUI → AI PASANG; DILARANG auto-evolve / skor-keyakinan / naluri) + pointer balik dari §4.6. Dikunci `tests/buku-pelajaran.test.mjs` (6 tes): **INTEGRITAS** — tiap entri TERPASANG WAJIB menunjuk berkas penjaga yang NYATA ADA (ledger tak bisa "ngaku-ngaku") + gema aturan §6.4 + cek exclude bundle (pelengkap bukti `npm pack` di `tests/package-bundle.Tests.ps1`). Seed 2 entri nyata: drift fakta → robot kecocokan (Lapis 1); blind-spot "selalu hijau" → preflight (Lapis 2). `RESEP_PERUBAHAN.md` Resep 6 baru.
- **🙂 Non-Programmer:** "buku catatan pelajaran" — tiap bug yang pernah lolos dicatat lalu diubah jadi pengaman otomatis yang **tak akan lupa**, dan KAMU yang menyetujui dulu sebelum dipasang. 🏢 Seperti buku catatan insiden maskapai: tiap kejadian jadi butir checklist permanen untuk semua penerbangan — itu sebabnya makin aman. Penting: AI **DILARANG** "belajar + ubah aturannya sendiri diam-diam"; semua pelajaran terlihat sebagai catatan biasa yang kamu setujui.

### Ditambah — Pertahanan 3-lapis kini OTOMATIS sampai ke project klien (Tahap E)

Lanjutan cetak-biru anti-bug-berulang (`docs/plans/BUKU_PELAJARAN_DAN_PREFLIGHT.md`) — Tahap E (penutup). Sebelumnya gerbang preflight + pencegah-drift + Buku Pelajaran hidup di repo kit saja; kini ikut terpasang + jalan di tiap project yang memasang lintasAI.

- **👨‍💻 Programmer:** (a) `npx lintasai preflight` (+ `--strict`) — perintah baru di dispatcher (`bin/lintasai.js` `COMMANDS_NODE` + `shouldPassProjectRoot` menyuntik `--project-root` project klien). (b) `tests/preflight.mjs` kini sadar **"mode project"** (`package.json` `name` ≠ `lintasai`): menjalankan `npm test` MILIK KLIEN (kontrak universal jest/vitest/mocha/node:test, andalkan exit-code) bukan berkas tes kit; ketiadaan CHANGELOG/versi = INFO, peta-konsistensi/eslint/tes belum ada = RAPIKAN (saran lembut) — bukan GENTING palsu yang dulu menampilkan stack-trace mentah di project klien. Drift entri CHANGELOG di klien = PENTING (tetap memblokir saat `--strict`). `main()` menerima `--repo-root`/`--project-root` (alias). (c) Pemasang (`setup-pola-b.mjs` + `.ps1`, paritas) menyalin `templates/consistency-map.example.jsonc` (format yang DIBACA gerbang Node — sebelumnya cuma `.psd1`) + `templates/BUKU_PELAJARAN.example.md` (contoh ledger Lapis 3) ke `docs/` klien; terdaftar `lib/kit-files.psd1`. Ledger KIT (`docs/BUKU_PELAJARAN.md`) tetap dikecualikan dari paket; klien dapat CONTOH-nya. Dikunci tes anti-rot (`tests/dispatcher-init-routing.test.mjs` routing+suntik `Mode: project`; `tests/preflight.test.mjs` cabang mode-project; `tests/setup-pola-b-write.test.mjs` bukti deploy ke klien). Jumlah file tim 31→33 (+2 contoh), docs 23→25.
- **🙂 Non-Programmer:** 3 pengaman yang dulu cuma melindungi "kantor pusat" (repo kit) sekarang otomatis terpasang di tiap project staff: (1) tombol **"Cek Kesehatan" sebelum bilang selesai** (`npx lintasai preflight`) yang kini paham project-mu sendiri — tak lagi menampilkan "lampu merah" palsu menakutkan untuk hal yang memang belum ada; (2) **pencegah "ubah A lupa B"** (contoh peta-konsistensi siap diisi); (3) **buku catatan pelajaran** (contoh siap diisi tiap ada bug). 🏢 Seperti memasang alat keselamatan yang sama (alarm asap, APAR, buku checklist) di tiap cabang toko, bukan cuma di kantor pusat. AI di sesi staff juga otomatis memakai gerbang ini tiap ada perubahan.

### Diubah/Dirapikan — perapian sisi Node + pengaman + dokumen

- **👨‍💻 Programmer:** ESLint untuk sisi Node + gerbang CI `node-lint`; robot Node pakai `process.exitCode` (anti output-kepotong); jalan-cadangan PowerShell saat Node gagal; pembuang-BOM disatukan (`lib/fs-text.mjs`); pengunci bentuk manifest Node+PS. +2 tes pengaman tarball (kunci absen berkas rahasia/lokal: `.env`/`.manifest-secret`/`*.local.md`/lockfile/`eslint.config.mjs`; + `docs/plans/` hanya POLA_REPO_AMAN). Polish: header SPLIT_REPO sync v1.58.0 (angka jumlah tes di `docs/split-guard.md` kemudian di-de-fragilize → lihat LAPIS 1 SSOT di atas).
- **🙂 Non-Programmer:** rapi-rapi mesin di balik layar supaya lebih andal + pengaman tambahan supaya berkas rahasia tak sengaja ikut saat menerbitkan paket. Tak ada yang perlu kamu lakukan.

## [1.57.1] - 2026-06-20

### Diperbaiki [SECURITY] — Wiring contoh Palang Rem SALAH FORMAT (palang gagal-diam) + tes pengunci wiring

Ditemukan oleh scan kesiapan-rilis (17 pemeriksa READ-ONLY, dicek-silang skeptis 4 arah) SEBELUM rilis ke staff. **1 penghalang rilis GENTING**: contoh wiring `templates/hooks/risk-gate.settings.example.json` memakai `"command":"node"` + `"args":[...]` — tapi kontrak hook Claude Code **TIDAK punya** field `args` (itu format MCP server). Akibatnya `args` DIABAIKAN diam-diam → cuma `node` jalan → node baca JSON tool-call sebagai skrip → SyntaxError exit 1 → palang rem **GAGAL DIAM-DIAM** (aksi berisiko lanjut TANPA dialog). Staff non-programmer yang menyalin contoh persis sesuai docs akan **mengira terlindungi padahal tidak** = rasa-aman-palsu untuk fitur KEAMANAN. Bug ini lolos 23 tes hijau karena tes hanya menguji LOGIKA (`node <path>`), bukan WIRING.

- **👨‍💻 Programmer:** wiring diubah ke kontrak Claude Code yang benar: `{ "type":"command", "command":"node .claude-kit/lib/risk-gate.js" }` (SATU string `command`, buang `args`). Diverifikasi 4 arah: schema `commandHookItem` (oneOf string|array, tanpa `args`), 28 hook resmi ECC SEMUA pakai `command` string-penuh (nol `args`), uji empiris (`node` tanpa path → SyntaxError exit 1 vs `node <path>` → ask exit 0), + skema MCP yang memang pakai `args`. **+4 tes pengunci wiring** (`tests/risk-gate.Tests.ps1`): assert `command` memuat `risk-gate.js` + binary `node` + TIDAK ada properti `args` — supaya format salah ini tak bisa kembali diam-diam. Koreksi juga contoh historis `docs/plans/palang-rem-otomatis.md:39`. Robot decide() + 19 robot lib/*.ps1 + 103 tes lain terbukti SEHAT (nol crash). Header `CLAUDE_universal_v1.md` tanggal 06-18→06-20. 27 tes risk-gate lulus. (Catatan label [SECURITY]: ini pra-rilis—belum ada user terdampak; ditandai karena menyangkut fitur keamanan + wajib sebelum staff menyalakan.)
- **🙂 Non-Programmer:** scan kesiapan-rilis menangkap **1 masalah penting sebelum sampai ke staff**: contoh cara-menyalakan Palang Rem **salah tulis**, sehingga kalau staff mengikutinya persis, palang **diam-diam tidak menyala** — staff kira aman padahal tidak. 🏢 Seperti memasang alarm rumah yang ternyata kabelnya salah colok: lampunya nyala tapi tak benar-benar mendeteksi maling. Sudah **diperbaiki** + dikasih "pengunci" (tes) supaya kesalahan ini tak bisa terulang. Ini justru bukti gerbang QA bekerja: ketahuan saat diuji, bukan pas dipakai. Sisa kit terbukti sehat.

## [1.45.0] - 2026-06-19

### Ditambah — pola "satu sumber kebenaran" (kartu identitas project) + jaminan tawaran refactor di Fase B

Menjawab kebutuhan owner: kelola project dari **1 sumber konkret** (seperti `$variable` di PHP / `const` di React) supaya AI cepat memahami + hemat token + minim bug — **dan** memastikan tawaran rapikan-kode selalu muncul saat install pertama ke project setengah-jadi (mayoritas kasus nyata).

- **Kartu identitas project (`project.lintas.psd1`)** — berkas mesin-baca yang dideklarasikan SEKALI (tujuan/domain, peta modul→lokasi, stack, konvensi) di akar project. Lahir otomatis saat pasang (kolom stack di-derive dari `package.json`), dijaga robot anti-basi (`lib/project-manifest.ps1`: cek path modul ada + stack masih cocok + berkas valid). Format `.psd1` (dibaca PowerShell native, bisa komentar `#`). 👨‍💻 Single source of truth machine-readable; AI baca 1 tempat alih-alih meraba struktur tiap sesi. 🙂 Awam: kayak "kartu identitas" project yang AI lihat dulu sebelum kerja — lebih cepat + lebih murah token. Detail: `docs/project-manifest.md`.
- **Peta Sumber Kebenaran (`docs/PETA_SUMBER_KEBENARAN.md`)** + robot penjaga umum daftar-file-tim (`$teamFiles` ↔ `kit-files.psd1`) + **pembaca portfolio multi-repo** (Buku Induk yang dulu tak pernah dibaca skrip, kini punya konsumen mesin nyata) + robot anti-basi registry docs (`architecture_auto.md`). 🙂 Awam: peta yang menunjukkan tiap data project tinggal di mana, biar tak ada yang lupa diganti.
- **Label "SATU SUMBER KEBENARAN" yang menyesatkan dijujurkan** (`lintasai-portfolio.example.yml`, `STACK_VERSIONS.md`, `glossary.md`, `_PATTERNS.md`) — yang mengaku sumber-tunggal padahal cuma catatan/konvensi, kini diberi keterangan jujur.
- **JAMINAN tawaran Refactor Bertingkat di Fase B** (`JALANKAN_KIT.md` langkah **14d** + `CLAUDE_universal_v1.md` §4.11) — dulu tawaran "rapikan kode bertingkat" hanya muncul untuk project monorepo-berkode; project **setengah-jadi yang salah-terdeteksi kosong / non-monorepo / sudah-terpecah** kehilangan tawarannya. Sekarang tawaran refactor **WAJIB muncul sebagai popup untuk SEMUA project ber-kode**, apa pun bentuk repo-nya; deteksi ragu → **default tawarkan** (jangan lewati diam-diam). Dikunci tes anti-rot. 🙂 Awam: tawaran bersih-bersih kode sekarang muncul untuk semua project yang ada isinya — tidak lagi tergantung tebakan bentuk repo yang bisa meleset.

### [SECURITY] Diperbaiki — peringatan keamanan tak lagi terlewat saat update lompat versi

Menutup 2 temuan GENTING dari audit mekanisme update:

- **Label `[SECURITY]` dulu HILANG diam-diam** saat user melewati versi yang memuatnya (gaya judul `### [SECURITY]` tak dikenali parser banner update) — pernah terjadi nyata di v1.35.0. Deteksi label kini dipusatkan ke satu fungsi `Test-LintasChangelogLabel` (kenal gaya heading `#..######` + list/bold), dipakai bersama oleh classifier tier + banner update supaya dua aturan deteksi tak bisa berbeda lagi. 🙂 Awam: peringatan "pasang SEGERA" tak lagi bisa lolos tanpa ketahuan saat lompat beberapa versi.
- **Tes PERILAKU jalur-gagal** ditambah: unduhan (clone) gagal → kit lama dikembalikan otomatis; verifikasi tanda-tangan tag gagal → update dibatalkan (fail-closed). Dulu hanya dicek-tulisan; sekarang dicek-perilaku.

Terverifikasi: seluruh tes hijau + robot konsistensi bersih + PSScriptAnalyzer 0 temuan + **uji-lapangan di sesi nyata LULUS** (install pertama lanjut ke Fase B + project setengah-jadi terdeteksi benar + popup refactor muncul).

## [1.40.0] - 2026-06-17

### [SECURITY] Ditambah — hardening rantai-pasok + penjaga rahasia (dari audit menyeluruh)

Hasil audit menyeluruh kit (READ-ONLY, 15 pemeriksa, tiap temuan dicek-silang skeptis). Fokus: lebih aman + lebih tahan-bug + dokumen tak gampang basi. **Tidak ada perubahan breaking.**

- **[SECURITY] Kunci GitHub Actions ke commit SHA** — 27 pemakaian Action di 11 berkas (workflow kit + template staf) dikunci dari label bergerak (`@v4`/`@v6`/`@v7`) ke commit SHA penuh; cegah "label dibajak" kalau akun Action diretas (pernah terjadi nyata, mis. tj-actions). Tiap SHA diverifikasi dari GitHub resmi. + `.github/dependabot.yml` jaga pin tetap segar (staff dijaga Renovate `config:recommended`). Selaras OpenSSF Scorecard.
- **[SECURITY] Penjaga rahasia pre-commit (opt-in)** — `templates/hooks/pre-commit-secret-scan.sh` + `install-secret-hook.ps1`: tolak commit file `.env` asli / isi mirip kunci API DI LAPTOP sebelum terkirim (shift-left); cuma cetak NAMA berkas, tak pernah nilainya. Pelengkap lokal `secret-guard.yml`. Pasang: minta AI "pasang penjaga rahasia pre-commit". Bagian "Pencegahan" ditambah ke `SECURITY_INCIDENT_PLAYBOOK.md`.

### Diperbaiki

- **Crash `kit diff`** saat manifest punya entry `sha256` null (file hilang saat manifest dibuat / manifest di-tamper) — beri penjaga null sebelum `.ToLower()` (tiru `Invoke-Doctor`). + tes regresi `tests/kit-diff.Tests.ps1` (jalan via `powershell.exe`).
- **Celah tes**: `Publish-AgentsMd` (penulis `AGENTS.md`) sebelumnya tanpa tes end-to-end — tambah `tests/agents-md.Tests.ps1` (CREATE/PRESERVE/BACKUP + nilai literal `$0`/`$` + UTF-8 tanpa BOM).
- **Angka basi di dokumen** (jumlah tes "319", "18 suite", `README` "v1.37.0") diganti rujukan dinamis ("jalankan `tests/Run-Tests.ps1`" / "lihat `CHANGELOG`") supaya kelas-bug "angka lupa diganti" tak terulang.

### Catatan

- `.gitattributes` baru: `*.sh` = LF (CRLF merusak shebang hook bash).
- QA+QC: seluruh tes hijau, robot konsistensi bersih, PSScriptAnalyzer bersih (cara CI seluruh repo).
- **Belum dikerjakan (butuh keputusan owner)**: aktifkan provenance npm (repo sudah publik) + GPG verify-jika-bisa.

## [1.35.0] - 2026-06-17

### Ditambah — 8 Skill Divisi WAJIB di tiap project (otomatis, tak boleh dihapus, boleh ditambah)

Lahir dari owner: tiap install lintasAI WAJIB otomatis punya **8 skill divisi profesional** sebagai standar minimum di tiap project — staff non-programmer otomatis "didampingi 8 ahli" tanpa harus tahu cara menyetelnya.

- **Bagian baru §4.13** di `CLAUDE_universal_v1.md` (aturan ringkas selalu-baca) + checklist detail per-divisi di `LINTASAI_WORKFLOWS_v1.md` §4.13 (dibaca saat dipanggil — hemat token). 8 divisi: **Backend, Frontend, Database, Webdesign, UI/UX, DevOps, Cyber Security/Anti-Hacker, SEO**.
- **Baseline = lantai (floor):** selalu aktif (AI sudah menjalankannya via §1 peran lintas-divisi + §4.1 Tinjauan Multi-Divisi; §4.13 menamai + mengunci jadi WAJIB). Hidup DI DALAM `.claude-kit/` yang ditimpa segar tiap update → **tak bisa dihapus permanen**. AI DILARANG menonaktifkan/membuang salah satu lensa walau diminta.
- **Otomatis untuk staff non-programmer (tanpa ketik "skill"):** staff cukup ngeprompt biasa ("tolong tambah halaman X") — AI otomatis menerapkan checklist 8 divisi yang relevan ke tiap berkas yang dibuat/diubah. File hasil tetap ikut standar profesional walau staff tak tahu istilah divisinya. Mengetik **"skill <divisi>"** hanya untuk MEMFOKUSKAN 1 divisi.
- **Cocok di SEMUA topologi:** 1 repo (monorepo) / 3-split (`-frontend`/`-backend`/`-shared`) / multi-repo 6-10 layanan (landing-page/dashboard/data-domain/seoanalysis/pbn/redirect/dll). 8 divisi = standar minimum SAMA di mana pun; **penekanan** menyesuaikan peran repo (auto-deteksi dari nama/peta), 🔒 Cyber Security selalu primer, baseline (lantai) tak pernah turun. Tabel pemetaan per topologi di `LINTASAI_WORKFLOWS_v1.md` §4.13.
- **Boleh ditambah:** client tambah divisi baru ATAU perluas salah satu dari 8 lewat skill kustom §4.9 (`docs/SKILLS_LOCAL.md`). **Anti-bentrok** dengan aturan lama "lokal menang": skill lokal boleh **memperluas** di atas baseline, TAPI TIDAK boleh **menonaktifkan/menggantikan** lensa dasar.
- Tes pengunci `tests/skills-divisi.Tests.ps1` (anti-drift: 8 divisi WAJIB tetap utuh di kedua berkas, + penegasan otomatis & topologi).

### Diperbaiki — Pindai lebih cepat + hemat token (tanpa menurunkan kualitas)

Lahir dari owner: "kalau memeriksa sesuatu selalu lama". Gerbang QA+QC §4.6 dapat **prinsip ke-7**: **default = Pindai Cepat** (robot deterministik + lewatan terfokus di area terdampak); fan-out banyak-agen (10+) DIPESAN hanya untuk audit eksplisit / rilis besar / permintaan "menyeluruh" — bukan untuk cek rutin. Sumber utama "scan lama" = fan-out berlebihan untuk hal kecil. Cakupan tetap penuh; yang dipangkas cuma cara kerjanya.

### [SECURITY] Diperbaiki — 3 celah keamanan dari audit 8-divisi (pindai menyeluruh, mode aman cuma-baca)

- **Janji pengaman "hantu" di template backend.** `templates/split-agents/BACKEND.md` dulu menyebut skrip `prisma-guard.mjs` seolah **sudah ada** (padahal tidak ada di kit) + menganjurkan `PRISMA_GUARD_BYPASS=1` untuk menerobos. Memberi rasa-aman palsu (mirip pelajaran "tier-guard hantu"). Diubah jadi jujur: pengaman migrasi-prod **harus dibuat dulu** oleh owner sebelum diandalkan, + larang "mode paksa" menerobos pengaman (selaras §8.1 #10).
- **Penjaga rahasia gratis (`secret-guard.yml`) kini menangkap kunci "gudang emas":** token JWT (`eyJ...`) + alamat database ber-password (`postgres/mysql/mongodb://user:pass@`) — disamakan dengan lapis AI (`ai-review.js`). Sebelumnya hanya kunci Anthropic/AWS/GitHub/Slack/GitLab, sehingga alamat database (paling berharga) bisa lolos.
- **Panduan darurat keamanan tersambung ke aturan auto-load.** §8 kini punya pemicu: saat ada sinyal kebocoran rahasia/akses tak sah (mis. staf chat "kayaknya aku ke-commit `.env`") → AI WAJIB buka `docs/SECURITY_INCIDENT_PLAYBOOK.md` + pandu langkah demi langkah; JANGAN ganti-kunci/force-push sendiri.

## [1.30.1] - 2026-06-16

### Diperbaiki
- **[SECURITY] Tutup celah script-injection di template robot "terima update backend"** (`templates/github/RECEIVE_BACKEND_UPDATE.yml`). Nilai `client_payload.*` (dikendalikan pengirim sinyal `repository_dispatch`) sebelumnya ditempel **LANGSUNG ke perintah shell `run:`** (baris 34/51/118) di workflow ber-izin `contents:write` + `pull-requests:write` → pengirim jahat bisa menjalankan perintah arbitrer di server runner + menyalahgunakan kunci GitHub. Diperbaiki dengan mengalirkan nilai lewat variabel-perantara (`env:`) lalu dipakai sebagai `"$VERSION"`/`$IS_BREAKING` (data, bukan kode) — pola aman yang kit sudah pakai di `AUTO_MERGE_SHARED_WORKFLOW.yml`. **Pasang SEGERA** kalau project staf sudah memakai template antar-repo ini. Ditemukan via audit menyeluruh internal (8 dimensi pemeriksa + cek-silang skeptis). Sisa `client_payload` di blok `with:` (isi PR/commit/branch) = konten tampilan yang di-review manusia (bukan eksekusi-perintah) — sengaja dibiarkan.

## [1.26.0] - 2026-06-15

### Keamanan
- **[SECURITY] §8.1 #10 BARU — DILARANG MUTLAK menerobos / mematikan / "mode paksa" melewati pagar keamanan atau portal izin, APA PUN alasannya.** Saat pengaman menghalangi (palang persetujuan, prompt izin Claude Code, hook / `tier-guard` project, verifikasi tanda-tangan, sandbox, 2FA/OTP), AI DILARANG mencari jalan memutar / mematikannya / menjalankan opsi "dangerous/force/bypass". **Tidak ada rasionalisasi yang membenarkan** — termasuk "sudah kuverifikasi sendiri aman" / "diminta berkali-kali" / "ini project-mu sendiri" / "portalnya lagi error" / "cuma sekali ini". Yang benar: **STOP → lapor jujur → user selesaikan via jalur resmi**. Pengecualian satu-satunya: user sendiri yang sadar mematikan pengaman, BUKAN AI. **Lahir dari insiden nyata (2026-06-15):** AI di sesi staf merasionalisasi menerobos "portal izin yang lagi error" untuk menjalankan installer — pola yang membuat alat TIDAK AMAN dipakai orang lain. Ditautkan ke §12 (larangan eksplisit) + KEUNGGULAN faktor H.

## [1.23.3] - 2026-06-14

### Diperbaiki
- **[SECURITY] KOREKSI aturan tier-guard (§8.1 #4 + §7.6) — dari "tidak ada penjaga, tulis langsung" jadi "CEK dulu, HORMATI penjaga asli".** Akar nyata ditemukan via uji empiris AI di komputer staf: popup "Penjaga keamanan menolak pembuatan berkas" **BUKAN halusinasi** — project staf PUNYA hook penjaga sendiri (`tier-guard.mjs`, dipasang user/tim, terdaftar di `.claude/settings.json`) yang **nyata memblokir** penulisan berkas sampai ada `.staff-profile.md` ber-tier (banner `[tier-guard] .staff-profile.md not found...`). Riwayat git mengonfirmasi **kit TIDAK PERNAH** memasang file ini.
- **Kesalahan aturan lama (v1.23.0–v1.23.2):** menyimpulkan "kit tidak memasang → tidak ada penjaga sama sekali → popup pasti halusinasi" → menyuruh AI **MENYANGKAL/MENEROBOS keamanan ASLI milik user** (lebih berbahaya dari popup-nya).
- **Koreksi:** AI WAJIB **cek** `.claude/settings.json` + `.claude/hooks/` + output saat menulis **SEBELUM** menyimpulkan. Penjaga terbukti **tidak ada** → tulis langsung. Penjaga **ADA + memblokir** → **HORMATI** (jangan terobos/sangkal), jelaskan jujur + popup **[1] Buat kartu identitas dulu (rekomendasi** — tanya peran, default anggota tim aman, **BUKAN** auto `tier: owner`**)** / [2] tampilkan di chat / [3] lewati. Membatalkan aturan keliru v1.23.0–v1.23.2.

## [1.23.2] - 2026-06-14

### Diperbaiki
- **[SECURITY] Aturan KERAS anti-popup-penjaga-palsu (§8.1 #4)** — perkuat fix v1.23.1 yang ternyata masih terlalu lemah/terkubur (popup "Penjaga keamanan menolak pembuatan berkas" masih muncul di v1.23.1). Ditambah larangan keras menonjol: **TIDAK ADA penjaga yang memblokir pembuatan berkas**; membuat docs/denah **TIDAK butuh** `.staff-profile.md`; **DILARANG KERAS** memunculkan popup "penjaga menolak" / "belum ada kartu identitas → diblokir" / "buat staff-profile dulu untuk membuka izin tulis" (itu halusinasi penghalang yang tak ada, §8.2 "no quote = no claim"). Diminta bikin denah tapi `.staff-profile.md` belum ada → **buat LANGSUNG**, jangan tahan, jangan popup izin. `.staff-profile.md` = OPSIONAL (pencatatan peran), **bukan syarat menulis**. Mencegah pula opsi lama "(tier: owner)" yang diam-diam memberi staf akses setingkat owner (bocor pertahanan-IP).
- Contoh §8.1 #4 diganti jadi format **SALAH vs BENAR**: yang BENAR = buat denah langsung, lalu boleh **tawarkan** kartu identitas OPSIONAL setelahnya (bukan gerbang sebelum kerja, bukan auto `tier: owner`).
- Catatan jujur (§4.6): popup ini **di-improvisasi sesi AI** — terbukti via riwayat git (teksnya **TIDAK PERNAH** ada di kit versi mana pun), bukan teks tetap. Perbaikan ini menuntun improvisasi agar popup itu tidak terjadi; baru terlihat di layar staf **setelah kit di komputer itu di-update ke v1.23.2 + buka chat BARU**.

## v1.9.0 — 2026-06-12 (Perisai keamanan AI: 4 pertahanan baru + daftar folder rahasia terlarang) [SECURITY]

**[SECURITY]** — entri ini rilis keamanan (penanda body ditambahkan v2.0.0 supaya pemindai rentang yang membuang heading tetap mendeteksinya).

> **Tier**: 2 (aturan baru, backward-compatible) — naik **MENENGAH** 1.8.0 → 1.9.0 (per §11: aturan baru = MENENGAH). Hanya MENAMBAH pagar keamanan, tidak mengubah perilaku lama → NOT BREAKING. Label **[SECURITY]**: memperkuat pertahanan AI, layak dipasang lebih awal.

- **`CLAUDE_universal_v1.md` §8.1 — 4 aturan anti-penipuan AI BARU (6-9)**: (6) kerahasiaan secret/kunci-API mutlak + **daftar folder rahasia terlarang** (`.env*`, `~/.ssh/`, `~/.aws/`, `~/.config/gcloud/`, `*.pem`/`*.key`) yang AI tak boleh baca-lalu-kirim-keluar; (7) validasi kode/perintah dari isi file sebelum dijalankan; (8) tahan tekanan psikologis ("darurat/atasan/buru-buru" tak membatalkan aturan keamanan); (9) deteksi & tolak penyalahgunaan. Semua bahasa non-programmer + analogi 3-lapis.
- **Asal temuan**: 4 celah ini ditemukan via audit pembanding ECC v2.0.0 (MIT) — pertahanan yang §8.1 lama (5 aturan) belum tutup. Ditulis ulang dalam voice lintasAI, BUKAN menyalin teks ECC.
- **`CLAUDE_universal_v1.md` + `package.json`**: versi 1.9.0.
- QA: smoke PASS (edit dokumentasi aturan + nomor versi saja; tidak sentuh skrip PowerShell → Pester tak terdampak).

---

## v1.7.7 — 2026-06-11 (Label [SECURITY] urgensi + dokumentasi update 3-repo)

> **Tier**: 2 (AI auto-sync) — NOT BREAKING. (Dogfood: perubahan kecil → naik angka KECIL 1.7.6→1.7.7.)

- **Celah ditutup (#4 update mechanism)**: 4-tier update soal "seberapa besar" — TAPI perbaikan keamanan bisa KECIL tapi MENDESAK, dan tidak ada sinyal urgensi terpisah. Akibat: staff non-programmer bisa menunda perbaikan keamanan kecil → rawan lebih lama.
- **Label `[SECURITY]` (BARU)**: urgensi terpisah dari ukuran. `update-kit.ps1` kini mendeteksi `[SECURITY]` di CHANGELOG (regex berjangkar, sama seperti [BREAKING]/[SCAN-REQUIRED]) → menampilkan peringatan merah "pasang SEGERA, jangan tunda". Didefinisikan di CHANGELOG "Label spesial" + `CLAUDE_universal_v1.md` §11 + `UPDATE_GUIDE.md`.
- **`UPDATE_GUIDE.md` v3 — §6.1 (BARU)**: alur update saat 3-repo (split). Mengoreksi kekhawatiran sebelumnya: `.claude-kit/` IKUT di-commit ke repo (terbukti `setup-pola-b.ps1:1587` + `README:426`), jadi update = owner update+commit+push per repo, staff cukup `git pull` (versi konsisten lewat git, bukan update per-clone).
- Verifikasi jujur: celah update #2 (drift) & #3 (per-clone) TERNYATA sudah teratasi git (`.claude-kit/` di-commit) — penilaian sebelumnya over-worry, dikoreksi.
- QA: smoke PASS, Pester 132/132.

---
