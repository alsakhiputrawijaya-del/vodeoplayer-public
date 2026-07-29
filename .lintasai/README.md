# README - Kit Aturan AI Kerja Profesional
> · 2026-07-15 · Windows-only · standar tim IT · 21 file tim panduan
> [Changelog](CHANGELOG.md) · [License: MIT](LICENSE)
> Repo: [github.com/ojokesusu/lintasAI](https://github.com/ojokesusu/lintasAI) (privat — repo standar tim) · paket npm: [lintasai](https://www.npmjs.com/package/lintasai) (publik)

---

## 🌟 Versi stabil sekarang: **v7.0.0** (2026-07-26)

> Ringkasan ini = "pinned message" untuk staff IT non-programmer. Detail lengkap per versi ada di [CHANGELOG.md](CHANGELOG.md).

> ### ⚠️ Status fitur (jujur — baca sebelum pakai)
> - ✅ **INTI — STABIL & teruji**: pasang kit, aturan AI auto-load, dokumentasi, audit, refactor, workflow non-programmer. **Aman dipakai sehari-hari.** (ratusan cek otomatis lulus — jalankan `npm test` untuk jumlah terkini — + dipakai sendiri di repo kit ini.)
> - 🆕 **Kimi Code CLI — BARU (aturan siap)**: kit kini jalan di **Kimi Code CLI** juga, bukan cuma Claude Code. Aturan lengkap (mutu identik Claude) otomatis — Kimi membaca `AGENTS.md` akar project secara native, tanpa setup tambahan. Batas jujur: palang pengaman berbasis hook (Palang Rem/Palang Rak) hanya jalan di Claude Code — di Kimi andalkan aturan + tinjauan manusia, **wajib diuji sendiri** saat mulai pakai Kimi.

### Cara pasang (1 perintah)

Buka **Claude Code chat** di project kamu, paste:

```
npm create lintasai
```

Kit akan otomatis memasang aturan AI tim + menyalin dokumentasi + mengatur izin akses AI (daftar perintah yang boleh dijalankan otomatis). Tunggu ~1 menit.

> 💡 **Kalau AI menanyakan izin** untuk menjalankan `npm create lintasai` (muncul kotak pilihan mirip *"Cara jalan"* — Claude Code memang ekstra hati-hati dengan perintah `npm`; ini **NORMAL**, **bukan** error lintasAI): pilih **"Izinkan di repo ini"**. Dengan begitu AI memasang di project-mu lalu **langsung lanjut memandu** (Fase B). Hindari opsi *"jalankan sendiri di terminal"* kalau ingin AI tetap auto-lanjut memandu.

### Janji inti — yang DIJAMIN vs yang DITAWARKAN

> 🎚️ Sebelum daftar fitur di bawah, ini **inti** kit lintasAI:
> - ✅ **WAJIB & tak bisa dimatikan — 4 pagar keselamatan:** anti-bocor rahasia & keamanan dasar · anti-ngarang (tiap klaim wajib berbukti) · bahasa Indonesia yang dimengerti orang non-teknis · gerbang "belum boleh bilang selesai sebelum terbukti". Ini yang tak bisa dibujuk lewat.
> - 🧰 **Standar profesional ikut otomatis, tanpa kamu mengetik apa pun:** keamanan, database, tampilan & desain (termasuk larangan mengirim tampilan template mentah), kenyamanan-pakai + aksesibilitas WCAG 2.2, pengiriman-ke-server, dan biar-ketemu-di-Google (SEO) — semuanya sudah tertanam di aturan yang dibaca AI tiap sesi, plus perpustakaan rujukan yang dibuka saat topiknya nyambung.
> - 🎛️ **Sisanya = REKOMENDASI yang DITAWARKAN (bukan keharusan):** semua fitur di tabel bawah + standar kode/dokumentasi/proses = AI **menyarankan & menjalankan default**, tapi **kamu yang pilih** — boleh pakai/lewati/matikan per project.
> - 📈 **Kamu tumbuh sendiri:** tiap info dijelaskan **3 hal** — apa maksudnya (bahasa awam), kenapa, dan langkah berikutnya — dengan istilah programming dibiarkan **asli lalu dijelaskan**, bukan diterjemahkan. Blok **2 versi** berlabel profesi (👨‍🎓 Junior-Backend / Junior-SEO … + 🙂 bahasa sehari-hari) muncul saat AI menyusun **rencana** dan saat ada **tinjauan lintas-divisi** — isinya dari divisi yang berkasnya benar-benar tersentuh, bukan ritual tiap jawaban. Gaya jawaban utamanya tetap natural seperti bawaan AI-nya. Sengaja begini supaya kamu naik kelas dari waktu ke waktu (non-programmer → junior-profesi → senior-profesi), bukan selamanya bergantung.

### Apa yang kit kasih (7 highlight versi stabil)

| # | Fitur |
|---|---|
| 1 | **AI auto-pakai aturan tiap sesi** — kernel `AGENTS.md` dibaca native semua alat AI |
| 2 | **Bahasa Indonesia default** — semua respons AI + dokumentasi |
| 3 | **Bahasa Non-Programmer** — jargon dijelaskan dengan bahasa awam (1 kalimat, polos & langsung) |
| 4 | **Anti-Halusinasi Protocol** — AI WAJIB verify klaim file/fungsi sebelum diucapkan |
| 5 | **Update Strategy 4-tier** — kit update otomatis classify Tier 1-4 (Silent / AI-auto-sync / BREAKING / SCAN-REQUIRED) |
| 6 | **Safety net 3-layer** — backup pre-install, manifest HMAC signed, safe uninstall via diff |

### Untuk staff IT non-programmer (Day 0)

Cukup jalankan `npm create lintasai` di folder project (atau minta AI-mu menjalankannya) — sisanya AI yang memandu. Skip rest of README — itu dev reference.

### Peta Keputusan — "Mau apa → buka/paste file ini"

Bingung mulai dari mana? Cari niatmu di kolom kiri, lalu buka/paste file di kolom kanan ke Claude Code:

| Kamu mau... | Buka / paste file ini |
|---|---|
| 🚀 Pasang kit pertama kali | `npm create lintasai` |
| ⬆️ Update kit ke versi baru | `npx lintasai update` (atau chat "update kit") |
| 🚨 Ada insiden keamanan | `docs/SECURITY_INCIDENT_PLAYBOOK.md` |

> Tidak hafal? Tidak apa-apa. Chat saja maksudmu pakai bahasa biasa ("mau rapikan kode") — AI otomatis arahkan ke file yang tepat.

### Roadmap dekat

- **Penyempurnaan kecil berkelanjutan** — perbaikan perilaku AI + dokumen + tes. Tidak merusak yang sudah jalan; staff cukup minta AI "update kit" (atau jalankan `npx lintasai@latest update`).
- **Dukungan lintas-platform (target ke depan)** — macOS + Linux. Ditandai perubahan-besar karena sekarang khusus Windows.

> Catatan: **v2.0.0** (kit 100% Node, seluruh alat PowerShell dihapus) sudah **RILIS** (2026-07-10) — bukan lagi rencana. Versi stabil sekarang (lihat atas).

---

## Struktur paket
```
claude-ai-rules-kit/
├── README.md                              ← kamu baca ini sekarang
├── CHANGELOG.md                           ← log perubahan per versi
├── LICENSE                                ← MIT (bebas pakai/modif/distribusi)
├── AGENTS.md                              ← KERNEL aturan (acuan tunggal; dibaca native semua alat AI — ADR-032)
├── skills/                                ← rak panduan on-demand per-bidang (`<nama>/SKILL.md`; registry.json = indeks)
├── AGENTS.override.md.template            ← template override khusus proyek untuk root (Pola B)
├── bin/lintasai.js                        ← ENTRY-POINT RESMI: dispatcher Node (`npm create lintasai` / `npx lintasai`)
├── engine/                                ← helper engine + robot (Node `*.mjs`/`*.js`)
├── setup-pola-b.mjs                       ← auto-setup Pola B (skeleton docs + auto-copy file tim) (Node)
├── update-kit.mjs                         ← auto-update kit (re-clone + backup + setup, rollback-safe) (Node)
├── uninstall.mjs                          ← safe uninstall via manifest sha256 diff (Node)
├── kit.mjs                                ← router perintah kit (doctor/version/status/diff) (Node)
└── templates/                             ← panduan on-demand: TINGGAL DI SINI, dirujuk skill lewat path `templates/...`
    ├── STACK_GUIDE.md                     ← Next.js + Vercel + SEO + security
    ├── SECURITY_INCIDENT_PLAYBOOK.md      ← playbook respon insiden keamanan (~5 menit baca)
    ├── STACK_MIGRATION_GUIDE.md          ← panduan migrasi Vercel -> Railway/Render (ADVANCED)
    ├── SAFE_DATABASE_OPERATIONS.md        ← langkah aman ubah struktur tabel + runbook rollback
    ├── PRODUCTION_OBSERVABILITY.md        ← error-tracking + log terstruktur + healthcheck
    └── github/                            ← template GitHub Actions (di-copy ke proyek .github/)
        ├── workflows/backup-schemas.yml   ← auto-backup schema DB ke artifact
        └── workflows/secret-guard.yml     ← penjaga rahasia (blok commit .env/kunci)
```

## Halo!
Hai, bro/sis! Paket ini isinya **aturan kerja AI** yang aku pakai sehari-hari biar Claude Code (AI coding assistant-nya Anthropic) gak ngasal - outputnya rapi, ada dokumentasi, dan junior-friendly. Aku bagikan ke kamu supaya kamu gak perlu nyusun aturan dari nol. Sekali install, semua proyek kamu di komputer ini langsung "patuh" tanpa kamu copy-paste aturan tiap sesi. Estimasi setup: **5 menit**.

> Kit ini dipakai sebagai **standar tim IT** kita. Semua anggota tim pakai versi yang sama biar konsisten antar-proyek. Detail soal versi & update di section **Standar tim** di bawah.

> *Claude Code* = CLI (Command Line Interface) resmi Anthropic buat ngobrol sama AI Claude langsung dari terminal. Mirip ChatGPT tapi bisa baca/tulis file di komputer kamu.

## Apa isi paket ini?
"Kit" = ikut terpasang ke `.lintasai/` di project saat `npm create lintasai`. "Meta" = file pengantar repo (tidak dibaca AI tiap sesi).

| File | Fungsi singkat | Kategori |
|---|---|:-:|
| `AGENTS.md` | **Kernel aturan** (acuan tunggal, ADR-032) - dibaca native Codex/Kimi/Cursor + Claude via `@import` | Kit |
| `AGENTS.override.md.template` | Template override khusus proyek (dicopy ke root sebagai `AGENTS.override.md`, milik client) | Kit |
| `skills/` | Rak panduan on-demand per-bidang - dibuka AI sesuai topik prompt kamu | Kit |
| `templates/` | Panduan mendalam yang dirujuk skill (STACK_GUIDE, SAFE_DATABASE_OPERATIONS, dll) | Kit |
| `setup-pola-b.mjs` | Script auto-setup Pola B di root proyek (pasang AGENTS.md + CLAUDE.md + hook) | Kit |
| `README.md` | File ini - baca dulu | Meta |
| `CHANGELOG.md` | Log perubahan per versi | Meta |
| `LICENSE` | MIT - bebas pakai/modif/distribusi | Meta |
| `.gitignore` | Untuk repo standar tim (kalau kit ini di-track di Git) | Meta |

> Catatan path: kit ini Windows-only. `~/.claude/` di PowerShell sama dengan `%USERPROFILE%\.claude\` (mis. `C:\Users\<NamaKamu>\.claude\`). Backslash `\` dan slash `/` dua-duanya jalan di PowerShell modern.

## Persiapan (sekali saja)
1. Install **Claude Code** dulu kalau belum: https://claude.com/claude-code
2. Login ke akun Anthropic kamu (ikutin instruksi installer).
3. Cek dia jalan: buka terminal, ketik `claude --version`. Kalau keluar nomor versi, aman.

## Cara Install (Recommended untuk Staff)

> 🧭 **Tidak perlu bingung pilih cara.** Untuk semua orang cukup **1 perintah: `npm create lintasai`** (di bawah).
>
> | Kondisi kamu | Pakai ini |
> |---|---|
> | Staff biasa / paling umum | **`npm create lintasai`** |
> | Owner / butuh perintah lanjutan (update, doctor, rollback) | `npx lintasai <perintah>` |
>
> Keduanya berujung ke pemasang yang **sama**.

### Cara pasang: lewat Claude Code chat (1 perintah, paling cepat — disarankan)

Buka **Claude Code chat** di folder project kamu, lalu ketik/paste:

```
npm create lintasai
```

Biarkan **AI yang menjalankan** perintah ini (lewat chat). Pemasang versi Node berjalan **otomatis penuh** (tanpa popup jendela Windows) — kamu **langsung** masuk ke popup pemandu di dalam chat. Kit auto-deploy + setup project. Total ~1 menit.

> Mau jalankan sendiri di terminal? Boleh — buka PowerShell di folder project lalu jalankan `npm create lintasai`. Sejak pemasang versi Node, pemasangan **otomatis penuh** (tanpa popup jendela Windows) baik lewat chat maupun terminal; pilihan (AGENTS.md, email, buka VS Code) diatur lewat AI di chat sesudah pemasangan.

Untuk update, cukup minta AI di chat: **"tolong update kit"** (AI yang jalankan). Atau manual dari dalam project:
```bash
npx lintasai@latest update
```

## Pakai sehari-hari

Tinggal `claude` aja di folder proyek - aturan kit (`AGENTS.md` + `.lintasai/`) ke-load otomatis, gak perlu paste apa-apa.

```powershell
cd C:\path\ke\proyek
claude
```

Kapabilitas besar (mis. rapikan kode) tinggal diminta lewat chat kapan saja.

---

## Standar tim (kalau dipakai >1 orang)
Kit ini dirancang jadi **standar tim IT 3-10 orang**. Filosofi: hemat energi, konsisten lintas-proyek, perbaikan bertahap. Beberapa hal yang penting saat dipakai tim:

- **Semua anggota pakai versi yang sama** - taruh kit di Git repo private internal dengan tag versi (`v1`, `v1.1`, dst). Bukan Google Drive bebas yang versinya nyasar.
- **1 owner standar** (mis. pemimpin tim) yang approve perubahan aturan + rilis versi baru. Anggota lain usul via issue/PR di repo standar.
- **Channel diskusi tunggal** (`#it-standard` di Slack/Discord/WA) untuk usulan, announce update, troubleshooting.
- **Update otomatis backup** - saat owner rilis versi baru, anggota cukup minta AI di chat: *"tolong update kit"* (atau `npx lintasai@latest update`). Mesin update mencadangkan kit lama ber-timestamp, gak rusak setting existing.
- **Exception per-proyek dicatat** - kalau proyek X opt-out aturan Y, catat di `exceptions.md` di repo standar dengan sunset date. Review tiap bulan.
- **Adopsi per-proyek** - pasang kit (`npm create lintasai`), lalu kerja seperti biasa; aturan ke-load otomatis tiap sesi.

## Hapus kit dari proyek (uninstall yang aman)

Mau hapus lintasAI dari proyek? **JANGAN delete folder `docs/` atau `.github/` mentah-mentah** - folder itu kemungkinan campur antara file kit dan file proyek kamu sendiri. Pakai perintah uninstall bawaan (`npx lintasai uninstall`) yang tahu mana file kit vs mana file proyek.

**Alur disarankan untuk user baru (3 langkah):**

**Langkah 1 - Preview dulu (WAJIB, supaya tahu apa yang akan dihapus):**
```powershell
npx lintasai uninstall
```
Script tampilkan: daftar file PRISTINE (akan dihapus), MODIFIED (akan DILEWATI), SYMLINK/BLOCKED/LOCKED (SKIP dengan alasan), dan ringkasan total. Tidak ada satu pun file yang dihapus di langkah ini.

**Langkah 2 - Hapus beneran (konservatif, RECOMMENDED):**
```bash
npx lintasai uninstall --yes
```
`--yes` = konfirmasi hapus (tanpa itu, perintah cuma menampilkan rencana lalu berhenti aman). Perintah hapus cuma file PRISTINE. File yang sudah kamu edit TETAP ada.

**Langkah 3 - Hapus folder `.lintasai\` sendiri (manual):**
Script tidak bisa hapus folder yang sedang dia jalankan dari sana. Setelah langkah 2 selesai, **TUTUP semua VSCode / editor yang membuka file di `.lintasai\`**, lalu jalankan di PowerShell baru:
```powershell
Remove-Item -Recurse -Force .\.lintasai
```

**Opsi tambahan (advanced):**
```bash
# Hapus juga file kit yang sudah kamu edit (backup .bak dulu, jadi rollback-able):
npx lintasai uninstall --yes --allow-modified

# Hapus juga AGENTS.md (default skip karena heavy customization):
npx lintasai uninstall --yes --delete-agents

# Suppress instruksi self-delete .lintasai\ (kalau memang mau retain folder kit):
npx lintasai uninstall --yes --keep-kit

# Folder proyek di-rename setelah install (manifest project_root tidak match):
npx lintasai uninstall --yes --allow-project-root-mismatch
```
> Catatan: tanpa `--yes`, perintah cuma menampilkan rencana lalu berhenti aman (SIMULASI — jalan pura-pura, tidak menghapus apa pun). `--force` versi lama = alias usang untuk `--allow-modified`.

**Setelah selesai, kamu akan dapat konfirmasi:**
- File proyek asli di `docs/`, `src/`, `package.json`, dll. AMAN tidak disentuh.
- File kit yang kamu edit (tanpa `-Force`) masih ada di tempatnya.
- Verifikasi: jalankan `git status` - file proyek tidak boleh muncul sebagai deleted.

**Cara kerja:** pemasang (`setup-pola-b.mjs`) tulis `.lintasai/.install-manifest.json` yang berisi sha256 hash setiap file yang kit copy. Uninstall classify tiap file:

- **PRISTINE** (hash match) → auto-delete, file persis sama dengan kit.
- **MODIFIED** (hash beda) → kamu sudah edit; default SKIP. `-Force` → backup ke `.pre-uninstall-<timestamp>.bak` lalu hapus.
- **SYMLINK** (junction / symbolic link) → SKIP selalu (cegah leak isi file di luar project ke .bak).
- **BLOCKED** (path escape ke luar project root) → REJECT (proteksi path traversal kalau manifest di-tamper).
- **LOCKED** (hash gagal - file di-buka editor / AV) → SKIP, tutup editor + re-run.
- **MISSING** (file sudah tidak ada) → skip silent.
- **BACKUP** (file `.backup-*` dari setup -Force) → preserved, hapus manual kalau mau.

**Hard-fail** kalau `project_root` di manifest tidak match lokasi sekarang (cegah manifest project lain delete file di sini). Override via `-AllowProjectRootMismatch` untuk kasus folder di-rename.

**AGENTS.md default tidak dihapus** (heavy customization expected). Pakai `-DeleteAgents` kalau memang mau hapus.

**Direktori (`docs/`, `.github/`, dll.) cuma dihapus kalau EMPTY** setelah file kit dibersihkan. Project file kamu di sana TETAP aman. Junction/symlink dir terdeteksi → tidak diikuti.

**⚠ Catatan TOCTOU (waktu-cek vs waktu-pakai):** plan dry-run (SIMULASI - jalan pura-pura, tidak menghapus apa pun) adalah snapshot - kalau kamu edit file antara SIMULASI dan eksekusi nyata, script re-hash sebelum delete dan SKIP file yang berubah. Aman.

**⚠ Catatan re-create:** kalau kamu pernah `git checkout -- <file>` revert file kit ke versi original, hash akan match lagi → file ke-auto-delete sebagai PRISTINE. Selalu jalankan `-DryRun` dulu sebelum `-Yes` untuk automation.

#### Kalau manifest TIDAK ADA (kit lama / corrupt)

Untuk install pakai versi < v1.0.0 (sebelum manifest support) atau manifest hilang, perintah `npx lintasai uninstall` keluar dengan instruksi fallback manual. Daftar file yang kit deploy di Pola B:

- `AGENTS.md` + `AGENTS.override.md` (root proyek) - **JANGAN hapus tanpa baca dulu** (override berisi kustomisasimu)
- `CLAUDE.md` (pemuat aturan untuk Claude Code)
- `.github/workflows/backup-schemas.yml`, `.github/workflows/secret-guard.yml`
- `.lintasai/` folder itu sendiri

> Sejak v6.0.0 kit **tidak lagi** menyalin panduan ke `docs/` project kamu - semuanya tinggal di satu
> tempat, `.lintasai/templates/`. Kalau kamu masih punya sisa salinan lama di `docs/` (STACK_GUIDE,
> SAFE_DATABASE_OPERATIONS, dll), `npx lintasai@latest update` membersihkannya otomatis - kecuali yang
> sudah kamu edit sendiri, itu sengaja dibiarkan.

Review tiap file sebelum hapus - `.github/` kemungkinan campur dengan file proyek kamu sendiri.

## Troubleshooting setup

**`claude` command not found**
Install Claude Code dulu: https://claude.com/claude-code. Verifikasi: `claude --version`.

**AI tidak baca AGENTS.md / `.lintasai/`**
Pastikan kamu jalankan Claude Code dari **root proyek** (folder tempat `AGENTS.md` berada), bukan dari subfolder. Tanya AI: *"Kamu baca file aturan dari path apa?"* - kalau jawab `~/.claude/CLAUDE.md`, bukan `./AGENTS.md`, kemungkinan kamu jalanin dari folder salah.

## FAQ singkat

**Q: Aku udah punya `CLAUDE.md` global, gimana?**
A: Biarkan saja — kit ini terpasang **per-project** (`.lintasai/` + `AGENTS.md`), tidak menyentuh file globalmu. Saat bentrok, aturan project (`AGENTS.md`) yang menang.

**Q: AI-nya bandel, gak ikut aturan?**
A: Tegur langsung: *"kamu ngelanggar aturan poin X di CLAUDE.md, ulangi"*. Biasanya nurut. Kalau sering, cek dia baca file yang bener: tanya *"path CLAUDE.md yang kamu baca apa?"*

**Q: Mau update aturan ke versi baru?**
A: Minta AI di chat: *"tolong update kit"* (atau `npx lintasai@latest update`) - backup otomatis, file baru ke-pasang. Versi tertulis di header tiap file.

**Q: Boleh aku modif aturannya?**
A: Boleh banget! Itu file kamu sendiri. Saran: naikkan versi & tanggal di header tiap kali nge-edit, biar gampang lacak.

**Q: Komputer kerja kantor, gimana?**
A: Aturan kit disimpan di folder project (`.lintasai/` + `AGENTS.md`), gak ganggu setting user lain / proyek lain. Aman.

**Q: Mau nambah aturan khusus proyek?**
A: Tulis di `AGENTS.md` root proyek - isinya **ditambahkan** ke aturan kit (bukan menimpa total). Cocok buat catatan khusus stack/konvensi proyek itu.

**Q: Memory & plans Claude Code disimpan di mana? Kenapa gak di `.lintasai/`?**
A: Disimpan di `%USERPROFILE%\.claude\projects\<hash>\memory\` & `%USERPROFILE%\.claude\plans\` - **by-design Anthropic Claude Code**, bukan kit ini. Sengaja TIDAK di `.lintasai/` karena:
- **Privacy** - memory berisi info pribadi (preferensi user, snapshot keamanan, kredensial dev). Kalau ter-commit = bocor sekali push.
- **Per-user** - memory kamu beda dari memory teman tim. Tidak share-able dalam 1 repo.
- **Auto-load** - Claude Code engine hardcode baca path tersebut. Pindah lokasi = auto-load mati.

Jadi 4 lokasi persistence Claude Code adalah:

| Lokasi | Ter-commit? | Peran |
|---|:-:|---|
| `.lintasai/` + `AGENTS.md` (di repo) | ✅ YA | Aturan tim - shared ke semua |
| `docs/` (di repo) | ✅ YA | Dokumentasi teknis proyek |
| `%USERPROFILE%\.claude\projects\<hash>\memory\` | ❌ TIDAK | Catatan AI private (per-user) |
| `%USERPROFILE%\.claude\plans\` | ❌ TIDAK | Draft plan AI sementara (per-user) |

**Saran:** generate file `docs/CLAUDE_PERSISTENCE_MAP.md` di proyek kamu - peta singkat lokasi persistence di atas (4 lokasi) + catatan mana yang ter-commit / tidak. Tim baru tinggal baca peta itu, gak perlu nanya lagi. AI bisa bantu generate sekali kalau kamu minta.

## Quality & Audit

lintasAI menjalani audit komprehensif untuk memastikan stabilitas distribusi:
- **2026-06-06**: 132-agent multi-lens scan, 59 confirmed findings, semua critical di-fix di v1.2.0-v1.2.2
- Riwayat audit lengkap (findings + verdict timeline + items deferred) ada di riwayat git repo GitHub. Advisori keamanan AKTIF ada di [SECURITY.md](SECURITY.md).

---

## Penutup
Kalau masih bingung, buka Claude Code **di folder proyek setelah install kelar**, lalu chat: "Halo, aku staff baru. Tolong cek install kit + briefing aturan dasar." AI akan auto-detect kondisi dan apply alur berpemandu bertahap sesuai `AGENTS.md` §4 (loop kerja). Selamat ngoding bareng AI yang patuh!
