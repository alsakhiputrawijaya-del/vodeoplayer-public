---
nama: backend
deskripsi: Logika & API sisi-server kelas industri — kontrak dulu, validasi di boundary, otorisasi per-resource (anti-IDOR), status code benar, error tak ditelan.
divisi: backend
pemicu: [endpoint, backend, rest-api, server-action, controller, handler, route-handler, crud, tampilkan-data, ambil-data, daftar-pelanggan, daftar-pesanan, openapi, graphql, paginasi, repository, double-booking, laporan-penjualan, export-excel, pencarian-produk]
rawan_keamanan: true
menggantikan: []
---

# Skill: Backend — logika & API sisi-server (kelas industri)

> `rawan_keamanan: true` → skill ini **sangat disarankan dibuka sebelum edit pertama** berkas endpoint/route, karena kesalahan otorisasi di sini = kebocoran data yang **senyap** (tak kelihatan di layar).
>
> **Inti:** endpoint = alamat API yang bisa dipanggil aplikasi lain (mis. `/api/pesanan`). Kontrak = ketentuan tertulis untuk tiap endpoint (apa yang wajib dikirim, apa yang dikembalikan, alasan kalau ditolak). Otorisasi per-resource = server **wajib memverifikasi** bahwa data yang diminta memang milik user yang meminta — bukan langsung diberikan ke siapa pun yang menyebut ID-nya.

Butir **🔒 HASIL** = hasil keselamatan yang tak boleh gagal apa pun caranya.

---

## 1. Kontrak (yang HARUS benar — tulis DULU sebelum koding)

- 🔒 **HASIL — bentuk data yang menyeberang (tulis kontrak tiap endpoint/fungsi publik):**
  - **Input:** apa yang diterima (jenis + wajib/opsional) — dan dari mana (body/query/header/URL). Semua = **data tak-tepercaya** sampai divalidasi.
  - **Output:** bentuk respons yang konsisten (amplop: sukses + data + error + info paginasi) — sama untuk semua endpoint, jangan tiap endpoint beda bentuk.
  - **Error + status:** kode status HTTP **BENAR** (200/201/204 · 400 · 401 · 403 · 404 · 409 · 410 · 422 · 429 · 500 · 502/503) — **JANGAN kirim semua sebagai 200** (klien tak bisa bedakan sukses dari gagal). 201 = data dibuat, **sertakan header `Location: /v1/<resource>/<id>`** (klien langsung tahu alamat data barunya, tak perlu menebak) · 204 = sukses **tanpa isi** (DELETE/PUT yang tak mengembalikan data — bukan 200 ber-body kosong) · **400 = permintaan tak bisa DIBACA sama sekali** (JSON rusak, parameter/header wajib hilang — gagal sebelum validasi isi dimulai) · 401 = belum login · 403 = login tapi tak berhak · 404 = tak ada · 409 = bentrok · 410 = dulu ada, kini dihapus permanen (endpoint di-sunset) · **422 = permintaan terbaca tapi ISINYA tak lolos validasi** (email tak sah, harga negatif) — **pilih SATU: kegagalan validasi skema = 422, jangan campur dengan 400** · 429 = kebanyakan permintaan, **sertakan `Retry-After`** (klien butuh tahu KAPAN boleh coba lagi; detail kebijakan → `skills/rate-limiting/SKILL.md`) · **500 = kesalahan tak-terduga di server** — balas pesan generik, detail internal (stack trace, pesan SQL) TIDAK ikut keluar · 502 = layanan hulu (*upstream* = layanan lain yang kamu panggil) gagal · 503 = kelebihan beban/perawatan, **sertakan `Retry-After`** supaya klien mundur terjadwal, bukan menyerbu ulang.
    - ⚠️ Pengecualian yang sudah diketahui: **DRF dengan `SessionAuthentication`** membalas **403** untuk pengunjung anonim, bukan 401 → `skills/python/SKILL.md`. Cek setelan project dulu sebelum menulis tes yang meng-assert 401.
  - **Rahasia:** secret/token/PII (*Personally Identifiable Information* = data pribadi yang bisa mengidentifikasi orang: email/no.HP/KTP/nomor kartu) **TAK PERNAH** masuk log atau body respons error.

---

## 2. Cara rakit (prinsip — 📐 CARA BAKU, boleh diganti cara lain yang capai HASIL sama)

