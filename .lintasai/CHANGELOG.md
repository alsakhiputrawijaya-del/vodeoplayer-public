# Changelog

Semua perubahan signifikan ke kit ini didokumentasikan di file ini.

Format mengikuti [Keep a Changelog](https://keepachangelog.com/id-ID/1.1.0/),
dan kit ini mengikuti [Semantic Versioning](https://semver.org/lang/id/).

## Label spesial (auto-detect oleh `npx lintasai update`)

- **[BREAKING]** - Ada perubahan tidak backward-compatible. Wajib baca migration notes.
- **[SCAN-REQUIRED]** - Wajib regenerate `docs/` project: minta AI baca ulang struktur repo & perbarui catatan project (mis. `docs/architecture.md`).
- **[SECURITY]** - Perbaikan KEAMANAN. Pasang SEGERA walau update kecil — **urgensi, terpisah dari ukuran** (bisa nempel di tingkat mana pun). Tool `npx lintasai update` tampilkan peringatan merah "pasang SEGERA".

Tanpa label, update aman: `docs/` user TIDAK perlu di-scan ulang.

## Disiplin penomoran versi (semver) — WAJIB saat rilis

Versi = `BESAR.MENENGAH.KECIL`. Saat owner/AI menaikkan versi:
- **Perbaikan kecil** (typo, fix, Tier 1) → naikkan **KECIL**: `1.7.5 → 1.7.6`
- **Fitur/aturan baru** backward-compatible (Tier 2) → naikkan **MENENGAH**: `1.7.x → 1.8.0`
- **Breaking** (`[BREAKING]`, Tier 3) → naikkan **BESAR**: `1.x → 2.0` — **WAJIB**, jangan sembunyikan breaking di angka kecil/menengah.

> **Kenapa:** staff non-programmer sering cuma melihat NOMOR. Kalau breaking nyelip di angka kecil, mereka kira aman → kaget. **Angka BESAR yang JARANG naik = sehat** (jarang merusak user); yang dihindari bukan angka besar, tapi sering-breaking. Aturan inti penomoran: semver kit (resep rilis: `docs/RESEP_PERUBAHAN.md`).

---

## [7.0.0] - 2026-07-27

> **[BREAKING] Ringkasan rilis:** folder kit di project kamu berganti nama dari **`.claude-kit/`**
> jadi **`.lintasai/`**. **Fungsi kit TIDAK berubah sama sekali** — cuma namanya. Kamu **tidak perlu
> melakukan apa pun**: jalankan `npx lintasai@latest update` dan semuanya dipindahkan otomatis.

### Kenapa diganti

Nama `.claude-kit` menyesatkan. Folder itu produk **lintasAI**, tapi namanya menyiratkan milik
Claude/Anthropic — apalagi ia duduk bersebelahan dengan `.claude/` (folder asli Claude Code). Banyak
staff mengira folder itu bagian dari Claude Code lalu takut menyentuhnya.

Nama baru tetap **diawali titik** dan **huruf kecil semua**, dua-duanya disengaja:
- **Titik di depan** = folder perkakas, tetap tersembunyi. Kit ikut ter-commit ke repo, jadi tanpa
  titik ~500 berkasnya akan muncul di tiap diff PR + ikut dibaca ESLint/tsc/pemindai rahasia project.
- **Huruf kecil semua** = aman di Linux/Docker. `lintasAI` dan `lintasai` dianggap sama di
  Windows/macOS tapi **beda** di Linux — salah ketik lolos di laptop lalu gagal di server.

### Yang dilakukan update secara OTOMATIS

1. Ganti nama folder `.claude-kit/` → `.lintasai/` (**pindah nama saja**, isi tak disentuh, tak ada
   berkas yang dihapus).
2. Arahkan ulang **4 hook** di `.claude/settings.json` (Palang Rem, Palang Rak, Lampu Hijau Plan
   Mode, pengingat bahasa) ke folder baru. **Hook & pengaturan milikmu sendiri TETAP UTUH.**
3. Tulis ulang path di catatan-pasang (`.install-manifest.json`) + **segel dibuat ulang**, supaya
   `doctor`, `uninstall`, dan `rollback` tetap mengenali berkas kit.
4. Tambah pola `.gitignore` untuk folder baru (rahasia kit tetap terlindungi dari commit).
5. Perbarui berkas aturan Cursor (`.cursor/rules/lintasai.mdc`).
6. Segarkan isi kit supaya kodenya menunjuk folder yang benar.

### Yang PERLU kamu lakukan (opsional, tak mendesak)

Kalau `AGENTS.override.md` atau `.gitignore`-mu menyebut `.claude-kit/`, ganti sendiri jadi
`.lintasai/`. **Sengaja tidak kami ubah** — dua berkas itu milikmu dan kit berjanji tak pernah
menimpanya. Update akan menyebutkan nama berkasnya kalau memang ada.

### Kalau update BERHENTI (semuanya aman, nol berkas disentuh)

- **"Ada DUA folder kit sekaligus"** — ada `.claude-kit/` dan `.lintasai/` berdampingan (sisa migrasi
  yang terputus). Kami tidak menebak mana yang benar. Cek isi keduanya, simpan yang kamu mau, hapus
  yang satunya, lalu ulangi.
- **"dijalankan DARI DALAM folder itu sendiri"** — jalankan `npx lintasai@latest update` dari akar
  project, bukan dari dalam folder kit (di Windows folder yang sedang dipakai proses tak bisa
  di-rename).
- **"Gagal mengganti nama folder"** — ada editor/terminal yang membuka berkas di folder itu. Tutup VS
  Code / terminal di sana lalu ulangi. Kit kamu tidak berubah.

### Perbaikan lain yang ikut di rilis ini

- **[SECURITY]** Hook penjaga rahasia pre-commit kini **di-refresh** kalau isinya basi. Sebelumnya
  cek idempoten hanya melihat penanda, jadi hook yang sudah terpasang **membeku di versi install
  pertama selamanya** — tiap perbaikan pemindai rahasia tak pernah sampai ke pemasangan lama. Efek
  nyatanya: pengecualian folder kit jadi basi → alarm-palsu tiap update → staff terlatih memakai
  `git commit --no-verify`.
- Nama folder kit kini punya **satu sumber kebenaran** (`engine/project-root.mjs`), bukan
  di-hardcode di 118 berkas. Perubahan lokasi kit berikutnya tak lagi berisiko "satu tempat terlewat
  lalu gagal diam-diam".
- Update & uninstall tetap mengenali folder bernama **lama**, jadi pemasangan yang belum dimigrasi
  tidak pernah ditolak.

### Ditambahkan

- **Tugas besar dengan kalimat biasa kini diarahkan ke rak yang benar — cakupan terukur naik 19/48 →
  35/48, dan tugas BERAT dari 5/16 jadi 16/16.** Uji-jalan 48 prompt natural khas client
  (ringan/sedang/berat): hanya 19 yang dapat rak — dan 6 rak rawan-keamanan (`admin-panel`,
  `anti-fraud`, `kepatuhan-teregulasi`,
  `rate-limiting`, `realtime`, `wallet-ledger`) praktis tak terjangkau karena pemicunya jargon semua.
  Ditutup dengan **±60 frasa awam baru** di 14 skill: "transaksi gak boleh **salah hitung**" →
  `wallet-ledger` · "fitur **chat antar** user" / "aplikasi **ojek online**" → `realtime` · "batasi biar
  orang **gak spam**" → `rate-limiting` · "**halaman admin** buat **kelola produk**" → `admin-panel` ·
  "**akun palsu**" → `anti-fraud` · "simpan **rekam medis** pasien" / "**multi cabang** datanya
  **kepisah per** toko" → `database` · "**double booking**" / "**laporan penjualan**" → `backend` ·
  "**aplikasi kasir**" → `pembayaran` · "diakses 10 **ribu orang** bareng" → `caching` · "pindah ke
  **server baru**" → `devops` · "integrasi **ai chatbot**" → `permukaan-ai`. Dua rak yang dulu YATIM
  (nol pemicu awam + nol jaring path) ikut dicabut status yatimnya: `deploy` ("**hosting mana** yang
  cocok") dan `react-patterns` ("tampilannya **gak ikut berubah**", "**harus refresh dulu**").
  Semua dikunci 25 tes routing positif + 14 probe ANTI-FP baru.
- **Frasa pemicu ber-SPASI kini toleran kata sisipan (maks 2).** "takutnya **data bocor**" sudah
  tertangkap, tapi "**data** pelanggan saya **bocor** gak ya" lolos — mesin menuntut kata bersebelahan,
  padahal client menyisipkan kata di tengah frasa. Kontrak baru bagi penulis pemicu: **spasi = frasa
  kalimat (longgar)**, **tanda-hubung = istilah majemuk (tetap ketat persis seperti sebelumnya)** —
  melonggarkan yang ber-tanda-hubung terukur menghasilkan 20+ salah-nyala di rak keamanan, jadi sengaja
  tidak dilakukan. Pencocokan lama dijamin superset (nol cakupan hilang); 4 pemicu ber-spasi yang rawan
  sisipan (`aman-tidak`, `aman-belum`, `izin-tool`, `keamanan-skill`) diketatkan jadi tanda-hubung.
- **Berkas server saldo/buku-besar kini dipalang.** `wallet-ledger` = rak 🔒 yang salah-hitungnya paling
  senyap, tapi tak punya satu pun jalur path — kini `src/lib/wallet.ts`, `services/ledger.ts` dsb.
  menahan edit pertama sampai raknya dibaca. Murni aditif (entri di urutan terakhir peta): nol path
  lama yang berubah rak, komponen tampilan (`.tsx`) sengaja tetap bebas.
- **Tes ujung-ke-ujung install → routing.** Selama ini tes install hanya memeriksa wiring (string di
  settings.json) dan tes routing memakai registry tiruan 1-skill — rantai `install → registry 30 skill
  asli → hook nyata` tak pernah diuji utuh. Kini hook `lang-reminder` TERPASANG dijalankan sungguhan
  dengan prompt natural atas hasil install nyata; putusnya rantai mana pun langsung merah.

### Diperbaiki

- **Dua salah-nyala yang mengikis kepercayaan pada tanda 🔒 dicabut.** "tolong ganti warna tombol
  **daftar** jadi biru" (murni ganti warna) menyalakan 🔒 `auth`, dan "**gambar** produknya lama
  munculnya" (keluhan performa) menyalakan `owasp` — keduanya dari kata telanjang `daftar`/`foto`/
  `gambar` di pemicu. Dicabut dan diganti frasa (`daftar-akun`, `form-pendaftaran`, `pendaftaran-member`,
  `bikin-akun`; `foto-profil` tetap) — cakupan pendaftaran akun & unggah yang sah tetap dijaga tes.
  Bonus: FP lama "bikinkan halaman daftar pesanan" → auth ikut hilang.
- **Pemicu `rekam-medis`/`data-pasien` sengaja dirutekan ke `database`, BUKAN `kepatuhan-teregulasi`** —
  rak kepatuhan ber-scope judi/fintech berizin (KYC + AML + geo-block); menyodorkan checklist itu ke
  aplikasi kesehatan = arahan yang salah total. Data sensitif multi-penyewa memang rumahnya `database` 🔒.

- **Pertanyaan keamanan dengan kalimat biasa kini menyalakan standar keamanan web.** Sebelumnya "aman
  gak sih webku", "cek keamanan", "periksa apakah ada yang bocor" menghasilkan NOL rak — standar
  keamanan hanya terbuka kalau kamu mengetik istilah teknis (`owasp`, `xss`) yang justru tak dikenal
  non-programmer. 11 frasa natural ditambahkan ke pemicu `skills/owasp`.
- **Berkas pengaturan AI kini otomatis membuka rak Permukaan-AI.** Saat AI hendak menyunting
  `.claude/settings.json`, `.mcp.json`, `.cursor/mcp.json`, `.claude/hooks/` atau `.claude/agents/`
  (mis. ketika kamu minta "pasangin MCP dong"), Palang Rak menahan sampai `skills/permukaan-ai` dibaca —
  **tanpa kamu perlu mengetik istilah apa pun**.
- **Penjaga rahasia mengenali 5 jenis kunci baru:** OpenAI project (`sk-proj-`), xAI, Google/Gemini,
  Stripe live, dan GitHub fine-grained PAT — di hook pre-commit **dan** pemeriksa CI sekaligus.
- **Standar "kode rapi" diperkuat 4 aturan baru yang berlaku di SETIAP sesi** (`AGENTS.md` §3.6–§3.9) —
  hasil gabungan bagian terbaik dari dua standar coding eksternal (ECC + Willey Labs), ditulis ulang
  Bahasa Indonesia non-programmer: (1) fungsi kecil satu-tugas & satu level abstraksi, argumen menumpuk
  dibungkus jadi objek; (2) **fungsi tak boleh berbohong** — dilarang efek-samping tersembunyi di luar
  yang dijanjikan namanya, dan yang mengubah data jangan sekaligus jadi sumber jawaban; (3) dua kebiasaan
  buruk tersering dibereskan — percabangan bertumpuk jadi keluar-lebih-awal, angka ajaib jadi konstanta
  bernama; (4) wasit saat prinsip bentrok — yang paling sederhana menang, KECUALI melawan kebenaran atau
  keamanan. **Kenapa di kernel, bukan jadi skill baru:** aturan ini berlaku untuk semua jenis pekerjaan,
  jadi ia harus ikut tiap sesi — skill hanya terbuka kalau kata pemicunya kebetulan disebut, dan kalimat
  khas client non-programmer ("bikin aplikasi kasir buat warung") tak menyebut satu pun istilah teknis.
- **`skills/backend` menambah 2 pola perawatan kode:** jangan merantai panggilan menembus banyak lapis
  (Law of Demeter) dan `switch` berulang atas tipe yang sama boleh diringkas jadi tabel/factory —
  keduanya SARAN, bukan paksaan (cabang tunggal yang pendek tetap lebih jelas ditulis biasa).
- **Keluhan error & "aplikasiku jangan ikut mati" dengan kalimat biasa kini menyalakan rak yang benar.**
  Uji-jalan router atas 6 kalimat khas client: 1 benar, 2 separuh, **3 menghasilkan NOL rak**. Isi raknya
  sudah lengkap — labelnya yang salah: `skills/tahan-gagal` BERJUDUL "tahan-banting" tapi pemicunya cuma
  menulis "tahan-gagal", jadi rak itu tak bisa ditemukan dengan namanya sendiri. 9 frasa natural
  ditambahkan (`tahan-banting`, `ikut-mati`, `lagi-down`, `gagal-terus`, `sering-gagal`, `bahasa-robot`,
  `enak-dibaca`, `jadi-kosong`, `daftar-pesanan`) → sekarang **6 dari 6 mendarat benar, nol yang kosong**.
  Semuanya sengaja FRASA 2-kata, bukan kata telanjang: `down` ikut menyala di "drop down", `mati` di
  "mati lampu", `lemot` di keluhan performa — ketiganya dikunci probe ANTI-FP.
- **`skills/backend` menyerap inti penanganan error kelas industri:** (1) tentukan KELAS error sebelum
  menulis `catch` — gagal-dunia-nyata ditangkap, bug kode sendiri JANGAN ditangkap (menangkapnya lalu
  lanjut jalan = proses hidup dengan keadaan rusak, kerusakannya merembet ke data); (2) 🔒 error yang
  dibungkus WAJIB mengikat asalnya (`{ cause: e }`, padanan `from e` di Python) — tanpa itu penyebab
  aslinya hilang permanen dari log; (3) catat penuh **sekali** di boundary, bukan berlapis tiap lapis;
  (4) `requestId` wajib ikut di respons error supaya user bisa menyebutkan kodenya ke support;
  (5) 400 & 500 akhirnya dijelaskan, 429 dapat `Retry-After`, dan 422-vs-400 tak lagi ambigu.
- **Ketahanan panggilan layanan luar dapat 3 pagar baru** di `skills/tahan-gagal`: retry cuma di SATU
  lapis (retry 3× bertumpuk di 3 lapis = **27× beban** ke layanan yang sedang sekarat), anggaran waktu
  total harus muat di batas request user, dan saat saklar-pemutus terbuka sajikan data cache terakhir
  yang ditandai kesegarannya (`stale-if-error`) — bukan layar error kosong.
- **Pemantauan produksi (`PRODUCTION_OBSERVABILITY.md`) dapat jaring terakhir:** `unhandledRejection`/
  `uncaughtException` di Node (catat lalu restart bersih, **bukan** lanjut jalan) dan `error`/
  `unhandledrejection` di browser — tanpa ini satu `kirimEmail()` yang lupa di-`await` gagal tanpa satu
  baris log pun. Plus 🔒 pagar PII di payload Sentry (`sendDefaultPii: false` + `beforeSend`), verifikasi
  source map, dan sub-bab metrik ambang yang selama ini dijanjikan 7 rak tapi isinya nol.

### Diperbaiki

- **`skills/permukaan-ai` kini menyebut pola bahayanya secara spesifik**, bukan "pola khas penyedia
  tertentu" yang memaksa AI menebak sendiri daftarnya. Ditambah kategori yang sebelumnya tak diperiksa:
  hook ber-interpolasi `${...}` (nama berkas buatan penyerang berubah jadi perintah), hook keamanan yang
  dibungkam (`2>/dev/null`, `|| true` — penjaganya kelihatan terpasang tapi selalu meloloskan), MCP
  `autoApprove`/`npx -y`, dan berkas agen berakses tool berlebihan. Disertai catatan terverifikasi:
  hook dijalankan langsung sebagai subprocess, **bukan** tool-call, jadi ia melewati `engine/risk-gate.js` —
  karena itu hook wajib ketahuan lewat pembacaan.
- **Batas jujur dipertegas:** "permukaan AI bersih" TIDAK berarti aplikasinya aman dari peretas.
- **Contoh Server Action di `skills/next-core` melanggar aturannya sendiri.** Blok itu dilabeli
  "memenuhi 🔒 HASIL" padahal melempar error izin telanjang (`throw new Error("Forbidden")`) — persis
  yang `skills/backend` larang, karena error izin yang dilempar tanpa penangkap keluar sebagai **500**
  ("server rusak") padahal maksudnya **403** ("kamu tak berhak"). Kini mengembalikan amplop respons baku.
- **Template yang dipasang ke project kamu tak lagi membocorkan pesan error mentah ke layar.**
  Contoh `error.tsx` di `STACK_GUIDE.md` menampilkan `{error.message}` — isinya bisa memuat pesan SQL,
  path folder, atau nama kolom internal. Kini kalimat awam + kode kejadian (`digest`) yang bisa
  dicocokkan di log. Ditambah `global-error.tsx` beserta jebakannya: `error.tsx` TIDAK menangkap error
  dari `layout` di segment yang sama, dan tanpa `global-error.tsx` root layout yang gagal = layar putih total.
- **Contoh kode coba-ulang di `skills/tahan-gagal` tak bisa dijalankan** — ia memanggil `isRetriable()`
  yang tak pernah didefinisikan di mana pun. Kini predikat "boleh diulang" jadi parameter wajib yang
  disuntik pemanggil, sengaja **tanpa nilai default** (default yang mengulang apa saja ikut mengulang
  `400`/`403` dan bahkan pembatalan normal).
- **Dua rak keamanan tak lagi bertabrakan soal batas login.** `skills/owasp` mematok "5/menit per-IP"
  sebagai baseline, sementara `skills/rate-limiting` mematok 🔒 bahwa kunci per-IP saja rapuh (satu
  kantor berbagi IP; penyerang gampang ganti IP). Disamakan ke per-akun **dan** per-IP, angka mati dibuang.
- **4 rujukan silang yang menunjuk rak salah/alamat tak ada dibetulkan:** *error boundary* diarahkan ke
  `skills/a11y` (yang nol menyebutnya) padahal isinya di `skills/react-patterns` — dan *4 state UI*
  justru sebaliknya; `PRODUCTION_OBSERVABILITY.md` menyandarkan otoritasnya pada aturan `AGENTS.md §3`
  yang **tidak ada** (aturannya sebenarnya di `skills/backend`); serta rujukan ke "audit log §5" di
  berkas yang tak punya pasal bernomor.
- **ErrorBoundary wajib punya jalan keluar** (tombol reset + reset saat route berubah). Boundary tanpa
  reset mengunci user di layar error sampai refresh manual — di SPA, pindah halaman pun tak menyembuhkan.
- **Rujukan satu-arah ditutup:** `skills/background-job` dan `skills/pembayaran` kini menunjuk balik ke
  `skills/tahan-gagal`, dan larangan `.select('*')` di `skills/supabase-prisma` dinaikkan jadi 🔒 supaya
  posturnya sama dengan `skills/backend` (sebelumnya lebih longgar di satu sisi).

### Penjaga baru (internal)

- Daftar pola rahasia di hook pre-commit dan `secret-guard.yml` kini **dikunci harus identik** oleh tes.
  Sebelumnya hanya pengecualian `.lintasai/` yang dijaga, sehingga menambah pola di satu sisi saja lolos
  senyap — dan sejak itu penjaga laptop & penjaga CI menilai dengan daftar berbeda.
- **Probe ANTI-FP routing untuk 3 rak yang pemicunya diperlebar.** Sebelumnya tak ada satu pun assert
  negatif untuk `a11y`/`backend`/`tahan-gagal`, dan `tests/rak-pemicu.test.mjs` **buta** terhadap masalah
  ini: berkas itu menguji tabel SHIM (`deteksiRak`), sedangkan jalur yang benar-benar dipakai client
  adalah `deteksiRakRegistry` (frontmatter). Artinya pemicu kelewat lebar bisa masuk tanpa satu tes pun
  memerah. Jaring dipasang dulu & dibuktikan hijau SEBELUM pemicu disunting.
- **5 assert positif** mengikat keenam kalimat keluhan error natural ke rak yang benar, supaya routing
  ini tak bisa melenceng diam-diam lagi.
- Pesan gagal di 2 tes tak lagi menyuruh menjalankan `npx lintasai skill-registry` — perintah itu sudah
  dicabut di v7.0.0, jadi orang yang tesnya merah akan menjalankan perintah yang tidak ada lalu mengira
  kitnya rusak. Diganti perintah regen yang benar.

---

## [6.0.0] - 2026-07-26

> **[BREAKING] Ringkasan rilis:** kit dirampingkan ke inti pemakaian sesi-natural. **6 skill dicabut**
> + **3 skill baru** (registry 33 → **30**), dan **CLI client dipangkas ke 14 perintah inti** — belasan
> perintah maintainer (preflight, stack-check, ai-config-check, dll) dicabut karena client non-programmer
> tak pernah mengetiknya dan kernel `AGENTS.md` tak menyebut satu pun (≈242 KB perkakas mendarat di tiap
> project tanpa jalan dipicu). Panduan kini hidup di **satu rumah** `.claude-kit/templates/` (tak lagi
> disalin dobel ke `docs/`). **Langkah client existing: cukup `npx lintasai update` seperti biasa** —
> salinan panduan lama di `docs/`-mu dibiarkan (beku, aman dihapus manual); rujukan resmi = templates/.

### Dihapus (BREAKING)

- **6 skill dicabut** — `chrome-extension`, `clickhouse`, `cloudflare`, `galeri-folder`,
  `github-actions`, `go`. Prompt topik ini tak lagi menyalakan rak khusus (aturan umum kernel tetap
  berlaku). Registry 33 → 30.
- **CLI client dipangkas ke 14 perintah inti**: `init` · `update` · `uninstall` · `rollback` ·
  `enable-risk-gate` · `enable-rak-gate` · `rak` · `adapter-sync` · `doctor` · `version` · `status` ·
  `diff` · `check-update` · `setup`. Perintah maintainer (preflight · peta-gen · skill-registry ·
  unicode-check · project-check · perf-budget · stack-check · ai-config-check · env-keys ·
  swallowed-check · complexity-budget · type-escape-check · debug-artifact-check · quality-ledger ·
  plan-scout · bump) DICABUT dari `npx lintasai` — robotnya pindah ke perkakas internal repo kit yang
  tidak dikirim ke client. 🙂 Awam: tombol-tombol teknisi yang tak pernah kamu pakai dikeluarkan dari
  paket, jadi paketmu lebih kecil dan tak ada perintah "hantu" yang bisa menyesatkan AI.

### Ditambah

- **3 skill baru**: `cek-permintaan` (pertajam permintaan ambigu sebelum dikerjakan), `debug-metodis`
  (lacak akar error sistematis, bukan tebak-tebakan), `jaring-data` (pengaman operasi berisiko data).
- **Kernel AGENTS.md — PRASYARAT POSISI**: di awal sesi AI wajib memastikan `.claude-kit/` terjangkau
  dari working dir; kalau tidak → berhenti + beri tahu user membuka sesi dari folder tempat kit terpasang
  (sebelumnya skenario salah-folder gagal senyap tanpa satu pun pesan). Adapter Cursor (`.mdc`) ikut
  ter-regen dari kernel.

### Diubah

- **Panduan satu rumah.** 13 panduan tak lagi disalin ke `docs/` project — semua SKILL.md merujuk
  `templates/...` = `.claude-kit/templates/` yang di-refresh tiap update. Dulu salinan `docs/` membeku
  di versi install pertama (dua salinan dijamin melenceng). Yang tetap disalin ke repo client hanya
  2 workflow GitHub (`backup-schemas.yml`, `secret-guard.yml`) karena memang harus jalan di CI client.
- **Kernel §1.6 dipertegas**: tiap info yang disampaikan AI wajib dijelaskan 3-hal (APA maksudnya —
  bahasa awam · KENAPA · LANGKAH selanjutnya) — bukan lagi sekadar "sebut istilah + gloss".
- **Routing rak kata-natural dipertajam** (mis. sebutan "divisi") + mode `--divisi` di CLI `rak` —
  prompt sehari-hari non-programmer lebih andal menyalakan rak yang tepat, tanpa menambah biaya token.
- **Internal repo kit** (tak mengubah perilaku client): muatan client dipisah ke folder `kit/`,
  perkakas maintainer ke `tools/`, ditambah puluhan penjaga tes baru (paritas distribusi dua-arah,
  larangan impor kit/→tools/, penunjuk pindah-rumah).

### Diperbaiki
- **Skill tak lagi menyuruh perintah CLI yang sudah dicabut v6.0.0** (`ai-config-check` di skill
  permukaan-ai; `stack-check` di owasp/deploy/perbaiki-error; `enable-kimi-hooks` di README) — di project
  client perintah itu tidak ada, jadi AI client mengejar perintah mati. Diganti pemindaian pola manual /
  pemindai stack langsung (`npm audit`/`pip-audit`/`govulncheck`).
- **Update kit yang dipasang di subfolder (monorepo) kini benar-benar me-refresh kernel** — pemasang
  ulang di jalur update membawa `--project-root-mode=folder-sekarang` (update tak pernah memindah lokasi
  install), jadi gerbang akar tidak menyala lagi di tengah update. Plus peringatan eksplisit anti
  kit-ganda saat update dijalankan dari folder yang tidak punya kit.
- **PETA.md netral dua-sisi** — rujukan milik repo kit (`tools/peta-gen.mjs`, `docs/architecture.md`,
  `docs/RESEP_PERUBAHAN.md`) kini berlabel `(repo kit)` supaya AI client tak mengejar berkas yang memang
  tidak dikirim.

## [5.0.0] - 2026-07-25

> **[BREAKING] Ringkasan rilis:** cabut TOTAL 5 topik berikut kaitannya. Untuk client existing: `docs/REFACTOR_STANDARD.md` **tak lagi di-deploy** (salinan lama tetap ada s/d `npx lintasai update` berikutnya — aman dihapus manual). **Tidak ada perubahan perilaku pemasangan** — mesin non-interaktif installer DIPERTAHANKAN (`npm create lintasai` tetap jalan tanpa popup jendela Windows).

### Dihapus — 5 topik dicabut tuntas

- **Fitur "Refactor ringan/sedang/berat" (bertingkat) DICABUT.** `templates/REFACTOR_STANDARD.md` (di-deploy ke client sebagai `docs/REFACTOR_STANDARD.md`) dihapus total + entri deploy (`engine/kit-files.json`, `setup-pola-b.mjs`) + rujukan hidup di robot `complexity-budget`, gerbang `preflight`, template `BUKU_UTANG_TEKNIS`, skill `galeri-folder`, `README`, `docs/complexity-budget.md` di-reword ke frasa generik (label usaha 🟩RINGAN/🟨SEDANG/🟥BERAT tetap ada sebagai skala mandiri di Buku Utang). 🙂 Awam: standar "rapikan kode bertingkat" dilepas; penilaian kapan/seberapa berat rapi-rapi kode kembali ke owner + review.
- **Fitur "Install senyap" (bernama + iklan) DICABUT.** Baris fitur di `README` + teks "Laporan Penutup"/menu-kapabilitas + sisa-mati perintah `scan` di `kit.mjs` dibersihkan. **Mesin non-interaktif installer DIPERTAHANKAN.** 🙂 Awam: nama fitur & iklannya hilang, cara pasang tak berubah.
- **Sisa fitur "scan project → struktur/denah saat install" DICABUT.** Cek non-pemblokir `arch-map` di `preflight` (nag soal `docs/architecture.md` client) + 4 tes turunannya dihapus. Peta-diri kit (`PETA.md`/`peta-gen`) + kartu identitas project (`project-manifest`) TAK tersentuh. 🙂 Awam: kit tak lagi mengingatkan soal peta project client saat pasang.
- **2 entri Buku Pelajaran dihapus:** LP-006 (klaim ANGKA/persentase tanpa perhitungan) + LP-009 (drift daftar-nama & kelengkapan-keluarga) — penjaga keduanya sudah dicabut lebih dulu (ADR-034), tersisa catatan saja.
- **Riwayat ikut discrub:** berkas `ADR-020` (install-senyap) + `ADR-016` (pelajaran-refactor) + `ADR-011` (project-map) dihapus; entri CHANGELOG lama + index ADR + kernel arsip disunting. Jejak keputusan tetap tersimpan di riwayat git.

### Dihapus — 4 berkas mati dicabut + berkas usang di client kini dibersihkan otomatis

> **[BREAKING] Apa yang berubah untukmu:** **dua** berkas di `docs/`-mu tak lagi bagian dari kit — `THREAT_MODEL_NON_LEGAL.md` (dicabut sekarang) dan `REFACTOR_STANDARD.md` (dicabut v5.0.0, dulu harus kamu hapus manual). Keduanya **ikut terhapus otomatis** saat `npx lintasai update` berikutnya — **kecuali** kamu pernah mengeditnya; kalau pernah, berkasnya **dibiarkan** dan kamu diberi tahu supaya bisa memutuskan sendiri. **Kenapa dicabut:** isi THREAT_MODEL sudah tercakup rak `skills/owasp` (18 butir pemeriksaan keamanan konkret) + `docs/PRODUCTION_OBSERVABILITY.md` Pilar 4 (jejak audit), sementara peta ancamannya ditulis untuk profil satu organisasi tertentu (~40 staf tanpa kontrak kerja) sehingga menyesatkan untuk kebanyakan tim; REFACTOR_STANDARD sudah dicabut lebih dulu, kini salinan yatimnya ikut dibereskan. **Langkahmu:** tak ada — cukup jalankan update seperti biasa.

- **`templates/THREAT_MODEL_NON_LEGAL.md` DICABUT** + entri deploy (`engine/kit-files.json`, `teamFiles` di `engine/setup-deploy.mjs`) + penunjuk di `SECURITY_INCIDENT_PLAYBOOK.md` + 3 assert penjaganya. Riwayat CHANGELOG/ADR yang menyebut berkas ini ikut disapu (atas permintaan owner). Seksi `## 7. Threat-model 3-baris` di 30 `SKILL.md` **TIDAK tersentuh** — itu mekanisme lain yang tetap berlaku.
- **3 template yatim DICABUT** (tak pernah di-deploy ke `docs/`, nol pemicu — client tak kehilangan apa pun): `DOMAIN_NEEDS_CHECKLIST.md` (perutanya `workflows/4.2c` + `PROMPT_LIBRARY.md` sudah lama dihapus ADR-034) · `WIZARD_SEO_CHECK_v1.md` (perannya diambil alih `skills/seo` sejak arsitektur rak ADR-027) · `BUKU_UTANG_TEKNIS.example.md` (perutanya `workflows/4.20-utang-teknis.md` ikut dicabut ADR-034).
- **Mesin baru `engine/update-cleanup.mjs`** — pembersih berkas usang saat update, berisi daftar `BERKAS_DICABUT` (kini 2 entri: `THREAT_MODEL_NON_LEGAL.md` + `REFACTOR_STANDARD.md`). 🔒 Pengaman berlapis: hanya menyentuh berkas yang **pemasang kit sendiri yang taruh** (tercatat di catatan-pasang sebagai `team_file`), hanya kalau isinya **masih persis seperti saat dipasang** (dicek ulang sidik-jarinya sedetik sebelum hapus), selalu **dilaporkan di layar**, dan `--dry-run`/`--check-only` = nol perubahan. Dikunci 6 tes (`tests/update-cleanup.test.mjs`). 🙂 Awam: sejak sekarang, tiap kali kit mencabut sebuah berkas panduan, salinan lamamu tak perlu lagi kamu buru sendiri — kecuali sudah kamu isi catatan pribadi, yang itu justru sengaja tidak diganggu.
- **`docs/REFACTOR_STANDARD.md` (yatim sejak v5.0.0) ikut dibereskan.** Catatan rilis v5.0.0 dulu menulis *"salinan lama tetap ada — aman dihapus manual"*, artinya kebersihan diserahkan ke kamu. Kini mesin di atas yang mengurusnya, dengan pengaman yang sama persis.

### Diperbaiki — 3 penunjuk rusak yang bisa bikin AI mengarang

- **`docs/STACK_VERSIONS.md` kini IKUT terpasang.** Dulu `docs/STACK_GUIDE.md` menyuruh *"lihat STACK_VERSIONS.md"* padahal berkasnya tak pernah disalin ke `docs/` — client harus menebak lokasinya. Sekarang ikut di-deploy + penunjuknya diperjelas. Seksi *"Version Compatibility Matrix"* yang basi (masih menyebut lintasAI v1.0.0) dibuang; *"Update Policy"* ditulis ulang untuk project client, bukan untuk versi kit.
- **`skills/kepatuhan-teregulasi` tak lagi menunjuk berkas hantu.** Baris jejak-audit dulu mengarah ke `engine/audit-helpers.mjs` yang **sudah tidak ada** — AI yang menurutinya gagal buka lalu berisiko mengarang isinya (pelanggaran §2.1 "no quote = no claim"). Kini diarahkan ke `templates/PRODUCTION_OBSERVABILITY.md` Pilar 4 yang memang berisi pola + retensinya.
- **`templates/supabase-rls.test.sql` kini terdaftar** di `engine/kit-files.json` → ikut diperiksa `npx lintasai doctor`. Berkas ini dirujuk `skills/supabase-prisma` sebagai template tes pgTAP siap-pakai (penjaga #1 kebocoran data antar-penyewa), tapi selama ini luput dari daftar resmi sehingga kalau hilang tak ada yang tahu.

## [4.0.0] - 2026-07-24

> **[BREAKING] Ringkasan rilis:** perampingan besar pasca-3.1.0 — kit menyusut ke **inti dev web/app**.
> Rak on-demand kini **satu rumah** (`skills/`, registry final **33 skill**). Seluruh apparatus `rules/`
> per-seksi, sistem Rekam Pelajaran (feedback-capture), fitur pecah-repo (repo-split), Peta Aktivitas
> (project-map), audit-project, feature-flag lanjutan, AI-review + CODEOWNERS, apparatus SSOT
> (consistency-check), dan alur aktivasi tempel-prompt (`JALANKAN_KIT.md` + prompt `*_PROMPT_v1.md`)
> **dicabut** berikut robot turunannya (ADR-033 + ADR-034). Pengaman upload **tetap aktif** (di-repoint
> ke skill `owasp`). **Wajib baca "Migration Steps" di bawah sebelum `npx lintasai update`.**

### Dihapus (BREAKING)

- **6 skill dicabut** — `ekspor-laporan`, `email-notifikasi`, `php`, `upload-storage`, `vps`,
  `presentasi`. Registry 38 → 32. Prompt yang menyentuh topik ini tak lagi menyalakan rak khusus.
  **Pengaman upload TIDAK hilang:** pemicu `unggah-berkas` di-repoint ke `skills/owasp/SKILL.md`
  (5 pagar + 4 lanjutan). Deteksi stack PHP/VPS tetap jalan (`project-detect`/`stack-check` tak disentuh).
- **Seluruh apparatus rak `rules/` (ADR-034)** — ~45 berkas dibuang; rak on-demand kini HANYA
  `skills/<nama>/SKILL.md` (1 bidang = 1 berkas). Palang/Petunjuk Rak tetap ada, di-repoint ke `skills/`.
- **Sistem Rekam Pelajaran (ADR-033)** — `feedback-capture`/`aggregate`/`scrub` + hook-nya dicabut;
  kit tak lagi mengumpulkan feedback dari project client.
- **Fitur pecah-repo (repo-split)** — `split-guard` + template `split-agents/` + prompt migrasi split.
- **Peta Aktivitas + project-id** — `project-map` + `project-id` (2 perintah CLI ikut hilang).
- **Audit-project + checklist buat-struktur-project** client (prompt `AUDIT_POST_SETUP`, `POST_SETUP_CHECKLIST`).
- **Feature-flag lanjutan + capability packs** (`feature-flags-advanced`, `cap-packs`).
- **AI-review + `.github/CODEOWNERS`** — template CODEOWNERS bawaan tak lagi dikirim.
- **Apparatus SSOT / consistency-check** + peta sumber-kebenaran internal.
- **Jejak doktrin "8 divisi wajib"**, **ANALOGY_LIBRARY + glossary/analogi**, **ADR migrasi PowerShell**
  (003/004/005/007) — arsip usang dibuang dari distribusi.
- **Alur aktivasi tempel-prompt** — `JALANKAN_KIT.md` + seluruh prompt `*_PROMPT_v1.md` +
  gerbang CI bawaan (`templates/github/workflows/preflight.yml`). Pemicunya sudah putus dari `AGENTS.md`.

### Ditambah

- **CLI rak (`engine/rak-cli.mjs`)** — routing rak dari command line (hemat token dispatch).
- **`PETA.md` §2 per-divisi** — tabel skill dikelompokkan per divisi + hitungan otomatis.
- **Skill `clickhouse` baru** — ClickHouse/OLAP kelas-industri (MergeTree + partisi waktu, batch-insert,
  materialized view, tanpa PII mentah). On-demand (nol biaya token bila tak dipakai). Registry final **33 skill**.
- **`engine/version-bump.mjs`** — tombol bump 1-langkah (cap versi 5 berkas + kerangka CHANGELOG).
- **ADR-033** (bongkar alur aktivasi) + **ADR-034** (cabut apparatus `rules/`) + **`docs/pemasangan-agents-md.md`**.
- **Gerbang proteksi `AGENTS.md` jadi mesin** — dijalankan `setup-pola-b.mjs` + `npm create lintasai`, dikunci tes.

### Diubah

- **~30 `skills/*/SKILL.md` di-reword** — `owasp` menyerap panduan upload-aman kanonis.
- **Repoint rak `rules/` → `skills/`** di rak-gate, rak-pemicu, kit-staging, dispatcher.
- **Manifest & template dipangkas** — `engine/kit-files.json` + `package.json` `files[]` mencabut grup
  `rules/` + prompt usang; `templates/INDEX.md` diselaraskan ke rak tunggal.
- **Installer/dispatcher disederhanakan** — cabut alur SCAN/invokeScan + verifikasi grup `rules`.

### Migration Steps (client — baca sebelum `npx lintasai update`)

1. **6 skill lenyap** (`ekspor-laporan`, `email-notifikasi`, `php`, `upload-storage`, `vps`, `presentasi`).
   Yang butuh panduan upload → sekarang di skill `owasp`. Pengaman upload tetap aktif.
2. **Rak `.claude-kit/rules/` hilang total** saat update — standar detail kini di `skills/`. Kalau pernah
   menyalin isi `rules/` ke luar, backup dulu (pulih via `git show <commit>:rules/...`).
3. **6 perintah CLI hilang**: `project-map`, `project-id`, `enable-preflight-ci`, `enable-feedback-capture`,
   `feedback-scrub`, `feedback-aggregate`. Skrip/otomasi yang memanggilnya harus disesuaikan.
4. **Prompt tempel-sekali hilang** (`JALANKAN_KIT.md`, `PROJECT_LIFECYCLE_PROMPT_v1.md`, dll) — alur
   pasca-install & migrasi split-repo tak ada lagi; kernel `AGENTS.md` menangani pemahaman project native.
5. **CI-gate bawaan + CODEOWNERS** tak lagi dikirim ke repo client — pasang sendiri bila masih diinginkan.

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
> "KENAPA-singkat" tiap langkah AI (ADR-028) · **microkernel ekstrem `CLAUDE_universal_v1.md`** 64rb→31rb char, −48,7%
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
  `.github/staff-roster.yml`, dan 8 berkas tim ter-deploy (`TEAMWORK_GUIDE`, `CLAUDE_TEAM_GUIDE`,
  `TEAM_FLOW_SKETCH`, `ONBOARDING`, `TEAM_ROLLOUT_GUIDE`, template PR,
  `audit-access.yml`, `DISCORD_BOT_INTEGRATION`). **Prinsip kerja
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
  (`SECURITY_INCIDENT_PLAYBOOK`, `secret-guard.yml`, `backup-schemas.yml`).
- **Penjaga BARU (perampingan tak melemahkan pagar):** robot `tool-reach-check` mengenali gagang
  ke-4 `spawn` (perkakas yang dijalankan robot lain sebagai proses anak — kasus nyata
  `migration-state.mjs` dipakai doctor) + 2 entri istilah-pensiun (`fitur-tim-dihapus` +
  `pustaka-install-dihapus`) menolak rujukan fitur terhapus menyelinap balik. Angka fakta
  "file tim" installer: 32/7/25 → **21/2/19** (dijaga robot consistency-check).

**Migration Steps (klien 2.9.0 → 3.0.0):**
1. `npx lintasai@latest update` seperti biasa — isi `.claude-kit/` diganti utuh (backup otomatis
   ber-cap-waktu), struktur `lib/`→`engine/` dibetulkan otomatis.
2. Salinan dokumen tim lama di project-mu (`docs/TEAMWORK_GUIDE.md`, `docs/PROMPT_LIBRARY.md`,
   `docs/MCP_SETUP.md`, `.github/workflows/audit-access.yml`, dll) **TIDAK
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

> **Masalahnya diukur dulu, bukan dikira-kira.** Enam prompt client nyata dijalankan; dari **56 panduan yang relevan, cuma 8 yang benar-benar dibuka (≈14%)** — dan untuk tugas ringan **0%**. Salah satu AI bahkan mengaku (kutipan apa adanya): *"aku diam-diam menafsirkan [standar profesional OTOMATIS] sebagai 'cukup dipikirkan di kepala, tak perlu dibaca berkasnya'"*. Akibat nyatanya terekam: satu AI menuduh **74 alamat API "tidak ada pengecekan hak akses"** — padahal semuanya memakai `withAuth`. Persis jenis kesalahan yang sudah ditulis di `workflows/8.2-3b-jangan-asal-flag.md`, panduan yang tak ia buka. Alasan lengkap = [ADR-022](docs/decisions/ADR-022-petunjuk-rak-dan-palang-rak.md).

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

> **Mandat tak disentuh.** Paket Stack tetap lantai wajib, pengecualian OWASP tetap mutlak. Yang berubah cuma **kapan** resep dibaca dan **lewat mana** berkasnya ditemukan.

- **Dua aturan kit ternyata saling menabrak.** Induk `workflows/4.13-skill-divisi.md:17` berbunyi *"AI **WAJIB** baca + terapkan **Paket Stack §4.14** — **otomatis**"* tanpa syarat; anak `workflows/4.14-stack-packs.md:10` justru berbunyi *"tarik saat dibutuhkan, **bukan borongan di muka** … tugas sepele tak perlu paket"*. AI membaca yang induk lebih dulu. Akibat terukur pada skenario *"ada bug, tombol simpan error"*: **36.245 char** paket stack tertarik = **41% dari seluruh bacaan**, sementara berkas yang benar-benar menjawab cuma **1.380 char (1,5%)**. Diselaraskan ke berkas anak — yang bukan cuma menyatakan perilaku benar, tapi juga **alasannya**, dan alasannya soal **mutu**: resep yang dijejalkan sebelum AI melihat kode NYATA membuat AI mengikuti resep alih-alih pola project yang sudah benar (§4.17).
- **Jalan pintas 3 keluarga rute** (`div/`, `pola/`, `stack/`) ditulis di berkas aturan — melengkapi capability pack yang sudah dapat jalan pintas sebelumnya. Dulu **asimetris**: `workflows/cap/` disebut 3× di berkas aturan, tiga keluarga lain **nol**, jadi wajib lewat hub. Biaya navigasinya terukur: untuk mendapat checklist keamanan **1.011 char**, AI membuka hub **6.033 char** — **86% bacaan terbuang**. Ironisnya hub itu menjual dirinya *"hemat token: baca 1 divisi, bukan 8 sekaligus"*, padahal 8 berkas divisi digabung cuma 14.037 char — **hub-nya sendiri 43% dari yang katanya dihemat**. Hub tetap ada & tetap dipakai untuk mekanika/topologi. **+537 char** ke berkas always-load (anggaran ≤550).
- **Penjaga baru `wajib-borongan`** (pemeriksaan ke-13 di `lib/workflows-ref-check.mjs`, PENTING, ikut `preflight`): perintah "WAJIB/otomatis" atas `§id` yang menyeret >15.000 char wajib menyertakan klausa pas-ukuran. Bobot dihitung **beserta seluruh turunan `§id-*`** — jadi "§4.14" terbaca jujur sebagai **114.719 char**, bukan 4.585 char hub-nya saja.
- **Celah drift yang ditemukan saat memasang penjaganya:** jalan pintas di berkas aturan berbentuk **pola** (`4.13-<backend|frontend|…>.md`), dan bentuk itu **tidak tertangkap** pemeriksa FORWARD (regex path berhenti di karakter `<`). Artinya jalan pintas capability pack yang dipasang sebelumnya **tak pernah dijaga kelengkapannya**. `tests/roster-sync.test.mjs` kini memeriksa berkas aturan sebagai tempat ke-4 (setelah folder, hub, INDEX) + mendaftarkan keluarga `stack` yang dulu tak terdaftar sama sekali. Penjaga ini **langsung membuktikan diri**: ia menemukan `4.14-galeri-folder.md` yang terlewat dari jalan pintas stack yang baru saja ditulis.
- **`PROFIL_TIM.local.md:115`** disetel ke aturan aslinya — dulu menulis "§4.19 **WAJIB dibaca saat Plan mode aktif**", menghilangkan nuansa berkas aturan sendiri (*"Mandat ini cukup untuk rencana rutin"*).
- **Pelajaran proses yang mahal (dicatat apa adanya):** percobaan pertama penjaga `wajib-borongan` menghasilkan **33 temuan, mayoritas alarm-palsu** — ia mencampur *pernyataan mandat* (mis. "Paket Stack §4.14 wajib") dengan *perintah memuat*. Contoh paling telak: §10 tertangkap gara-gara frasa "**dibaca**-cepat vs dibaca-lambat" yang bicara soal kecepatan HALAMAN. Diperbaiki lewat syarat kedekatan (kata-muat ≤45 char dari `§id`) → 2 temuan, keduanya nyata. Lalu ketahuan cacat kedua: dedupe `§id` dilakukan **sebelum** menilai, sehingga kemunculan pertama yang tak bersalah membungkam yang kedua — dan bug NYATA-nya sempat lolos. Dan penjaga jalan pintas versi pertama **gagal uji-negatif** (memakai `includes()` polos; menghapus `keamanan` tetap hijau sebab kata itu muncul puluhan kali di tempat lain).
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

> **Nol perubahan perilaku untuk client yang sudah jalan.** Yang berubah: satu kemampuan yang selama ini terkirim-tapi-mati jadi bisa dipakai, dan tiga kelas bug berpindah dari ingatan ke mesin (doktrin §6.4). Alasan panen ini ada: dua putaran refactor sebelumnya menemukan 4 bug lolos tapi mencatat **nol** entri Buku Pelajaran — kebalikan doktrinnya sendiri.

- **Penjaga baru: perkakas terkirim WAJIB punya "gagang"** (`lib/tool-reach-check.mjs`, ikut `preflight`, tingkat PENTING). `lib/fact-gate.mjs` dikirim ke SETIAP client tapi mati total — nol perintah CLI, nol dipanggil, nol disebut aturan. Putaran lalu yang diperbaiki cuma **korbannya**; penjaga ini menutup **kelasnya**, dan saat pertama dijalankan langsung menemukan dua korban lain yang masih hidup: **`lib/split-guard.mjs`** dan **`lib/portfolio-write.mjs`** — keduanya cuma bisa dipanggil kalau AI kebetulan ingat membaca baris perintah di dalam sebuah dokumen. Aturannya: tiap `lib/**.mjs` yang dikirim + berdiri sendiri wajib punya ≥1 jalur pemanggil (perintah CLI / langkah preflight / hook), diverifikasi **dari kenyataan** — sengaja tanpa daftar-kecuali tulis-tangan yang pasti membusuk jadi stempel karet. Buku Pelajaran LP-012.
- **2 perintah baru — kemampuan yang sudah ada, akhirnya bisa dipanggil:** `npx lintasai split-guard` (periksa repo hasil pecah-repo: rahasia ikut terbawa / tier akses bentrok / berkas nyasar) dan `npx lintasai portfolio-write` (tulis Buku Induk akses tanpa menyentuh YAML). Robotnya sudah lengkap & teruji sejak lama — yang hilang cuma gagangnya.
- **Penjaga baru: aturan dilarang menabrak aturan** (pemeriksaan ke-11 `baca-utuh` di `lib/workflows-ref-check.mjs`, PENTING). Dokumen kit tak boleh memerintahkan "baca/internalisasi seluruhnya" atas berkas yang §6 tandai Grep-dulu — kelas bug yang dulu menelan **48.120 char (~12rb token) tiap sesi**. Pengecualian sah §6 (`JALANKAN_KIT.md` Bagian 1-2 saat Fase Aktivasi §4.3b) dibebaskan supaya robot tak memerahkan aturan yang benar. Buku Pelajaran LP-013.
- **Alat baru: `npx lintasai locked-phrases`** — cetak frasa harfiah di berkas aturan yang DIKUNCI tes, dibaca **sebelum** memadatkan aturan (§4.18). Lahir dari kejadian nyata: sebuah frasa pagar yang dikunci tes (§4.9) ikut terpangkas saat compaction dan baru ketahuan lewat tes merah. **Bukan pemeriksa** (tak memblokir, tak ikut preflight) dan **heuristik** — daftar kosong ≠ aman; peringatan itu ikut tercetak di keluarannya sendiri, bukan cuma di dokumen. Client bisa memakainya atas berkas mereka: `--file AGENTS.md`.
- **Buku Pelajaran LP-011** — rujukan & anchor ke rak `templates/` (penjaga `tmpl-*` sudah dipasang putaran lalu, pelajarannya baru dicatat sekarang). Inti pelajarannya: anchor `§keamanan` **bukan** nol hasil — ia mendarat di judul yang SALAH (`STACK_GUIDE.md:666` alih-alih `:567`), jadi AI membaca bab keliru lalu percaya diri. Cocok-yang-salah lebih berbahaya daripada tidak cocok sama sekali.
- **Resep 12 di `docs/RESEP_PERUBAHAN.md` (v5)** — checklist "tambah/ubah/hapus robot penjaga di `lib/`": gagang → kirim → sebut di aturan → tes dua sisi (benar-benar merah pada kasus rusak, DAN tak beralarm-palsu pada kasus sah). Ditegakkan mesin oleh `tool-reach-check`, bukan sekadar imbauan. Plus langkah 0 `locked-phrases` di Resep 2 + alur compaction `workflows/4.18-compaction.md`.
- **Padanan client (biar app yang dibangun client ikut aman):** 2 kode taksonomi baru di `templates/feedback/taksonomi.kit.jsonc` (`taksonomi_versi` 1→2) — **`OPS-DEAD-SHIPPED`** (kode/endpoint ter-deploy tanpa jalur pemanggil = kode mati yang menyamar jadi pengaman) dan **`DOC-POINTER-ROT`** (pointer mendarat di tempat salah).
- **Pelajaran proses yang ikut tercatat:** versi pertama `tool-reach-check` memakai `isMain` sebagai satu-satunya penanda perkakas → **17 alarm-palsu dari 18 temuan** (banyak PUSTAKA punya `isMain` berisi "CLI tipis untuk uji-banding"). Penjaga yang beralarm-palsu lebih buruk daripada tak ada penjaga — orang belajar mengabaikannya. Diperbaiki jadi pembeda "apakah ada modul lain yang meng-import berkas ini", dengan `tests/` sengaja tak dihitung sebagai pemakai.
- **Berkas:** BARU `lib/tool-reach-check.mjs`, `lib/locked-phrase-list.mjs`, `tests/tool-reach-check.test.mjs`, `tests/locked-phrase-list.test.mjs`; diubah `lib/workflows-ref-check.mjs` (pemeriksaan ke-11), `bin/lintasai.js` (3 perintah), `tests/preflight.mjs` (langkah `checkToolReach`), `lib/kit-files.json`, `docs/RESEP_PERUBAHAN.md` (v5), `workflows/4.18-compaction.md`, `templates/feedback/taksonomi.kit.jsonc` (v2), `docs/BUKU_PELAJARAN.md` (LP-011/012/013). Tes: 1353 → 1382 lulus.

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
- **Dipindah ke rak yang SUDAH ADA + terdaftar `workflows/INDEX.md`, menyisakan stub bernomor di tempat:** §4.3 · §4.4 · §4.5 · §4.9 · §4.10 · §7.6 · §7.7 · §7.10 · §7.11. Nomor seksi TIDAK dinomori ulang (`docs/RESEP_PERUBAHAN.md:194`) sehingga rujukan lintas-berkas dan ingatan AI di client lama tetap menemukan alamatnya. Mandat yang WAJIB tinggal: §4.5 "`@latest` WAJIB" (jebakan cache npx) · §7.7 6 kategori file CRITICAL (pemicunya penilaian AI, bukan frasa user — tak kasat mata = rute tak pernah terpicu).
- **Yang sengaja TIDAK dipangkas** (diputuskan sadar, jangan diulang analisisnya): §5/§9/§10/§11 (tingkat BERAT — dikecualikan owner) · memecah berkas aturan pakai `@import` (**`@import` dimuat penuh di awal sesi = NOL hemat**; lebih buruk, `lib/kimi-agents-gen.mjs` menyalin SATU berkas dengan janji "IDENTIK, tak ada yang dipangkas" → pengguna Kimi kehilangan aturan diam-diam) · mengganti nama `CLAUDE_universal_v1.md` (terdaftar `KIT_CORE_ENTRIES` fail-closed → membatalkan update di SEMUA client) · migrasi ke Skill native (ADR-017 masih berlaku) · throttle `lib/lang-reminder.mjs` (ditolak owner, ADR-019).

### Ditambah — §4.17 "Perkuat, Jangan Kurung" punya rumah isi (kebutuhan: otak AI native menang saat kit salah)

- **`workflows/4.17-perkuat-jangan-kurung.md`** (baru): doktrin 3 lapis (🧠 otak AI native menalar · 🧰 kit membekali · 🤖 robot memastikan fakta) + **4 keadaan di mana kit KALAH dari kenyataan** + **cara menyimpang yang benar** (sebut aturan mana · kenapa tak cocok di sini dengan bukti `berkas:baris` · apa gantinya) + **BATAS KERAS 7 pagar** yang klausa ini TIDAK bisa dipakai melewatinya (§8, §8.1, §8.2, §4.6, §2.1, §4.13, §7.3a — disebut satu per satu, bukan "pagar Tingkat-1" yang kabur) + klausa **"dokumen kit ≠ bukti"**.
- Di berkas aturan, §4.17 **tetap 1 baris** (+~60 char) — yang berubah cuma cakupannya: dari "perlengkapan kit (stack-pack, capability pack)" jadi "SELURUH isi kit Tingkat-2 — aturan, resep pack, checklist, peta/dokumen". Ini **melaksanakan** keputusan ADR-009 ("di aturan always-load cukup 1 baris pointer di §4.17"), bukan membalikkannya.
- **Koreksi premis:** klaim "berkas aturan punya nol klausa-keluar" tidak benar — sudah ada minimal 6 dengan diksi berbeda (§4.17 "bisa dilewati", §4.17 "otak Claude = sopir", §1.1 "ada jalan lebih baik → katakan terus terang", §7.3a "beda dokumen vs kode → percaya kode", §12 "pemeriksa salah? → lapor + minta keputusan owner", §6.1 "konflik memory vs realita → percaya realita"). Yang kurang bukan klausanya, tapi **rumah isi + cakupannya**.

### Diubah — perlengkapan ditarik saat dibutuhkan, bukan borongan di muka

- **`workflows/4.14-stack-packs.md`:** ditambah klausa pas-ukuran (padanan yang sudah lama ada di `workflows/cap-packs.md:15`) + `4.14-1b-frontend-lanjutan.md` (17.818 char) kini ditarik **saat benar-benar menggarap komponen/animasi**, tidak lagi otomatis bersamaan dengan `4.14-1-nextjs.md` (18.451 char). Alasan mutu, bukan cuma token: makin banyak resep dijejalkan sebelum AI melihat kode NYATA client, makin besar peluang AI mengikuti resep alih-alih pola yang sudah benar di project itu. ⚠️ **Pengecualian ditulis eksplisit:** `stack/4.14-5-owasp.md` tetap ditarik SEBELUM kontrak auth/pembayaran ditulis (§4.17 titik risiko + §4.16 kontrak duluan).
- **`workflows/4.2c-aplikasi-utuh.md`:** langkah 6 baru — sesi pertama WAJIB menutup dengan menulis `docs/plans/<aplikasi>.md` pakai format ringkasan-mandiri 5-hal (`workflows/4.16-build-sequence.md`), dan **sesi lanjutan cukup membaca rencana itu + berkas kode target** tanpa mengulang rute pembuka. Aplikasi utuh realistis = 4-5 sesi; tiap sesi yang tak mengulang rute pembuka menambah hemat di atas angka always-load.

### Ditambah — serap Ponytail (MIT): robot "Anggaran Kerumitan" + Buku Utang Teknis

- **Robot "Anggaran Kerumitan"** (`npx lintasai complexity-budget`): menandai otomatis **berkas gemuk** (≥500 baris) + **fungsi/blok panjang** (≥100 baris badan) = sarang bug + boros token saat AI membacanya, TANPA kamu perlu baca kode. Deterministik, CUMA-BACA, ~0 token AI. **File auto-generate (Prisma, Supabase `database.types.ts`, `*.d.ts`) otomatis dibuang** supaya tak jadi alarm-palsu — uji lapangan: di satu project client 40 file Prisma auto-generate = ~85% derau bila tak dibuang. Level **RAPIKAN — tak pernah memblokir** gerbang (bahkan `--strict`); di repo kit sendiri turun ke INFO supaya tak menyandera Gerbang 0/0/0. Ikut otomatis di `npx lintasai preflight`. Mengisi lubang nyata: ESLint `max-lines`/`max-lines-per-function` MATI-default → mayoritas project tak punya penjaga ukuran. Adaptasi ide Ponytail (MIT © 2026 DietrichGebert). (`lib/complexity-budget.mjs`, `docs/complexity-budget.md`)
- **Buku Utang Teknis** (`templates/BUKU_UTANG_TEKNIS.example.md` + `workflows/4.20-utang-teknis.md`): rumah on-demand untuk refactor/temuan yang **sengaja ditunda** biar tak busuk diam-diam (beda dari Buku Pelajaran §6.4 = bug yang *lolos*). Owner-gated (AI usul → owner setuju), label 2-sumbu (keseriusan × usaha, **bukan skor-angka** §8.2-3b), gate mulai kerja BERAT (sepakati owner + tes pelindung dulu). Adaptasi ide Ponytail `/debt` (MIT).

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
- **`lib/lang-reminder.mjs` (hook paling boros token, ~220-321 token/giliran) SENGAJA TIDAK diubah** — dipertimbangkan (throttle agresif/konservatif), ditolak owner karena isi reminder ditandai "TIAP prompt" Tingkat-1. Keputusan dicatat di `docs/decisions/ADR-019-*.md` supaya tak dianalisis ulang dari nol.
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

## [2.9.1] - 2026-07-18

### Diperbaiki — celah taksonomi Tingkat 1 (§4.6 + §7.3a) + pemadatan token berkas aturan

- **§4.6 (Gerbang Verifikasi Pra-Rilis) dan §7.3a (baca-kode-sebelum-edit) kini resmi tercatat TINGKAT 1** di daftar Dua Tingkat Aturan (`CLAUDE_universal_v1.md`). Sebelumnya kedua aturan ini sudah BERPERILAKU wajib-tanpa-kecuali (§7.3a bahkan dijaga mesin lewat Read-before-Edit) tapi taksonomi resmi menandainya sebagai bagian "checklist §4 / dokumentasi §7" yang boleh ditawar Tingkat 2 — celah tafsir yang berisiko disalahartikan sebagai "boleh dimatikan per project". Ditutup tanpa mengubah isi/perilaku aturan itu sendiri, cuma menegaskan statusnya.
- **Pemadatan §4.7, §7.3a, §2.1.1 Kategori#4**: menghapus restatement yang sebelumnya mengulang >70% isi rak on-demand (`workflows/4.7-alur-berpemandu.md`, `workflows/7.3a-modifikasi-baca-kode.md`) atau seksi lain (§4.1) — nol informasi hilang (detail lengkap tetap ada di rak, cuma dibaca saat dipicu), hemat ~630 karakter (~157 token) dari berkas aturan yang di-load penuh tiap sesi kerja.

## Riwayat lama (v2.9.0 ke bawah)

Entri rilis lama yang **tak berlabel** dipindah ke arsip repo kit: `docs/CHANGELOG-ARSIP.md` (tidak
ikut terkirim ke client). Yang TETAP di bawah ini = entri lama yang membawa label
`[SECURITY]`/`[BREAKING]`/`[SCAN-REQUIRED]`.

> 🚨 **JANGAN pangkas entri di bawah ini.** Pemindai rentang `npx lintasai update` membacanya untuk
> menampilkan banner *pasang SEGERA* ke client yang lompat banyak versi sekaligus. Kalau entri berlabel
> hilang, client lompat-versi kehilangan peringatan keamanan **tanpa satu pun pesan error**.
> Dijaga `tests/changelog-labels.test.mjs`.

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
