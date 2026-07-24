---
nama: presentasi
deskripsi: Bikin deck presentasi HTML/CSS nol-dependensi — tiap slide muat pas 1 layar (tanpa scroll), navigasi keyboard/sentuh, tipografi clamp, 12 preset gaya siap-pilih.
divisi: frontend
pemicu: [presentasi, slide, slides, deck, pitch-deck, powerpoint, keynote, reveal, paparan]
rawan_keamanan: false
menggantikan: []
---

# Skill: Presentasi — deck HTML/CSS yang muat pas 1 layar

> **Kapan skill ini aktif:** prompt minta bikin/ubah "presentasi / slide / deck / pitch-deck / paparan", atau mengubah PowerPoint jadi HTML. Dispatcher `rak-pemicu` menyalakannya otomatis.
>
> 🙂 **Analogi:** slide yang baik = **1 halaman = 1 layar penuh, tak perlu digulung**. Kalau isi kebanyakan, PECAH jadi 2 slide — jangan dikecilkan sampai tak terbaca. Mirip poster: satu pesan besar per lembar, bukan koran penuh teks kecil.

Skill ini **advisory** (§4.17): otak native memutuskan gaya/isi. Butir **🔒 HASIL** = jaminan yang tak boleh gagal (di sini: tiap slide muat pas 1 layar tanpa scroll). Preset & pustaka font = 💡 SARAN (boleh diganti). Cek versi alat terpasang (§8.2 A3) sebelum menyalin.

---

## 1. Kontrak (yang HARUS benar — tulis DULU)

- 🔒 **HASIL — Tiap slide muat PAS 1 layar (viewport-fit = gerbang keras, TAK BOLEH scroll di dalam slide).** Tiap `.slide` WAJIB `height: 100vh; height: 100dvh; overflow: hidden;`. Kalau isi melebihi ruang → **PECAH jadi slide berikutnya**, JANGAN kecilkan teks sampai tak terbaca. Batas kepadatan: **4-6 poin/slide, 8-10 baris kode/slide**. Verifikasi di 5 ukuran: 1920×1080, 1280×720, 768×1024, 375×667, 667×375.
- 🔒 **HASIL — Bisa dioperasikan keyboard + konten user di-escape.** Navigasi WAJIB jalan via keyboard (panah/spasi) — bukan cuma klik/swipe (aksesibilitas, `skills/a11y/SKILL.md`). Kalau slide menampilkan teks dari user/data, tetap **di-escape** (anti-XSS, `skills/owasp/SKILL.md`).

---

## 2. Cara rakit (📐 CARA BAKU — boleh diganti cara lain yang capai HASIL sama)

1. 📐 **Nol-dependensi, browser-native.** Utamakan HTML+CSS+sedikit JS murni — tanpa framework berat kalau tak perlu (YAGNI). Tiga mode kerja: bikin baru · konversi dari PowerPoint · perkaya deck yang sudah ada.
2. 📐 **Base CSS wajib:** tiap `.slide` = `height: 100vh; height: 100dvh; overflow: hidden;` + `display: flex` (pusatkan isi). Tipografi & jarak pakai `clamp(min, preferensi, max)` biar skala mulus lintas ukuran — sisipkan komponen `rem` di nilai tengah (jangan `vw` murni) supaya teks tetap bisa diperbesar (WCAG 1.4.4, `skills/a11y/SKILL.md`). Breakpoint penyesuaian di ~700px / 600px / 500px.
3. 📐 **Navigasi lengkap:** keyboard (← → / spasi / Home-End) + sentuh/swipe + roda mouse (wheel) + **indikator progres / nomor slide**. Keyboard = WAJIB (🔒 §1); swipe & wheel = pelengkap.
4. 📐 **Animasi masuk hemat:** pakai `IntersectionObserver` untuk reveal-saat-masuk (fade/geser); hanya animasikan `transform`/`opacity` (anti-CLS, `skills/react-patterns/SKILL.md`); hormati `prefers-reduced-motion`.
5. 💡 **SARAN — Alur visual dulu, bukan kuesioner:** tawarkan pratinjau gaya (§3) lebih dulu, baru bangun penuh — staff memilih dari yang terlihat, bukan menjawab pertanyaan abstrak.

---

## 3. Powerful — 12 preset gaya siap-pilih (🧪 CONTOH — ambil arah, sesuaikan)

Pilih SATU preset sesuai nada & audiens (selaras heuristik cocok-domain `skills/design-direction/SKILL.md`):