1. 📐 **Validasi + sanitasi SEMUA input di pintu masuk (boundary).** Tiap data dari luar (HTTP body/query/header/URL/file/env) divalidasi bentuk+tipe+rentang SEBELUM dipakai. Pakai skema validasi (zod/valibot/pydantic/…). 🔒 HASIL: **query ke DB pakai parameter/prepared statement, JANGAN sambung-string** (cegah SQL injection = penyerang menyelipkan perintah lewat input).
2. 🔒 **HASIL — Otorisasi per-resource pakai identitas SERVER-side, BUKAN ID dari body/URL** (cegah **IDOR** = *Insecure Direct Object Reference* = penyerang mengganti angka ID di URL untuk mengambil data orang lain). Ambil "siapa user ini" dari **sesi/token terverifikasi di server**, lalu cek apakah dia berhak atas baris data yang diminta. Default-deny: mulai tak-boleh, buka izin seperlunya. → alur login & cek izin: `skills/auth/SKILL.md`.
3. 📐 **Operasi multi-tulis = atomik ATAU idempoten.** **Atomik** (semua-jadi atau semua-batal) = pakai transaksi DB saat beberapa tulis harus konsisten. **Idempoten** (kebal-ulang = dijalankan 2× hasilnya sama, tak dobel) = untuk operasi yang bisa di-retry klien/jaringan (mis. anti bayar-dobel). → pola idempoten: `skills/pembayaran/SKILL.md`.
4. 📐 **Desain API rapi (REST):** amplop respons konsisten · status code benar (butir §1) · **versi di URL** (`/v1/`) untuk perubahan yang memutus klien lama. List besar = **paginasi** (potong per halaman) + **index kolom** yang di-`ORDER BY`/`WHERE` (jangan kirim ribuan baris sekaligus).
   - **Penamaan URL** (sulit diubah setelah klien pihak-ketiga memakainya — pilih benar sejak awal): resource = **kata benda JAMAK huruf kecil kebab-case** (`/team-members`), **DILARANG kata kerja** di URL (`/getTeamMembers` salah — aksinya sudah diwakili method HTTP), **DILARANG `snake_case` & bentuk tunggal** (`/team_members`, `/user` salah). Kepemilikan = **sub-resource** (`/users/:id/orders`). Aksi non-CRUD yang tak bisa dipetakan = kata kerja HEMAT (`POST /orders/:id/cancel`). Penamaan field body **konsisten** (jangan campur `camelCase`/`snake_case`). (Kebab-case URL halaman sudah dibahas di `skills/seo/SKILL.md` — sama prinsip, RUJUK.)
   - **Konvensi query-param — pilih SEKALI, pakai di SEMUA endpoint** (klien belajar sekali, bukan menghafal aturan berbeda tiap alamat): saring `?status=active` · banyak-nilai `?kategori=elektronik,pakaian` · pembanding `?harga[gte]=10&harga[lte]=100` · urut `?sort=-dibuat_pada` (awalan `-` = menurun; koma = urut bertingkat) · cari bebas `?q=kata kunci` · field bersarang `?pelanggan.negara=ID`. Paginasi: halaman-jauh/feed pakai **cursor/keyset**, bukan `OFFSET` besar → `skills/supabase-prisma/SKILL.md`.
   - 🔒 **HASIL — Ambil KOLOM SEPERLUNYA, JANGAN `SELECT *` / `select('*')`.** Kolom yang tak dipakai membengkakkan respons **dan** membocorkan kolom internal yang tak pernah dimaksudkan keluar (`passwordHash`, catatan internal). Sebutkan kolomnya eksplisit, atau petakan dulu ke bentuk respons (DTO) sebelum dikirim.
   - 📐 **Anti N+1** (*N+1 query* = 1 query mengambil daftar, lalu 1 query LAGI **per baris** di dalam loop → 100 baris jadi 101 query; halaman makin lambat seiring data bertambah, dan sering baru terasa di produksi). Ambil relasinya **sekali secara batch** lalu jodohkan di memori (`Map`), atau pakai `include`/`select`/`JOIN`. Detail + `EXPLAIN ANALYZE` → `skills/supabase-prisma/SKILL.md`.
   - 📐 **Permintaan bersyarat (*conditional request*) — hemat kuota + cegah tulis saling-menimpa.** Server mengirim **`ETag`** = sidik-jari versi data (mis. `"v7"`); klien menyimpannya lalu memakainya di permintaan berikutnya. Dua pemakaian:
     - **Baca:** klien kirim `If-None-Match: "v7"` → kalau data belum berubah, balas **`304 Not Modified`** *tanpa body*. Berguna untuk GET berat/sering (daftar panjang, detail produk) — pemakai HP hemat kuota & layar terisi lebih cepat.
     - 🔒 **HASIL — Tulis:** data yang bisa diedit **lebih dari satu orang** (stok, harga, artikel, status pesanan) → PUT/PATCH **wajib** menyertakan `If-Match: "<etag>"`; kalau sidik-jarinya sudah berbeda balas **`412 Precondition Failed`** (minta klien muat ulang lalu ulangi). Tanpa ini dua orang yang menyimpan hampir bersamaan = **yang belakangan menimpa diam-diam** — datanya hilang tanpa satu pun pesan error (kerusakan SENYAP). Alternatif setara: kolom versi/`updated_at` yang dicek di `WHERE` saat UPDATE (*optimistic concurrency* → `skills/admin-panel/SKILL.md`). Pilih salah satu — jangan tak ada sama sekali.
   - 💡 **GraphQL (kalau project INI memakainya — cek dulu, jangan berasumsi):** kontrak, validasi di boundary, dan otorisasi per-resource **sama persis** dengan REST. Bedanya: satu query bisa menembus banyak resource sekaligus → cek izin **per-field**, bukan sekali di pintu masuk. Pagar khusus (introspection OFF di produksi, batas kedalaman/kompleksitas/batching) → `skills/owasp/SKILL.md`.
   - **Method HTTP → boleh-tidaknya klien retry otomatis** (menyambung idempoten poin 3): pilih method yang benar supaya klien/proxy/SDK-mobile tahu aman-tidaknya mengulang permintaan saat jaringan putus (salah = pesanan dobel).

     | Method | Idempoten (ulang = hasil sama) | Aman (tak mengubah data) | Untuk |
     |---|---|---|---|
     | GET | ✅ | ✅ | baca |
     | POST | ❌ | ❌ | buat / picu aksi |
     | PUT | ✅ | ❌ | ganti utuh |
     | PATCH | ❌ | ❌ | ubah sebagian |
     | DELETE | ✅ | ❌ | hapus |

     PATCH ditandai ❌ karena bentuk lazimnya mengirim **selisih** (`{ stok: -1 }` → dijalankan 2× stok berkurang 2). PATCH **bisa** dibuat idempoten kalau yang dikirim **nilai akhir**, bukan selisih (`{ stok: 41 }`) — pilih sadar, jangan campur dua gaya di satu API.
   - **Deprecation (ubah API tanpa memutus klien lama):** perubahan **non-breaking** (tambah field baru · query param opsional · endpoint baru) TAK perlu versi baru; **breaking** (hapus/rename field · ubah TIPE field · ubah bentuk URL/auth) WAJIB `/v2/` sambil `/v1/` tetap hidup (pola tambah-dulu-hapus-belakangan, sama seperti migrasi DB → `skills/database/SKILL.md`). **Maksimal 2 versi aktif** (yang sekarang + satu sebelumnya) — begitu `/v3/` lahir, yang tertua masuk jadwal mati; tanpa rem ini tiap versi lama ikut dirawat & diuji selamanya. Endpoint yang mau dimatikan: kirim header **`Sunset`** dulu (beri klien waktu — mis. 1 siklus rilis / beberapa bulan, sesuaikan kontrak, jangan jadikan angka mati), balas **`410 Gone`** setelah lewat. ⚠️ Isi `Sunset` **wajib format tanggal HTTP** (`Sunset: Sat, 01 Jan 2026 00:00:00 GMT`) — `2026-01-01` bukan format sah dan **diabaikan diam-diam** oleh klien/SDK, jadi peringatannya tak pernah sampai. Umumkan lebih dulu → `skills/devops/SKILL.md`.
     - 💡 **Versi di URL = baku kit** (paling gampang dilihat, di-log, dan di-cache). Ada gaya lain: versi lewat header (`Accept: application/vnd.<app>.v2+json`) — URL bersih tapi lebih gampang terlupa & sulit diuji manual. Kalau project client **sudah** memakai gaya header, **IKUTI yang ada** (kenyataan kode client MENANG, AGENTS.md §4.3) — jangan diseragamkan paksa ke URL, itu justru breaking change untuk klien mereka.
