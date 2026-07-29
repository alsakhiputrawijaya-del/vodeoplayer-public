---
nama: cek-permintaan
deskripsi: Pastikan hasil = yang DIMINTA client (bukan yang AI kira) — bandingkan ke rencana ✅/❓ yang disepakati, buka daftar asumsi, beri checklist uji-sendiri + laporan penutup bahasa awam. Cegah "stempel palsu".
divisi: product
pemicu: [sesuai-permintaan, sesuai-yang-diminta, udah-bener-belum, udah-sesuai-belum, yang-aku-minta, jangan-nambah-fitur, sesuai-brief, cek-hasil, serah-terima]
rawan_keamanan: false
menggantikan: []
---

# Skill: Cek Permintaan — hasil = yang diminta (serah-terima ke client awam)

> **Inti:** client non-programmer tak bisa baca kode, jadi ia tak tahu apakah yang dibangun = yang ia mau. Skill ini menutup celah itu — TAPI tanpa jebakan "AI menilai kerjaannya sendiri lawan ingatannya sendiri" (stempel palsu).

Butir 🔒 HASIL = jaminan yang tak boleh gagal. Prinsip komunikasi: JANGAN interogasi client (§1.6); ambiguitas → **popup-rekomendasi** (opsi rekomendasi + alasan awam), bukan pertanyaan terbuka.

---

## 1. Kontrak (yang HARUS benar)

- 🔒 **HASIL — titik-acuan = rencana yang DISEPAKATI, bukan ingatan AI.** Cek "sesuai/tidak" WAJIB dibandingkan ke **Laporan Kondisi Nyata ✅/❓ + rencana ringkas yang AI kembalikan di awal** (AGENTS.md §4.1/§4.4) — bukan tebakan AI tentang maksud client. Belum ada rencana tertulis? Bikin dulu parafrase-balik singkat + minta client benarkan (1×, via popup), baru nilai.
- 🔒 **HASIL — DILARANG klaim "sesuai permintaan" bila ada ASUMSI penyetir-hasil yang belum dikonfirmasi.** Tiap asumsi yang mengubah bentuk hasil (mis. "kuanggap pembayaran pakai Midtrans") wajib **ditulis terbuka** + ditandai ❓ belum-dikonfirmasi. Stempel "sesuai" hanya untuk yang benar-benar cocok rencana.

---

## 2. Cara (📐 CARA BAKU)

### Hulu — saat permintaan ambigu-menyetir-hasil
1. 📐 **Parafrase-balik** permintaan client jadi butir konkret + tandai mana ✅ jelas vs ❓ asumsi. Ambiguitas yang **mengubah hasil** (perlu login? bayar sekarang? multi-bahasa?) → **popup-rekomendasi** (bukan pertanyaan terbuka). Yang tak menyetir hasil → ambil default masuk-akal, catat sebagai asumsi (jangan hentikan kerja untuk hal remeh).

### Hilir — checkpoint akhir + titik-risiko
2. 📐 **Bandingkan hasil vs rencana** → sajikan **tabel polos 3 kolom**: **yang DIMINTA · yang DIBUAT · yang DIASUMSIKAN**. Client tak perlu paham teknis — cukup mengenali "eh, yang diasumsikan itu salah".
3. 📐 **Deteksi 3 penyimpangan:** (a) **kurang** — permintaan yang belum dibuat; (b) **melenceng** — dibuat tapi beda dari yang diminta; (c) **scope-creep** — fitur yang TAK diminta tapi ikut dibuat (buang / konfirmasi, jangan diam-diam menambah).
4. 📐 **Smell kode:** ukuran (fungsi/file panjang) → cek cepat ambang: **berkas >500 baris / fungsi >100 baris = tandai PECAH** (hitung via alat baca, jangan menebak). Fokus manual pada yang angka tak tangkap: nama menyesatkan, duplikasi logika, coupling.

### Output WAJIB ke client (E2 + E3)
5. 🔒 **HASIL — checklist uji-sendiri (E2):** sertakan **langkah klik bahasa awam** biar client verifikasi sendiri — mis. "1) buka /daftar → 2) isi email → 3) klik Daftar → harus masuk ke Beranda". Jembatan dari "tes hijau (tak kelihatan)" ke "kamu bisa lihat sendiri" (§1.5 naik kelas).
6. 🔒 **HASIL — laporan penutup awam (E3):** tutup dengan recap polos: **yang saya kerjakan · hasilnya · yang BELUM · yang saya asumsikan**. Bagi non-programmer, laporan ini = produknya.

