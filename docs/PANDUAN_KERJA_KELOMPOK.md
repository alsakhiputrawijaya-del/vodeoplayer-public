# Panduan Kerja Kelompok — Playly Dashboard (5–10 orang)

> v1 · 2026-07-03 · Wajib dibaca SEMUA anggota tim sebelum mulai kerja.
> Bahasa sengaja sederhana — untuk programmer junior maupun yang belum terbiasa Git.

---

## 0. Peta singkat (kenapa aturan ini ada)

- Branch **`main`** = **versi LIVE**. Tiap gabungan ke `main` otomatis tayang ke
  playly-dashboard.vercel.app (dilihat user asli). Salah gabung = situs live rusak.
- File **`public/legacy/script.js`** itu SATU file raksasa (~60 ribu baris) yang
  dipakai semua halaman. Kalau 2 orang mengedit area yang sama tanpa koordinasi →
  **konflik** (tabrakan saat gabung 2 versi kode — mirip 2 orang mengedit 1 dokumen
  Word offline lalu bingung gabungnya).
- `main` sudah **dipagari otomatis** (lihat Bagian 5) — tidak bisa ditulis langsung.

🏢 Analogi keseluruhan: `main` = **etalase toko**. Kerjamu dilakukan di **ruang
belakang** (branch sendiri), dicek petugas (robot CI + teman), baru dipajang.

---

## 1. TIGA ATURAN EMAS (hafalkan ini saja kalau cuma ingat 3 hal)

### Aturan 1 — **1 tugas = 1 branch** (jangan campur)
Setiap tugas dikerjakan di branch sendiri. Format nama: `nama/tugas-singkat`.

```bash
git checkout main
git pull origin main                 # ambil versi terbaru dulu (WAJIB)
git checkout -b dedi/perbaiki-topbar # branch baru milikmu
```

### Aturan 2 — **Tiap MULAI kerja (tiap hari): tarik dulu versi terbaru `main`**
Sebelum menulis kode apa pun hari itu:

```bash
git checkout main
git pull origin main       # ambil pekerjaan teman yang sudah masuk
git checkout dedi/perbaiki-topbar
git merge main             # bawa update itu ke branch-mu
```

Kenapa: makin lama branch-mu tertinggal dari `main`, makin besar tabrakannya
nanti. Tarik tiap hari = tabrakan kecil-kecil yang gampang; tarik seminggu
sekali = tabrakan raksasa yang bikin pusing.

### Aturan 3 — **Jangan pernah kerja langsung di `main`**
Pagar otomatis akan menolak (push ke `main` ditolak GitHub). Semua perubahan
masuk lewat **Pull Request (PR)** — "permintaan gabung" yang dicek dulu.

---

## 2. Alur kerja harian lengkap (8 langkah)

1. **Tarik `main` terbaru** + bawa ke branch-mu (Aturan 2 di atas).
2. **Kerjakan KECIL** — target selesai & digabung dalam **1–2 hari**, bukan 2 minggu.
3. **Commit** (= simpan catatan perubahan ke riwayat kerja) **dengan pesan jelas**
   (bahasa Indonesia, format `jenis: hasil`):
   ```bash
   git add -A
   git commit -m "fix: tombol topbar tidak kepotong di layar HP"
   ```
4. **Push** (= unggah kerjaanmu ke GitHub): `git push -u origin dedi/perbaiki-topbar`
5. **Buka PR** di GitHub (tombol muncul otomatis) → isi template yang tersedia.
6. **Tunggu 2 lampu hijau**: robot **`ci`** (cek otomatis sintaks — struktur
   penulisan kode, salah 1 kurung saja bisa mematikan halaman — + tipe data) dan
   robot **Penjaga Kebocoran Rahasia**. Merah? Baca pesannya, perbaiki, push lagi.
7. **Minta 1 teman me-review** (baca + setujui). Kalau PR menyentuh area sensitif
   (API/database/config), GitHub otomatis minta persetujuan owner juga.
8. **Gabungkan** — klik tombol **"Squash and merge"** (= gabung-ringkas: berapa pun
   commit coretanmu di branch, yang tercatat di `main` cuma 1 catatan rapi per tugas;
   branch-mu otomatis terhapus setelahnya) → buka situs live → **cek cepat** halaman yang kamu ubah
   + coba login. Rusak? → lihat Bagian 6 (balikkan < 5 menit).

---

## 3. Aturan khusus `script.js` raksasa (SUMBER KONFLIK #1)

