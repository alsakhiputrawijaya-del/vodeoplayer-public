---
nama: design-direction
deskripsi: Arah desain & kualitas visual — tetapkan arah dulu (cocokkan ke domain), anti-template-generik, hierarki + state hover/focus yang dirancang, design token.
divisi: frontend
pemicu: [desain, design, tata-letak, layout, antarmuka, landing, hero, mockup, branding, tipografi, font, palet, tema-warna]
rawan_keamanan: false
menggantikan: [tampilan/desain]
---

# Skill: Arah Desain — tampilan visual & merek (anti-generik)

> **Kapan skill ini aktif:** prompt menyentuh desain/tata-letak/landing/hero/branding/tipografi. Otomatis relevan tiap AI bikin/ubah tampilan (halaman, dashboard, komponen, landing). Dispatcher `rak-pemicu` menyalakannya otomatis.
>
> 🙂 **Analogi:** UI template default = **undangan nikah Canva apa adanya** — semua tahu itu gratisan. Diatur sedikit (warna/font/tata letak sesuai produk) langsung terasa "dibuat khusus" & lebih dipercaya.

Skill ini **advisory** (§4.17): mayoritas butir 💡 SARAN (selera desain — otak native yang memutuskan). Yang **TIDAK** boleh dikorbankan demi estetika = butir **🔒 HASIL** di §1.

---

## 1. Kontrak (yang tak boleh dikorbankan demi gaya)

- 🔒 **HASIL — 🚨 Keamanan & aksesibilitas menang atas estetika:** konten dari user/API yang dirender sebagai tampilan **WAJIB tetap di-escape/sanitasi** (§10 + §8) — hiasan desain tak boleh membuka celah skrip jahat (**XSS** = menyisipkan skrip lewat teks user). Kontras teks minimal **4,5:1** & target sentuh **~44px** tetap WAJIB (§10 · `skills/a11y/SKILL.md`) walau demi gaya.
- 📐 CARA BAKU: **Design token** — 1 sumber warna/jarak/font/radius; JANGAN tulis nilai mentah berulang (🏢 seperti 1 kaleng cat standar untuk seluruh ruangan). Dark mode (kalau perlu) lewat token, bukan tambal per halaman. Mobile-first: uji minimal lebar ~360px.
- 📐 CARA BAKU: **Konten berat = jaga tetap ringan.** List panjang (>50 item) → **virtualisasi** / paginasi; gambar/font/bundle dioptimalkan (target halaman utama **<500KB**). Halaman publik → jaga **Core Web Vitals** (LCP/INP/CLS) — angka ambang di §1b, JANGAN dikarang; pasang **RUM** (*Real-User-Monitoring* = ukur kecepatan dari user asli) sejak rilis biar angkanya TERBUKTI. Heading semantik berurutan (satu `<h1>` → sub-heading turun rapi), bukan dari ukuran font.

---

## 2. Pilih ARAH DESAIN dulu — sebelum nulis kode (5 pertanyaan, 1-2 menit)

📐 CARA BAKU: AI WAJIB tetapkan ini dulu (boleh tanya staff singkat), JANGAN langsung koding:
1. **Tujuan** — layar ini buat apa? (jualan / kerja harian / pamer karya / lapor data)
2. **Siapa pemakainya** — yang di-scan PERTAMA apa? (operator gudang butuh angka stok dulu, bukan banner besar)
3. **Nada (tone)** — pilih SATU eksplisit: padat & tenang (alat kerja harian) / ekspresif & berani (landing, portofolio, game) / rapi-formal. JANGAN paksa gaya "halaman iklan" ke alat harian.
4. 💡 SARAN: **Satu detail berkesan** — 1 ide desain yang bikin hasil terasa disengaja (tipografi judul khas, 1 kartu "bento" beda ukuran).
5. **Batasan** — framework terpasang (cek versi §8.2), aksesibilitas (`skills/a11y/SKILL.md`), design-token yang sudah ada — pakai yang ADA dulu sebelum bikin sistem baru.

> 🏢 **Cocokkan arah ke DOMAIN (heuristik inti):** alat operasi / SaaS internal / dashboard analitik = **padat, tenang, mudah di-scan, grid disiplin**; portofolio / launch / editorial / brand mewah = boleh **ekspresif, tipografi berani, ruang lega**. Developer-tool = boleh "terminal/mono". **JANGAN default ke dark mode otomatis** dan jangan tempel gaya "landing marketing" ke aplikasi kerja harian. Arah salah-domain = hasil "kelihatan bagus tapi salah rasa".

---