5. 📐 **Jangan telan error diam-diam (anti *silent failure*).** Error WAJIB di-log terstruktur dengan konteks (apa · di mana · ID terkait, **tanpa** secret/PII) + dipropagasi. 🔒 HASIL: **DILARANG `catch {}` kosong** atau fallback menyesatkan (`.catch(() => [])` yang menyembunyikan kegagalan jadi "data kosong") — itu melahirkan bug tersembunyi yang mahal. Tangkap error **spesifik**, jangan telan semua.
   - 📐 **Tentukan KELAS error-nya sebelum menulis `catch`** (tanpa ini, "jangan telan error" malah berubah jadi `try/catch` di mana-mana yang justru menelan bug): **(a) gagal-dunia-nyata** — jaringan putus, DB penuh, layanan luar mati, input user ngawur. Kodenya benar, kegagalan ini memang wajar → tangkap, terjemahkan jadi pesan ramah, boleh di-retry, aplikasi tetap jalan. **(b) bug kode sendiri** — membaca properti dari `undefined`, argumen wajib lupa dioper, salah nama fungsi. Ini **JANGAN "ditangani"**: menangkapnya lalu lanjut jalan = proses meneruskan hidup dalam keadaan yang sudah salah, dan kerusakannya merembet ke data. Biarkan naik ke jaring terakhir → dicatat → proses direstart (`templates/PRODUCTION_OBSERVABILITY.md` Pilar 1). 🙂 bedanya: yang pertama "hal di luar kendali kita", yang kedua "kita yang salah tulis" — yang kedua tak boleh disembunyikan, harus berisik supaya ketahuan.
   - 🔒 **HASIL — saat membungkus error bawah jadi error domain, WAJIB ikat asalnya:** `new AppError(pesan, { cause: e })` (JS/TS, standar ES2022 — dibaca otomatis Node & Sentry); padanan Python `raise ErrorDomain(...) from e` → `skills/python/SKILL.md`. Tanpa itu log cuma berisi kalimat buatanmu sendiri (`AppError: Database error`) sementara penyebab aslinya — *connection pool timeout* vs *unique constraint* vs *kolom tak ada* — **hilang permanen**, dan diagnosa berubah jadi tebak-tebakan.
   - 📐 **Catat PENUH sekali saja, di penerjemah boundary (§3).** Lapis di tengah cukup melempar-ulang + menambah konteks lewat `cause` — jangan ikut mencatat. Satu error yang jadi 5 baris log membuat ambang alarm ("error > 10/menit") tak bisa dipercaya.
   - 📐 **Operasi async yang hasilnya penting WAJIB di-`await`** atau punya penangkap + log eksplisit. Promise yang dilepas tanpa penunggu (*fire-and-forget*) yang gagal = **senyap total**. Kerja yang memang sengaja dilepas ke belakang → lewat antrean, bukan promise menggantung → `skills/background-job/SKILL.md` · `skills/next-core/SKILL.md`.