| Preset | Nada | Cocok untuk | Ciri khas |
|---|---|---|---|
| **Bold Signal** | percaya-diri, berdampak | pitch/launch | nomor seksi raksasa, kartu fokus oranye |
| **Electric Studio** | bersih, agensi | presentasi klien | split dua-panel, rata editorial tajam |
| **Creative Voltage** | enerjik, retro-modern | studio kreatif | tekstur halftone, badge, aksen neon |
| **Dark Botanical** | elegan, premium | brand mewah | lingkaran blur, palet emas/terakota |
| **Notebook Tabs** | editorial, taktil | laporan/review | lembar kertas, tab samping berwarna |
| **Pastel Geometry** | ramah, hangat | ringkasan produk | pil vertikal, kartu membulat, bayang lembut |
| **Split Pastel** | main-main, kreatif | intro agensi | split peach+lavender, badge mint |
| **Vintage Editorial** | jenaka, berkarakter | brand personal | aksen geometris, callout berbingkai |
| **Neon Cyber** | futuristik, teknis | talk AI/infra | glow, partikel, grid, cyan/magenta |
| **Terminal Green** | fokus-developer | API/CLI | scan-line, bingkai baris-perintah |
| **Swiss Modern** | minimal, presisi | korporat/analitik | grid terlihat, disiplin geometris |
| **Paper & Ink** | literer, reflektif | esai/narasi | pull-quote, drop-cap, garis elegan |

> Font contoh (mis. Archivo/Manrope/Fraunces) = 💡 SARAN — cek lisensi + host font sendiri kalau perlu; jangan tarik dari CDN eksternal bila deck harus jalan offline.

---

## 4. Ekspor PDF (⏳ BELUM TERUJI di kit ini — tandai jujur, jangan klaim "beres")

- ⏳ **CARA BAKU (butuh alat luar):** render deck HTML → PDF pakai **Playwright** (browser otomatis) dari skrip **Python/Node**, ukuran halaman dikunci 1920×1080 landscape, 1 slide = 1 halaman. Verifikasi otomatis (cek tak ada overflow + navigasi jalan) bila Playwright tersedia.
- 🚨 **Batas jujur (§8.2 A4):** jalur ekspor-PDF ini **memerlukan Python + Playwright terpasang** dan **belum diuji di lingkungan kit ini** — JANGAN klaim "PDF siap" sebelum benar-benar dijalankan + berkasnya dilihat. Kalau alat tak ada → sampaikan sebagai langkah manual (buka di browser → Print → Save as PDF) + tandai ⏳.

---

## 5. Self-verify (sangkal diri sendiri SEBELUM bilang "selesai" — §8.2 Aturan 3)

- [ ] Tiap slide `overflow: hidden` + `100dvh` — **tak ada scrollbar dalam slide** di kelima ukuran uji (1920×1080 s/d 375×667)?
- [ ] Isi padat (≤6 poin, ≤10 baris kode) — yang berlebih DIPECAH jadi slide baru, bukan dikecilkan?
- [ ] Navigasi **keyboard** jalan (panah/spasi) + indikator progres/nomor slide ada?
- [ ] Tipografi `clamp()` punya `rem` di nilai tengah (teks bisa diperbesar — WCAG 1.4.4)?
- [ ] Animasi hanya `transform`/`opacity` + `prefers-reduced-motion` dihormati?
- [ ] Konten dari user/data di-escape (anti-XSS)? Font tak menarik dari CDN eksternal bila deck harus offline?

> **Verifikasi WAJIB cuma-baca** (§8.2 Aturan 3): buka di browser + resize + tekan panah — JANGAN klaim "muat" tanpa benar-benar melihat di layar.

---

## 6. Definition-of-Done

- [ ] **Kontrak (§1) dipenuhi** — tiap slide muat 1 layar tanpa scroll + navigasi keyboard jalan + konten user di-escape.
- [ ] **Self-verify (§5) tercentang** dengan bukti (dibuka + di-resize + navigasi diuji, bukan cuma ditulis).
- [ ] Ekspor PDF: kalau diminta, ditandai ⏳ bila belum benar-benar dijalankan (§4) — tak diklaim beres.
- [ ] **Gerbang Pra-Rilis §4.6 LULUS** — "selesai" = terbukti dengan bukti.

---

## 7. Handoff / rujuk-silang (reuse-first — jangan salin)

- 📐 Arah desain & cocok-domain (pilih nada/preset) → `skills/design-direction/SKILL.md`.
- 📐 Aksesibilitas (navigasi keyboard, kontras, `prefers-reduced-motion`, Resize-Text) → `skills/a11y/SKILL.md`.
- 📐 Mekanik CSS layout & animasi anti-CLS (`clamp`, `dvh`, `transform`/`opacity`) → `skills/react-patterns/SKILL.md`.
- 🗃️ LATAR — Kredit (MIT © Affaan Mustafa): `frontend-slides` (`viewport-base.css`, `STYLE_PRESETS.md`, `animation-patterns.md`) ECC v2.0.0 — ditulis-ulang non-programmer + dinetralkan.

---

## 8. Batas jujur

- 🗃️ **LATAR:** skill ini menaikkan **lantai** kualitas deck HTML (muat-viewport + navigasi + gaya konsisten); ia **tidak** menggantikan alat presentasi penuh (PowerPoint/Keynote) untuk kolaborasi tim, embed video kompleks, atau animasi tingkat lanjut. Jalur ekspor-PDF (Playwright/Python) **belum teruji di kit** — perlakukan sebagai ⏳ sampai benar-benar dijalankan.