🙂 **Non-Programmer:** kamu tak perlu baca kode untuk tahu hasilnya benar. AI akan kasih (1) tabel "kamu minta ini / aku buat ini / aku anggap ini", (2) langkah klik biar kamu coba sendiri, (3) ringkasan apa yang sudah & belum. Kalau ada "yang aku anggap" yang salah, tinggal bilang — jangan sungkan.

---

## 3. Powerful — tabel serah-terima + daftar asumsi

🧪 CONTOH format (ambil polanya, jangan salin mentah):

| Yang DIMINTA | Yang DIBUAT | Yang DIASUMSIKAN (❓ belum dikonfirmasi) |
|---|---|---|
| "toko online bisa jualan" | katalog + keranjang + checkout | pembayaran pakai Midtrans (❓ belum kamu pilih) |
| "ada login" | login email + password | belum pakai login Google (❓) |

**Cara uji sendiri:** 1) buka `/produk` → 2) klik "Beli" → 3) di checkout isi data → 4) harus muncul halaman "Pesanan diterima".
**Belum dibuat:** kirim invoice ke email (menunggu kamu pilih penyedia email).

---

## 4. Self-verify (sangkal diri SEBELUM bilang "sesuai")

- [ ] Aku membandingkan ke **rencana ✅/❓ yang disepakati** (bukan ingatanku sendiri)?
- [ ] Tiap **asumsi penyetir-hasil** ditulis terbuka + ditandai ❓ (tak ada stempel "sesuai" diam-diam)?
- [ ] Aku cek 3 penyimpangan (kurang / melenceng / scope-creep)?
- [ ] Ada **checklist uji-sendiri** langkah-klik (E2) + **laporan penutup** awam (E3)?
- [ ] Ambiguitas penyetir-hasil kuangkat via **popup-rekomendasi**, bukan interogasi terbuka?

---

## 5. Definition-of-Done

- [ ] Titik-acuan (rencana ✅/❓) ada; kalau belum, parafrase-balik dikonfirmasi client 1×.
- [ ] Tabel **diminta / dibuat / diasumsikan** disajikan.
- [ ] Penyimpangan (kurang / melenceng / scope-creep) dilaporkan + ditindak.
- [ ] Checklist uji-sendiri (E2) + laporan penutup awam (E3) diberikan.
- [ ] Tak ada klaim "sesuai permintaan" saat masih ada asumsi penyetir-hasil belum dikonfirmasi.

---

## 6. Handoff / rujuk-silang (reuse-first — JANGAN salin, RUJUK)

- 📐 **Cek mutu KODE** (konvensi, error-ditelan, tipe `any`) → gerbang kualitas `npx lintasai` + `/code-review` native. Skill ini fokus "hasil = permintaan" (sumbu Spec), BUKAN konvensi kode (sumbu Standards).
- 📐 **Tes jalur kritis** (bukti hasil benar) → `skills/cakupan-tes/SKILL.md`. **Bug sulit ketemu saat cek** → `skills/debug-metodis/SKILL.md`.
- 📐 **Keputusan besar / titik-risiko** (login/bayar/data) → angkat via popup-rekomendasi. **Ubah data berisiko saat menindak temuan** → `skills/jaring-data/SKILL.md`.
- 🗃️ **LATAR — kredit:** sumbu "Spec" (hasil vs requirement, deteksi scope-creep) diserap dari `code-review` (mattpocock/skills, MIT); disiplin acceptance-criteria menutup gap spec-capture. Ditulis-ulang non-programmer (jangkar rencana ✅/❓ + popup-rekomendasi, bukan interogasi).

---

## 7. Batas jujur

- 🗃️ **LATAR:** skill ini menjamin hasil **dibandingkan ke rencana yang disepakati + asumsi dibuka** — TIDAK menjamin rencana awalnya benar. Kalau client sendiri belum tahu maunya, itu disingkap lewat parafrase-balik + popup-rekomendasi, bukan ditebak diam-diam. Yang dicegah: AI membangun hal berbeda lalu mengecapnya "sesuai" (stempel palsu).