6. 📐 **Panggilan ke layanan luar yang rapuh** (gateway bayar, storage, API pihak-ketiga) → bungkus coba-ulang berjeda + saklar-pemutus supaya 1 layanan lambat tak menyeret seluruh sistem → `skills/tahan-gagal/SKILL.md`.
7. 📐 **Kerja berat/lambat jangan menahan respons** — dorong ke antrean latar (kirim email, buat PDF, proses file) → `skills/background-job/SKILL.md`. Balas cepat, kerjakan di belakang.
8. 📐 **Modul dalam (sembunyikan kompleksitas di balik interface kecil) — HANYA saat perlu.** Kalau satu urusan server dipakai ≥3 tempat / logikanya rumit → bungkus jadi satu fungsi/modul ber-interface kecil (pemanggil cukup tahu input→output, detail disembunyikan; **terima dependency, jangan bikin di dalam** → gampang dites). Uji-hapus (deletion-test) = pagar ANTI over-engineering: "kalau modul ini dihapus, ada yang rugi?" — kalau tidak, JANGAN buat (YAGNI). Web sederhana jangan ditambahi lapisan. Ini kerja internal AI — **jangan dinarasikan ke client**.
   - **Nama baku 3 lapis di industri** — kenali istilahnya supaya bisa mengikuti pola yang SUDAH dipakai project client; **jangan** memasangnya di project yang belum butuh (uji-hapus dulu): **Repository** = satu-satunya lapis yang menyentuh DB (semua query terkumpul di sini → gampang diganti & di-mock saat tes) · **Service** = aturan bisnis murni yang **tak tahu HTTP** (tak menyentuh `req`/`res`, jadi fungsi yang sama bisa dipanggil dari endpoint MAUPUN dari job latar) · **Middleware/HOF** = urusan lintas-request yang berulang (cek sesi, log, rate-limit) dibungkus sekali lalu dipasang di banyak route. 🔒 HASIL: middleware **TAK BOLEH** jadi satu-satunya tempat cek izin — route handler & Server Action Next.js **publik secara default** dan bisa dicapai tanpa melewati middleware, jadi otorisasi wajib dicek ULANG di dalamnya (`skills/next-core/SKILL.md` · `skills/owasp/SKILL.md`).