1. **Bagi wilayah**: 1 halaman/fitur = 1 orang. Dua orang DILARANG mengedit
   area yang sama berbarengan — umumkan di grup chat: *"aku pegang topbar minggu ini"*.
2. **PR kecil & cepat digabung** — makin lama PR menggantung, makin basi.
3. **Merge antre SATU-SATU**: setelah teman menggabung PR-nya, GitHub akan minta
   branch-mu di-update dulu → klik tombol **"Update branch"** di halaman PR
   (itu bentuk otomatis dari "pull dari main") → tunggu robot hijau lagi → baru gabung.
4. **Jangan format-ulang massal** (rapikan indentasi ribuan baris dll) — itu membuat
   SEMUA PR teman tabrakan dengan punyamu. Kalau perlu rapikan besar, minta owner
   jadwalkan saat tidak ada PR menggantung.
5. **Jangan pernah edit/commit `public/legacy/script.min.js`** — file itu dibuat
   otomatis saat build. Robot `ci` menolak kalau ter-commit.
6. Hati-hati file **`app/_legacy/index-markup.ts`** — 1 baris super panjang, rapuh.
   Koordinasikan dulu di grup sebelum menyentuhnya.

---

## 4. Kalau terjadi KONFLIK (tabrakan) — jangan panik

Konflik = Git bingung menggabung 2 perubahan di baris berdekatan. Langkahnya:

1. Jalankan satu per satu (jangan digabung 1 baris — di PowerShell Windows tanda
   `&&` bikin error):
   ```bash
   git checkout main
   git pull origin main
   git checkout branch-mu
   git merge main
   ```
2. Buka file yang ditandai konflik — cari penanda `<<<<<<<`, `=======`, `>>>>>>>`.
   Bagian atas = versimu, bagian bawah = versi `main`. **Pilih/gabungkan yang benar,
   hapus semua penandanya.**
3. Cek hasilnya: `node --check public/legacy/script.js` (harus tanpa error).
4. Simpan lalu unggah:
   ```bash
   git add -A
   git commit --no-edit
   git push
   ```
5. **Ragu sedikit saja → BERHENTI, jangan menebak.** Tanya di grup / owner / AI.
   Salah pilih saat konflik = menghapus pekerjaan teman tanpa sadar.

---

## 5. Pagar otomatis yang terpasang (kamu tidak perlu mengaktifkan apa pun)

| Pagar | Artinya untukmu |
|---|---|
| Tulis langsung ke `main` DITOLAK | Semua lewat PR, tanpa kecuali |
| Robot `ci` wajib HIJAU | Sintaks `script.js` + tipe TypeScript dicek tiap PR |
| Branch wajib **up-to-date** dgn `main` | Tombol "Update branch" = pull-dari-main versi 1 klik |
| Minimal **1 persetujuan** teman | Ada mata kedua sebelum kode tayang |
| Area sensitif → persetujuan **owner** | API/database/config/CI dijaga khusus (CODEOWNERS) |
| Force-push & hapus `main` DIBLOKIR | Riwayat kerja tim tak bisa ditimpa paksa |
| Penjaga Kebocoran Rahasia | File `.env`/kunci asli ter-commit → CI merah |

Catatan: **owner (admin repo) dikecualikan** dari pagar — untuk perbaikan darurat.
Anggota tim semua terikat pagar.

---

## 6. Kalau versi LIVE rusak setelah merge (balikkan < 5 menit)

1. Buka PR yang barusan digabung di GitHub → klik tombol **"Revert"** →
   GitHub membuat PR pembalik otomatis → gabungkan.
2. Vercel otomatis memasang ulang versi sebelumnya. Selesai.
3. Perbaiki masalahnya dengan tenang di branch baru — JANGAN buru-buru menambal
   langsung di live.

---

## 7. Pembagian wilayah tim (owner: isi tabel ini)

| Nama | Username GitHub | Wilayah (halaman/fitur) |
|---|---|---|
| _contoh: Dedi_ | _@kangdedi_ | _Topbar + halaman Beranda user_ |
| | | |

## 8. Menambah anggota baru (untuk owner)

1. GitHub → repo → **Settings → Collaborators → Add people** → role **Write**
   (JANGAN Admin — Admin bisa melewati pagar).
2. Minta anggota baca dokumen ini sampai selesai sebelum PR pertama.
3. Tambahkan namanya ke tabel wilayah (Bagian 7).