## 3. Powerful — daftar "JANGAN" (pola generik) + ~6 kualitas wajib

💡 SARAN: **Jangan kirim tampilan template mentah** — hindari 9 pola generik yang bikin "kembar & murah": ❌ kartu-kotak abu-abu seragam tanpa hierarki · ❌ hero generik (teks tengah + gradient/blob ungu + CTA template) · ❌ card-in-card · ❌ dashboard "asal tempel" tanpa prioritas · ❌ font default tanpa alasan · ❌ palet "satu nada" (abu di atas putih + 1 aksen) · ❌ sembunyikan alat utama di balik marketing · ❌ tambah library baru cuma demi 1 hiasan · ❌ menjelaskan fitur UI di dalam UI padahal tombolnya sudah jelas sendiri. Konsisten dengan komponen yang sudah ada (shadcn/Tailwind) + ikut gaya halaman lain.

💡 SARAN: **~6 kualitas — tiap layar penting tunjukkan minimal 4:** (1) hierarki lewat beda ukuran · (2) irama jarak disengaja (kelompok berkaitan dirapatkan) · (3) kedalaman/lapisan (tumpang-tindih/bayangan) · (4) warna bermakna (merah=bahaya, hijau=sukses), bukan hiasan · (5) **state hover/focus/active yang terasa dirancang** (sekaligus bantu aksesibilitas `skills/a11y/SKILL.md`) · (6) gambar/ikon nyata saat konten bergantung padanya.

> 👨‍💻 CSS variables/design-token supaya konsisten lintas-state; responsive constraints eksplisit (grid, aspect-ratio, min/max) agar toolbar/grid tak geser saat hover; verifikasi teks panjang wrap rapi di ~360px & desktop. Animasi: hemat & untuk memperjelas alur, bukan hiasan yang mengganggu (mekanik anti-CLS → `skills/react-patterns/SKILL.md`).

---

## 4. Self-verify (checklist "tampilan selesai" — sejalan Gerbang §4.6)

- [ ] Tidak terlihat seperti template Tailwind/shadcn default (lulus daftar "JANGAN" §3)?
- [ ] Layar pertama langsung menjelaskan produk/alur — bukan basa-basi marketing?
- [ ] Ada hierarki (ada yang menonjol), bukan semua seragam?
- [ ] Arah desain cocok dengan DOMAIN (§2 — alat kerja padat/tenang, bukan gaya landing dipaksakan)?
- [ ] Ada state hover/focus/active jelas (juga bisa di-fokus keyboard — `skills/a11y/SKILL.md`)?
- [ ] Dukung mode terang & gelap → dua-duanya terasa disengaja?
- [ ] 🔒 Konten user/API di-escape (anti-XSS) + kontras ≥4,5:1 + target tap ~44px terpenuhi?

---

## 5. Definition-of-Done

- [ ] Arah desain (§2 — 5 pertanyaan + cocok-domain) ditetapkan SEBELUM koding.
- [ ] Lulus checklist Self-verify (§4), termasuk butir 🔒 keamanan/aksesibilitas.
- [ ] 4 state UI (loading/kosong/error/sukses) + responsive ~360px terverifikasi (rujuk `skills/a11y/SKILL.md`).
- [ ] Akan terlihat meyakinkan sebagai screenshot produk nyata.

---

## 6. Handoff / rujuk-silang (reuse-first — jangan salin)

- 📐 Aksesibilitas WCAG (kontras/keyboard/target-sentuh/ARIA) + 4 state UI detail → `skills/a11y/SKILL.md`.
- 📐 Mekanik CSS layout & animasi (grid responsif, `dvh`/`svh`, `clamp`, Motion anti-CLS, `tabular-nums`) → `skills/react-patterns/SKILL.md`.
- 📐 Escape output & keamanan render konten user (XSS/CSP) → `skills/owasp/SKILL.md`.
- 🖼️ Bikin deck presentasi (slide HTML/CSS, preset gaya) → `skills/presentasi/SKILL.md`.
- 🗃️ LATAR — Kredit (MIT © Affaan Mustafa): `design-quality` + `frontend-design-direction` ECC v2.0.0 (ditulis-ulang non-programmer + dinetralkan).

---

## 7. Batas jujur

- 🗃️ **LATAR:** skill ini menaikkan lantai kualitas visual + menjaga 2 pagar keras (escape + kontras/target-sentuh); ia **tidak** menggantikan riset desain mendalam atau design system penuh untuk produk besar. Selera visual (💡) boleh dilewati dengan alasan; 🔒 keamanan/aksesibilitas tidak.