9. 📐 **Jangan merantai panggilan menembus beberapa lapis** (`pesanan.pelanggan().alamat().kota()`). Tiap rantai mengikat kodemu ke bentuk-DALAM objek milik lapis lain, jadi satu perubahan kecil di sana memutus banyak berkas sekaligus — dan yang terlewat baru ketahuan saat runtime. Minta yang benar-benar kamu butuh lewat SATU pintu (`pesanan.kotaPengiriman()`), atau oper **DTO** (*Data Transfer Object* = objek berisi data siap-pakai, tanpa perilaku). *(Law of Demeter.)*
10. 💡 **`switch`/`if` panjang atas tipe yang SAMA, berulang di beberapa berkas** → pertimbangkan satu tabel/factory yang memetakan tipe → penanganannya, supaya menambah tipe baru = menambah 1 entri, bukan menyunting banyak tempat (yang terlewat = cabang diam-diam salah). **Jangan dipaksakan:** cabang yang cuma ada di SATU tempat & pendek lebih jelas ditulis `switch` biasa — sederhana menang (`AGENTS.md` §3.9).

🙂 **Non-Programmer:** endpoint yang "jalan" saat kamu tes sendiri belum tentu **aman**. Dua bahaya paling sering tak kelihatan di layar: (a) orang bisa mengganti angka di alamat dan melihat data orang lain (IDOR), dan (b) error yang "ditelan" diam-diam sehingga aplikasi kelihatan normal padahal ada data gagal tersimpan. Skill ini memasang dua pagar itu.

---

## 3. Powerful — amplop respons + guard yang paling berdaya-ungkit

Yang paling menghemat bug backend = **satu bentuk amplop respons** dipakai semua endpoint + **satu titik cek otorisasi**. 🧪 **CONTOH KASUS (ambil polanya, jangan salin mentah — netralkan ke stack + versi library terpasang):**

```ts
// Amplop respons SERAGAM — semua endpoint balas bentuk sama (klien tak perlu tebak-tebak).
// `page` cuma untuk endpoint daftar. `has_next` WAJIB ada bila `page` ada — klien butuh tahu "masih ada
// lagi?" tanpa menebak dari panjang array; `total` OPSIONAL (menghitung total di tabel besar itu mahal).
type Ok<T>  = { ok: true;  data: T; page?: { has_next: boolean; next?: string; self?: string; total?: number } }
type Err    = { ok: false; error: { code: string; message: string; requestId: string; details?: Array<{ field: string; message: string; code: string }> } } // 422 → isi `details` per-kolom yang gagal
// `requestId` = trace-id request ini (templates/PRODUCTION_OBSERVABILITY.md Pilar 2). WAJIB ikut di
// respons error — terutama 500 ber-pesan generik: tanpa ini user cuma bisa bilang "error dong", dan
// tak ada satu pun cara mencocokkannya dengan baris log. UI menampilkannya ("Kode: a3f91c").

// Pemakaian di route/handler — cek DI SERVER, tiap permintaan:
const user = await sesiTerverifikasi(req)          // identitas dari sesi server-side
if (!user) return json(401, { ok: false, error: { code: 'UNAUTHENTICATED', message: 'Belum login' } })

const pesanan = await db.pesanan.findUnique({ where: { id } })
if (!pesanan) return json(404, { ok: false, error: { code: 'NOT_FOUND', message: 'Tak ada' } })
// 🔒 kunci anti-IDOR: baris ini milik user tsb? -> identitas dari SESI, bukan dari body/URL.
if (pesanan.ownerId !== user.id) return json(403, { ok: false, error: { code: 'FORBIDDEN', message: 'Tak berhak' } })
```

- 📐 CARA BAKU: input divalidasi skema DI ATAS handler (`parse(body)` gagal → balas **422** + isi `details[]` per-kolom yang gagal supaya form multi-kolom bisa menandai tiap input yang salah — selaras `skills/a11y/SKILL.md`; jangan lanjut).
- 💡 SARAN: taruh cek "boleh apa" di satu helper terpusat (`bolehkah(user, aksi, resource)`) — jangan sebar `if (role === 'admin')` di banyak berkas (satu tempat lupa = pintu bocor). → `skills/auth/SKILL.md`.
- 📐 CARA BAKU — **error ber-tipe + SATU penerjemah di pintu keluar.** Bikin satu kelas dasar (`AppError` berisi `code` + `statusCode`, dan set `name` ke nama kelasnya) lalu turunannya (`NotFound` → 404 · `Validation` → 422 · `Forbidden` → 403), dan SATU fungsi di boundary yang menerjemahkan error apa pun jadi amplop `Err` + status. Kenapa: status code berhenti tersebar di puluhan `if` (satu tempat lupa = status salah), dan error yang **tak dikenal** otomatis jadi 500 ber-pesan generik — detail internal (stack trace, pesan SQL) tak ikut bocor ke user.
  - ⚠️ **Gotcha `instanceof` yang gagal SENYAP** — HANYA kalau build project ini menurunkan kelas ke ES5 (`tsconfig` `"target": "es5"`, atau Babel `preset-env` dengan daftar browser lama). Di situ turunan `Error` kehilangan rantai prototype-nya, jadi `error instanceof NotFoundError` diam-diam `false` dan penerjemahmu menjatuhkan SEMUA error ke 500. Obatnya satu baris di konstruktor dasar: `Object.setPrototypeOf(this, new.target.prototype)`. **Cek dulu `target` di project ini** — scaffold modern (Next.js/SWC, Vite, `tsc` project baru = ES2022) memancarkan `class` native, jebakan ini tidur dan barisnya tak perlu ditambahkan.
  - 💡 SARAN — **gaya `Result` (tanpa lempar) untuk operasi yang WAJAR gagal** (parsing berkas unggahan, panggilan API pihak-ketiga): alih-alih melempar, kembalikan `{ ok: true, value } | { ok: false, error }` sebagai nilai balik fungsi. Untungnya: TypeScript **memaksa** pemanggil memeriksa `ok` dulu sebelum menyentuh `value` — jalur gagal yang terlupa jadi MERAH saat ngoding, bukan meledak di produksi. Pakai seperlunya (jangan seluruh codebase pindah gaya): jalur yang gagalnya rutin & terduga pakai `Result`, sisanya tetap `throw` + penerjemah boundary di atas. Bentuknya sengaja mencerminkan amplop `Ok`/`Err` di atas supaya cuma ada satu kosakata.
  - 🔒 **HASIL — penjaga izin WAJIB MENGEMBALIKAN respons, jangan melempar tanpa penangkap.** Error 403 yang dilempar dari pembungkus/middleware lalu tak ada yang menangkap akan keluar sebagai **500** — klien menyimpulkan "server rusak" padahal sebenarnya "kamu tak berhak", dan tim ikut salah mendiagnosis. Kalau memang melempar, pastikan penerjemah di atas benar-benar membungkus jalur itu.

---

## 4. Self-verify (sangkal diri sendiri SEBELUM bilang "selesai")

Jawab dengan bukti `berkas:baris` (tak bisa jawab → belum selesai):
- [ ] Tiap input dari luar **divalidasi di boundary** sebelum dipakai (uji: kirim tipe/nilai aneh → ditolak **422**; body yang tak bisa di-parse → **400**)?
- [ ] Otorisasi per-resource dari **sesi server-side** (uji IDOR: ganti ID di URL → apakah bisa lihat data orang lain?)?
- [ ] Query DB **parameterized** (tak ada string-concat SQL)?
- [ ] Status code **benar** per kasus (bukan semua 200)? Amplop respons **konsisten**?
- [ ] Multi-tulis **atomik/idempoten** (uji: jalankan 2× / potong di tengah → tak korup/dobel)?
- [ ] Tak ada `catch {}` kosong / fallback yang menyembunyikan kegagalan? Error di-log dengan konteks (tanpa secret)?
- [ ] Tiap `catch` sudah ditentukan **kelasnya** (gagal-dunia-nyata = ditangkap · bug kode sendiri = dibiarkan naik, bukan ditelan)?
- [ ] Error yang dibungkus **mengikat asalnya** (`{ cause: e }` / `from e`), dan dicatat penuh **sekali** di boundary (bukan log-lalu-lempar berlapis di tiap lapis)?
- [ ] Respons error menyertakan **`requestId`** yang sama dengan `trace-id` di log (uji: picu 500, cocokkan kodenya di log)?
- [ ] List besar dipaginasi + kolom filter/urut ter-index?
- [ ] Tak ada `SELECT *`/`select('*')` dan tak ada query **di dalam loop** (N+1) di jalur yang sering dipanggil?
- [ ] `201` menyertakan header `Location`; `204` dipakai untuk sukses-tanpa-isi (bukan 200 ber-body kosong)?
- [ ] Konvensi saring/urut/paginasi **seragam** di semua endpoint (tak campur gaya antar-alamat)?
- [ ] URL resource = kata benda jamak kebab-case tanpa kata kerja (bukan `snake_case`/tunggal); method HTTP sesuai idempoten-nya (GET/PUT/DELETE idempoten, POST/PATCH tidak)?
- [ ] Data yang bisa diedit >1 orang: ada **`If-Match`→`412`** ATAU kolom versi di `WHERE` (uji: dua penyimpanan hampir bersamaan → yang belakangan **ditolak**, bukan menimpa diam-diam)?
- [ ] Perubahan API breaking → `/v2/` sambil `/v1/` hidup (maks 2 versi aktif) + `Sunset` **berformat tanggal HTTP** / `410` untuk endpoint yang dimatikan (bukan mengubah `/v1/` diam-diam)?

> **Verifikasi WAJIB cuma-baca**: membuktikan = baca kode + `Grep` + menalar, JANGAN jalankan SQL/perintah yang mengubah data live.

---

## 5. Definition-of-Done (kapan skill backend dianggap benar-selesai)

- [ ] **Kontrak (§1) ditulis** dulu — input/output/error+status/rahasia — untuk tiap endpoint/fungsi publik.
- [ ] **Edge case** ditangani: input kosong/0/null, payload jahat, ID milik orang lain (IDOR), bentrok tulis-serentak (race), koneksi DB putus.
- [ ] **Self-verify (§4) tercentang** dengan bukti `berkas:baris`.
- [ ] Endpoint sensitif (auth/bayar/data-pribadi) → **rak keamanan dibuka** (`skills/owasp/SKILL.md`) sebelum kontrak final.
- [ ] API yang dipakai **klien luar/pihak-ketiga** → kontrak mesin-baca (**OpenAPI** = berkas spesifikasi API yang bisa dibaca alat lain untuk membuat dokumentasi & client SDK otomatis) ditulis dan **ikut ditinjau tiap endpoint berubah**. API internal: opsional — jangan bangun yang belum dibutuhkan (YAGNI).
  - 💡 SARAN: API untuk klien luar **boleh** mempertimbangkan `application/problem+json` (**RFC 9457** = format badan-error HTTP yang baku lintas-vendor, jadi SDK/gateway pihak lain sudah mengerti bentuknya tanpa dokumentasi tambahan). API internal **tetap** pakai amplop `Err` §3 — jangan diseragamkan paksa, dua kosakata di satu API justru bikin klien menebak.
- [ ] build + lint + test lulus lokal; min 1 test happy-path + 1 alur kritis (mis. tolak akses lintas-pemilik/IDOR) diuji.

---

## 6. Handoff / rujuk-silang (reuse-first — JANGAN salin, RUJUK)

- 📐 **Login/sesi/cek-izin** (RBAC = *Role-Based Access Control* = atur izin lewat peran · IDOR mendalam) → `skills/auth/SKILL.md`.
- 📐 **Keamanan web** (CORS, SSRF, input tak-tepercaya, upload) → `skills/owasp/SKILL.md`. **Batas laju permintaan** (token-bucket, kunci per-identitas, `429` + `Retry-After`) → `skills/rate-limiting/SKILL.md`.
- 📐 **Struktur DB / migrasi aman / RLS / index** → `skills/database/SKILL.md`.
- 📐 **Anti bayar-dobel / idempotency-key** → `skills/pembayaran/SKILL.md`. **Kerja latar/antrean** → `skills/background-job/SKILL.md`. **Panggilan API luar tahan-gagal** → `skills/tahan-gagal/SKILL.md`.
- 🗃️ **LATAR — log terstruktur + `trace-id`** (nomor seri unik per-permintaan yang ikut di semua log, supaya jejak satu request bisa dirangkai lintas-layanan saat menyelidiki error — **tanpa** secret/PII, §1) → `templates/PRODUCTION_OBSERVABILITY.md`.
- 🗃️ **LATAR:** Ambang angka (status code, Core Web Vitals) = aturan inti. Rak asal skill ini hanya di riwayat git (ADR-027).
- 🗃️ **LATAR — kredit (MIT © Affaan Mustafa):** diserap dari ECC `api-design` + `backend-patterns` + `error-handling` lalu **ditulis-ulang** non-programmer & dinetralkan untuk project apa pun — aturan deprecation (`Sunset` berformat tanggal HTTP · maks 2 versi aktif · `410`), penamaan resource URL (termasuk larangan `snake_case`/tunggal), tabel semantik method HTTP + catatan PATCH-bisa-idempoten, bentuk `error.details[]`, konvensi query-param saring/urut/cari `?q=`/field bersarang, `page.has_next`, versioning lewat header sebagai gaya yang harus DIIKUTI bila project client sudah memakainya, `201`+`Location` & `204`, anti `SELECT *`, anti N+1, nama 3 lapis (Repository/Service/Middleware), hierarki error ber-tipe, dan OpenAPI sebagai butir Definition-of-Done.
- 🗃️ **LATAR — kredit (MIT © willey-labs):** butir §2.9 (Law of Demeter, OD-003) & §2.10 (`switch` berulang → tabel/factory, FN-004) diserap dari `willey-labs/agent-skills` `coding-standards`, lalu **ditulis-ulang** Bahasa Indonesia non-programmer + diturunkan posturnya jadi 📐/💡 (bukan hard-block ber-hook Python seperti aslinya — ADR-009 & ADR-013). Aturan craft yang berlaku LINTAS-bidang (fungsi kecil satu-abstraksi · anti efek-samping tersembunyi · perintah ≠ pertanyaan · early-return · konstanta bernama · wasit saat prinsip bentrok) sengaja TIDAK ditaruh di sini melainkan di kernel `AGENTS.md` §3.6–§3.9 — supaya ikut TIAP sesi, bukan hanya saat rak backend kebetulan terbuka.
- 🗃️ **LATAR — BUKAN dari ECC (asli kit):** permintaan bersyarat `ETag`/`If-None-Match`→`304` dan 🔒 `If-Match`→`412` (anti tulis saling-menimpa senyap) — ECC `api-design` tak memuatnya sama sekali; ditambahkan karena "yang belakangan menimpa diam-diam" persis kelas kerusakan SENYAP yang kit ini perangi.
- 🗃️ **LATAR — TIDAK diambil dari ECC** (bentrok 🔒 HASIL kit — jangan diusulkan ulang): tabel tarif rate-limit siap-angka (batas yang benar = hasil ukur trafik nyata) · header `X-RateLimit-*` (kit pakai draft IETF tanpa `X-`) · sparse fieldset `?fields=`/`include=` tanpa allowlist · antrean `JobQueue` in-memory (hilang tiap deploy + tak terbagi antar-instance → `skills/background-job/SKILL.md`) · `verifyToken` tanpa `algorithms`/`aud`/`iss` · `hasPermission` tanpa default-deny (peran tak dikenal = crash, bukan tolak) · penjaga izin yang **melempar** tanpa penangkap (403 jadi 500) · `retry` yang mengulang **semua** error termasuk 4xx — akarnya predikat "boleh diulang" yang **ber-default `() => true`**; di kit predikat itu WAJIB disuntik tanpa default (→ `skills/tahan-gagal/SKILL.md`) · **membuang variabel error saat membungkus** (`catch (e) { throw new AppError(...) }` tanpa `cause`) — ECC melakukannya di contoh TypeScript-nya padahal contoh Go-nya sendiri memakai `%w` dengan benar · blok `EXCEPTION WHEN OTHERS` yang mengubah gagal jadi sukses-senyap · dan blok kode 3-bahasa siap-salin.

---

## 7. Threat-model 3-baris + batas jujur

- 🗃️ **LATAR — Threat-model:** **Aset:** data user & integritas tulisan (pesanan, saldo, hak). **Penyerang:** IDOR (curi data lewat ganti ID), injeksi (SQL/command lewat input), manipulasi payload, penyalahgunaan endpoint tanpa rate-limit. **Mitigasi:** validasi boundary + parameterized query + otorisasi per-resource server-side default-deny + status/amplop konsisten + error tak-ditelan + rate-limit endpoint sensitif.
- 🗃️ **LATAR — Batas jujur:** skill ini menaikkan **lantai** kualitas & keamanan API umum; **tidak menggantikan** review keamanan mendalam untuk auth/pembayaran (buka rak owasp) maupun desain sistem terdistribusi. Cek dokumentasi framework/library **versi terpasang** (lewat alat docs/MCP mis. Context7/ref-tools, jangan andalkan ingatan) sebelum menulis kode.
