---
nama: python
deskripsi: Python (FastAPI/Django) kelas industri — validasi Pydantic di boundary, async aman, ruff/mypy/bandit, dependensi terkunci.
divisi: stack
pemicu: [python, fastapi, django, pydantic, ruff, drf, celery, pytest, serializer]
rawan_keamanan: false
menggantikan: []
---

# Skill: Python (FastAPI / Django / script) — kelas industri

> **Inti:** kode Python yang rapi berarti: `bandit` memindai rahasia yang ketinggalan di kode, type hints memberi label tipe data yang jelas, dan tiap error dicatat sebabnya lewat exception chaining (`from e`) — bukan cuma pesan generik. FastAPI/Django: router/view tetap tipis, logika berat dipindah ke service/CRUD supaya rapi & mudah diperbaiki.

---

## 1. Kontrak (yang HARUS benar — 7 pagar wajib sebelum kode Python dianggap aman)

- 🔒 **HASIL — Rahasia (secret) TAK PERNAH di-hardcode.** Ambil dari `os.environ[...]` / `python-dotenv`; jalankan **bandit** (`bandit -r src/` — pemindai keamanan statis Python) berkala untuk menangkap rahasia/pola berbahaya yang ketinggalan di kode. Detail → §2.
- 🔒 **HASIL — Error TAK BOLEH ditelan diam-diam (anti *silent failure*).** `except: pass` DILARANG; saat melempar-ulang error teknis jadi error domain sendiri, WAJIB `raise ErrorDomain(...) from e` (exception chaining = merantai error) — tanpa `from e`, jejak akar penyebab hilang dari log. Detail → §2.
- 🔒 **HASIL — Kolom yang harus unik WAJIB `UNIQUE`/unique index di DATABASE** (SQLAlchemy `unique=True`; Django `unique=True`). Tanpa constraint di level DB, penangkapan error di aplikasi TIDAK bisa mencegah data dobel saat 2 permintaan datang hampir bersamaan (balapan/*race condition*). Pola lengkap → §3.
- 🔒 **HASIL — Serializer DRF DILARANG `fields = '__all__'`; tiap endpoint FastAPI WAJIB `response_model`.** `fields = '__all__'` mengekspos SEMUA kolom termasuk `password_hash`/`is_admin`/token internal; `response_model` = pagar anti-bocor yang sama untuk FastAPI. Detail → §2.
- 🔒 **HASIL — Django produksi WAJIB setelan keamanan lengkap sebelum online** (`DEBUG=False`, HTTPS dipaksa, cookie aman, dst — daftar lengkap §3). Satu setelan lupa = pintu terbuka.
- 🔒 **HASIL — `PASSWORD_HASHERS` MD5 HANYA boleh di setelan TES, TIDAK PERNAH di `settings.py` produksi** (MD5 gampang dibobol). Detail → §2/§3.
- 🔒 **HASIL — task latar WAJIB dikirim SESUDAH transaksi commit.** `kirim_email.delay(obj.pk)` yang dipanggil DI DALAM `transaction.atomic()` bisa diambil worker **sebelum** datanya benar-benar tersimpan → task gagal "data tak ditemukan" secara ACAK (lolos di dev yang sepi, muncul di produksi saat ramai). WAJIB `transaction.on_commit(lambda: kirim_email.delay(obj.pk))`. Pola + jebakan turunannya → §3.

---

## 2. Cara rakit (prinsip — 📐 CARA BAKU, boleh diganti cara lain yang capai HASIL sama)

1. 📐 **Type hints** di fungsi publik; hindari `Any` kalau bisa spesifik; `Optional` untuk yang boleh `None`. Idiom Pythonic: `is None` (bukan `== None`), `isinstance()` (bukan `type() ==`), default argumen JANGAN mutable (`def f(x=None)`, bukan `def f(x=[])` — sumber bug klasik).
2. 📐 **Error:** dilarang `except: pass` (menelan diam-diam); tangkap spesifik + pakai context manager `with` untuk file/koneksi. **Bungkus error WAJIB `raise ErrorDomain(...) from e`** — saat menangkap error teknis lalu melemparnya ulang jadi error domain sendiri, sertakan `from e` supaya log menampilkan RANTAI sampai akar penyebab ("`ConfigError` disebabkan oleh `JSONDecodeError`"). Tanpa `from e`, jejak akar (*traceback* = catatan langkah menuju error) HILANG → debugging jadi menebak. Sepasang dengan hierarki exception domain: `class AppError(Exception)` induk, lalu `ValidationError`/`NotFoundError` turunannya (pemanggil bisa tangkap per-jenis).
3. 📐 **FastAPI:** konstruksi app di `create_app()`; router TIPIS (logika ke service/CRUD); schema request/update/response **terpisah**; DB session + auth lewat *dependencies*; `async` benar (jangan campur operasi sync-blocking di dalam `async`).
   - **Anti-blokir "event loop":** "event loop" = pengatur giliran satu-jalur yang melayani banyak permintaan bergantian; kalau SATU panggilan menahannya, SEMUA permintaan lain ngantri (gejala menipu: di dev lancar, di produksi throughput anjlok saat ramai). DB → pakai async (`await db.execute(select(Item))`), JANGAN `db.query(Item).all()` sync di route `async`. Library sync-only (`requests.get()`, olah gambar/CPU berat) → bungkus `await asyncio.to_thread(fn, arg)` (Python 3.9+) atau `loop.run_in_executor(None, fn, arg)`.
4. 📐 **Django (kalau dipakai):** cegah N+1 (`select_related`/`prefetch_related`); migrasi terversion; serializer DRF untuk API; jangan query di template.
   - 🔒 **`DRF fields = '__all__'` = bocor SEMUA kolom (termasuk rahasia).** `ModelSerializer` (penerjemah baris DB → JSON balasan API) dengan `fields = '__all__'` mengekspos SETIAP kolom — termasuk `password_hash`, `is_admin`, token internal. WAJIB: daftar kolom eksplisit (`fields = ['id', 'email', 'username']`); `read_only_fields` untuk kolom auto (`id`, `created_at`); isi konteks pemilik data di `perform_create` (`serializer.save(user=self.request.user)`), BUKAN dari body request (cegah user mengaku jadi orang lain); di Django Admin pakai `readonly_fields` untuk data sensitif.
5. 📐 **Tes:** `pytest` (+ coverage); validasi input di boundary (Pydantic/serializer), bukan di tengah logika.
6. 📐 **Supabase dari Python:** `service_role` key server-only (BYPASS RLS — *Row Level Security* = aturan level-database siapa boleh baca/tulis baris mana); RLS tetap pertahanan utama.

### Pydantic v2 (WAJIB cek versi dulu — v1 vs v2 beda API)

7. 📐 Cek versi terpasang (`pip show pydantic`) sebelum menyalin — v1↔v2 beda total (`orm_mode`→`from_attributes`, `.dict()`→`.model_dump()`, `@validator`→`@model_validator`, `BaseSettings` pindah ke paket `pydantic-settings`). Kalau project masih v1, verifikasi ke dokumentasi versi terpasang.
   - **Response schema** pakai `model_config = {"from_attributes": True}` (v1: `orm_mode = True`) supaya objek ORM langsung bisa jadi respons.
   - **Update parsial (PATCH)** pakai `payload.model_dump(exclude_unset=True)` — hanya field yang benar-benar dikirim yang diproses. Tanpa `exclude_unset`, field yang tak dikirim jadi `None` → menimpa data lama jadi kosong (bug klasik PATCH).
   - **Validasi antar-field** pakai `@model_validator(mode="after")` (mis. cek `password` == `password_confirm`).
   - **Konfigurasi aplikasi** pakai `pydantic-settings` `BaseSettings` (baca `.env` otomatis).
   - **Tiap endpoint WAJIB `response_model`** (mis. `@router.post(..., response_model=UserResponse)`) — pagar anti-bocor: field sensitif (password ter-hash, PII/data pribadi) yang tak tercantum otomatis TIDAK terkirim ke klien. (🔒 lihat §1.)
   - 🙂 Non-Programmer: `response_model` membatasi field yang boleh dikirim ke klien — hanya kolom yang didaftarkan yang keluar, sisanya (mis. password ter-acak) ditahan. `exclude_unset` untuk edit-sebagian = aturan "yang tidak diisi jangan diubah" (kalau lupa, kolom kosong malah menghapus isi lama).

### Django produksi — cek versi dulu

8. 📐 Cek versi: `SECURE_BROWSER_XSS_FILTER` sudah **usang/tak berefek di Django 4.0+** — JANGAN pakai. Nama setelan lain stabil di Django 3-5. Daftar setelan keamanan lengkap + kode → §3. Plus: JANGAN `@csrf_exempt` kecuali endpoint webhook yang memverifikasi tanda-tangan pengirim.
   - 🔒 **`CSRF_COOKIE_HTTPONLY = True` JANGAN dipasang kalau ada AJAX/`fetch`.** `HttpOnly` justru MENGHALANGI JavaScript membaca cookie `csrftoken` — padahal itu tepat yang dibutuhkan untuk mengisi header `X-CSRFToken`. Hasilnya semua POST dari browser tumbang 403. Dokumentasi Django sendiri menyarankan JANGAN. (Pagar CSRF-nya bukan `HttpOnly`, tapi `SameSite` + `CSRF_TRUSTED_ORIGINS`.)
   - 📐 **Nilai Python ke dalam `<script>` pakai `{{ x|json_script:"id" }}`, BUKAN `{{ x|escapejs }}`.** `escapejs` **tidak** menambahkan tanda kutip, jadi `var n = {{ nama|escapejs }};` menghasilkan JavaScript rusak (`var n = budi;` → error) dan menyesatkan orang menganggap sudah aman. `json_script` menulis nilainya sebagai JSON di elemen terpisah, lalu dibaca `JSON.parse(document.getElementById('id').textContent)`.
   - 📐 **DRF: pengunjung anonim dapat `403`, BUKAN `401`, kalau `SessionAuthentication` aktif** (401 hanya keluar bila ada skema yang mengirim `WWW-Authenticate`, mis. `TokenAuthentication`). Jangan menulis tes yang meng-assert 401 tanpa memeriksa `DEFAULT_AUTHENTICATION_CLASSES` project ini dulu.
   - 📐 **`python manage.py check --deploy` = pemeriksa CUMA-BACA** yang menyisir setelan produksi (DEBUG, cookie, HSTS) dan tak menyentuh data. Jalankan sebelum online; ia menangkap setelan lupa lebih cepat daripada membaca `settings.py` baris per baris.
   - 🙂 Non-Programmer: empat hal di atas = jebakan yang gejalanya menipu. Satu setelan cookie yang terlihat "lebih aman" justru bisa membuat semua tombol simpan gagal; satu penyaring teks yang terlihat aman justru menghasilkan halaman rusak. Perintah `check --deploy` = pemeriksa otomatis yang hanya MELIHAT, tak mengubah apa pun.

### Tes Django cepat: `factory_boy` (data uji) + setelan tes ngebut

9. 📐 **Data uji pakai `factory_boy`** (ganti bikin objek manual berulang): `DjangoModelFactory` + `Sequence` (nilai unik anti-tabrakan, mis. `email = factory.Sequence(lambda n: f"user{n}@example.com")`), `Faker` (data realistis), `SubFactory` (relasi otomatis), `UserFactory.create_batch(10)`.
10. 📐 **Suite ngebut:** `pytest.ini` `addopts = --reuse-db --nomigrations` (jangan bangun-ulang skema tiap run) + DB test `sqlite :memory:` + `CELERY_TASK_ALWAYS_EAGER = True` (task jalan langsung tanpa worker). 🔒 `PASSWORD_HASHERS` MD5 HANYA di setelan TES ini — lihat §1, JANGAN PERNAH ke `settings.py` produksi.
    - 🚨 **Batas yang WAJIB disadari (jangan diklaim lebih):** `sqlite :memory:` + `--nomigrations` itu CEPAT tapi **bukan cermin produksi**. Beda perilaku nyata di: `CheckConstraint`/constraint DB, `JSONField`, transaksi bersarang, dan `icontains` (SQLite tak peka huruf-besar, Postgres peka) — jadi tes bisa HIJAU sementara produksi gagal. Dan `--nomigrations` berarti **berkas migrasi yang rusak TAK PERNAH teruji**. Jalur kritis (login/bayar/data) + migrasi WAJIB diuji sekali di engine yang SAMA dengan produksi (mis. Postgres di CI), bukan cuma SQLite lokal.
    - 🙂 Non-Programmer: `factory` menghasilkan data uji otomatis (sekali atur, ratusan data contoh langsung tersedia); setelan tes cepat = tes ratusan skenario dalam hitungan detik, bukan menit. MD5 (kunci lemah, sengaja dipakai biar cepat) hanya boleh dipakai di setelan tes — tidak boleh dipakai di produksi. Tapi tes cepat itu memakai database "mini" yang tak sama dengan yang asli — jadi bagian penting (login/bayar/data) tetap harus dicoba sekali di database yang sesungguhnya.
11. 📐 **Buktikan N+1 hilang dengan HITUNGAN query, bukan dengan mata:** `django_assert_num_queries` (pytest-django) atau `assertNumQueries` (Django `TestCase`) mengunci berapa query yang boleh jalan di satu endpoint — mis. `with django_assert_num_queries(3): client.get(url)`. Tanpa ini, `select_related`/`prefetch_related` yang lupa dipasang cuma terasa "agak lambat" dan lolos review, lalu jadi insiden saat data membesar.
12. 📐 **Gerbang `coverage` WAJIB bergigi:** `--cov` saja hanya MELAPORKAN angka. Tambah `--cov-fail-under=<angka project ini>` supaya cakupan yang turun benar-benar MENGGAGALKAN perintah tes; tanpa itu angkanya hiasan yang tak pernah menahan apa pun. Angka targetnya keputusan project — jangan tempel angka dari panduan luar.
    - 🙂 Non-Programmer: dua hal ini mengubah "laporan" jadi "penjaga". Menghitung query = otomatis ketahuan kalau kode baru membuat halaman jadi lambat. Gerbang bergigi = tesnya benar-benar GAGAL kalau ada bagian yang tak diperiksa, bukan cuma mencetak angka lalu lanjut.
13. 💡 SARAN: project yang sudah pakai `ruff` (linter cepat) / `mypy` (pemeriksa tipe statis) → masukkan ke rangkaian pemeriksa sebelum kirim, dijalankan sesuai konfigurasi project (`pyproject.toml`/`ruff.toml`/`mypy.ini`) — cek dokumentasi versi terpasang sebelum menaruh flag di CI, jangan menebak flag dari ingatan.

🙂 **Non-Programmer (ringkasan):** kode Python diperiksa otomatis — cek rahasia (`bandit`), tulisan rapi (type hints), error tak ditelan diam-diam. FastAPI: router tipis, kerja berat di service — biar rapi & mudah diperbaiki.

---

## 3. Powerful — pola siap-adaptasi (ambil polanya, JANGAN salin mentah)

### Cek unik: andalkan constraint DB, JANGAN precheck SELECT-lalu-INSERT (anti balapan 2-klik)

🗃️ LATAR: "Balapan" (*race condition*) = 2 permintaan masuk hampir bersamaan; keduanya lolos pengecekan lalu sama-sama menyimpan → data dobel. Kelas bug yang LOLOS semua tes biasa (tes jalan 1 permintaan) tapi muncul di produksi saat ramai.

🚨 **SYARAT MUTLAK:** kolom yang harus unik WAJIB punya `UNIQUE`/unique index di DB (SQLAlchemy `unique=True`; Django `unique=True`). Tanpa ini, penangkapan error di aplikasi TIDAK bisa mencegah dobel.

🧪 **CONTOH KASUS** — JANGAN `get_by_email()` dulu lalu insert (ada jeda antara cek & simpan — 2 request bisa lolos bareng). Langsung `add()` + `commit()`, tangkap `IntegrityError` → `rollback()` + `raise DuplicateError`. Biarkan constraint di DB (atomik) yang mencegah data dobel.

```python
# SQLAlchemy (async) — andalkan constraint, bukan precheck
from sqlalchemy.exc import IntegrityError
self.db.add(user)
try:
    await self.db.commit()
except IntegrityError as exc:
    await self.db.rollback()
    raise DuplicateUserError from exc   # 'from exc' = simpan jejak error asli
```

```python
# Django — pola sama
from django.db import IntegrityError, transaction
try:
    with transaction.atomic():
        user = User.objects.create(email=email, ...)
except IntegrityError as exc:
    raise DuplicateUserError() from exc
```

🙂 Non-Programmer: jangan cek dulu data kosong baru simpan — 2 permintaan bisa sama-sama lolos cek lalu bentrok. Biarkan aturan UNIK di database yang menolak data dobel, bukan pengecekan di aplikasi.

| Anti-pola | Perbaikan |
|---|---|
| `SELECT ... WHERE email=?` lalu `INSERT` kalau kosong | langsung `INSERT`/`add()`, tangkap `IntegrityError` |
| Andalkan cek aplikasi TANPA `UNIQUE` di DB | pasang `UNIQUE`/unique index dulu (DB yang menegakkan, atomik) |
| `except: pass` menelan `IntegrityError` | terjemahkan ke `DuplicateError` + pesan awam |

### Django produksi — setelan keamanan WAJIB sebelum online (`settings.py`)

> Cek versi: `SECURE_BROWSER_XSS_FILTER` sudah **usang/tak berefek di Django 4.0+** — JANGAN pakai. Nama setelan lain stabil di Django 3-5.

🧪 **CONTOH KASUS** — daftar setelan keamanan produksi:
```python
DEBUG = False                                 # 🚨 JANGAN True di produksi (bocor traceback + setelan)
SECRET_KEY = os.environ["DJANGO_SECRET_KEY"]  # dari env; kalau kosong -> ImproperlyConfigured (fail-fast)
ALLOWED_HOSTS = os.environ["ALLOWED_HOSTS"].split(",")
SECURE_SSL_REDIRECT = True                    # paksa HTTPS
SECURE_HSTS_SECONDS = 31536000                # 1 tahun
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SESSION_COOKIE_SECURE = True; CSRF_COOKIE_SECURE = True    # cookie hanya via HTTPS
SESSION_COOKIE_HTTPONLY = True; SESSION_COOKIE_SAMESITE = "Lax"
CSRF_TRUSTED_ORIGINS = ["https://app.contoh.com"]
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"                       # cegah clickjacking (situs dibingkai iframe jahat)
PASSWORD_HASHERS = ["django.contrib.auth.hashers.Argon2PasswordHasher", ...]  # Argon2 di posisi 1
```
Plus: JANGAN `@csrf_exempt` kecuali endpoint webhook yang memverifikasi tanda-tangan pengirim.

🙂 Non-Programmer: daftar setelan keamanan WAJIB diaktifkan sebelum situs dibuka untuk umum — paksa HTTPS, amankan cookie, sembunyikan mode-debug, ambil kunci rahasia dari environment variable (env) bukan ditulis di kode. Satu setelan yang terlewat = celah keamanan.

### Jebakan ORM Django (hilang-data & salah-diam)

🧪 **CONTOH KASUS:**

| Jebakan | Akibat | Perbaikan |
|---|---|---|
| `bulk_create([...])` tanpa `update_conflicts`/`ignore_conflicts` | baris bentrok unique-key DIAM-DIAM hilang | `bulk_create(objs, update_conflicts=True, unique_fields=[...], update_fields=[...])` (Django 4.1+) |
| `save()` tanpa `update_fields` | menimpa SEMUA kolom → 2 request barengan saling menghapus | `obj.save(update_fields=["status"])` |
| `.get(...)` tanpa handle `DoesNotExist` | 500 error tak tertangani | `try/except Model.DoesNotExist` atau `get_object_or_404` |
| `len(queryset)` untuk hitung | tarik SEMUA baris ke memori | `queryset.count()` |
| `if queryset:` untuk cek ada | eksekusi + cache seluruh queryset | `queryset.exists()` |
| `RunPython` tanpa `reverse_code` | migrasi tak bisa di-rollback | sertakan `reverse_code` (atau `migrations.RunPython.noop`) |
| 🔒 `tugas.delay(...)` dipanggil DI DALAM `transaction.atomic()` | worker mengambil task sebelum commit → gagal "data tak ditemukan" **acak** (dev sepi lolos, produksi ramai muncul) | `transaction.on_commit(lambda: tugas.delay(obj.pk))` |
| `select_for_update()` di LUAR `transaction.atomic()` | `TransactionManagementError` — kuncinya tak pernah terpasang | bungkus `with transaction.atomic():` dulu, baru `select_for_update()` |
| kirim **objek model** ke task latar (`tugas.delay(obj)`) | objeknya sudah BASI saat task jalan (nilai lama menimpa yang baru) | kirim kunci saja: `tugas.delay(obj.pk)`, lalu muat ulang di dalam task |

🙂 Non-Programmer: perintah "borongan" (`bulk_create`) bisa diam-diam membuang baris berkode kembar; simpan-polos (`save()`) menimpa seluruh baris — sebut kolom yang diedit biar tak menimpa perubahan yang sedang dilakukan pengguna lain secara bersamaan. Tiga baris terakhir soal "pekerjaan latar": kalau tugas dikirim terlalu cepat (sebelum data tersimpan) atau membawa salinan data lama, hasilnya gagal acak — susah dilacak karena di komputer sendiri sering lolos.

### Error migrasi Django — tabel obat (JANGAN hapus file migrasi)

> 2 prinsip keras: (1) **JANGAN pernah HAPUS file migrasi** yang sudah jalan — "fake"-kan (`--fake`); menghapus = merusak riwayat di lingkungan lain. (2) **SELALU `python manage.py check`** sesudah beres.

🧪 **CONTOH KASUS:**

| Error | Sebab | Obat |
|---|---|---|
| `InconsistentMigrationHistory` | migrasi jalan tak urut | `migrate --fake <app> <migrasi>` / squash |
| `Multiple leaf nodes in the migration graph` | 2 cabang migrasi | `python manage.py makemigrations --merge` |
| `Table already exists` | tabel ada, migrasi awal belum tercatat | `migrate --fake-initial` |
| kolom/tabel "tak ada" saat query | migrasi belum dijalankan | `python manage.py migrate` |

🔴 **DEV-ONLY (menghapus data app):** reset total `migrate <app> zero` → `makemigrations` → `migrate`. JANGAN di staging/produksi. (Prisma padanan: `prisma migrate resolve --applied <nama>` untuk menandai migrasi yang sudah terlanjur jalan.)

🙂 Non-Programmer: error migrasi berarti catatan perubahan database jadi tidak sinkron. Aturan: JANGAN hapus file migrasi — tandai `--fake` (sudah dijalankan), lalu cek ulang.

---

## 4. Self-verify (sangkal diri sendiri SEBELUM bilang "selesai")

- [ ] Rahasia diambil dari env/`python-dotenv` (tak ada hardcode); `bandit -r src/` sudah dijalankan?
- [ ] Tak ada `except: pass`; error yang dilempar-ulang pakai `raise ErrorDomain(...) from e`?
- [ ] Kolom unik punya `UNIQUE`/unique index di DB (bukan cuma precheck `SELECT` di aplikasi)?
- [ ] `IntegrityError` ditangkap + diterjemahkan ke error domain (`DuplicateError`), bukan ditelan?
- [ ] FastAPI: `async` tak dicampur operasi sync-blocking (DB pakai `await`, kerja CPU/sync dibungkus `asyncio.to_thread`)?
- [ ] Tiap endpoint FastAPI punya `response_model`; serializer DRF **tak pernah** `fields = '__all__'`?
- [ ] Pydantic: versi terpasang dicek (v1 vs v2); PATCH pakai `exclude_unset=True`?
- [ ] Django produksi: `DEBUG=False` + daftar setelan keamanan §3 lengkap; `PASSWORD_HASHERS` MD5 **hanya** di setelan tes?
- [ ] Migrasi Django: tak ada file migrasi yang dihapus; `python manage.py check` lulus (produksi: `check --deploy` juga)?
- [ ] Tiap `tugas.delay(...)` di dalam transaksi dibungkus `transaction.on_commit`, dan yang dikirim **kunci** (`obj.pk`), bukan objek model?
- [ ] `select_for_update()` selalu berada di dalam `transaction.atomic()`?
- [ ] Django+AJAX: `CSRF_COOKIE_HTTPONLY` **tidak** dipasang; nilai ke `<script>` pakai `json_script` (bukan `escapejs`)?
- [ ] Endpoint yang rawan N+1 dikunci hitungan query (`django_assert_num_queries`/`assertNumQueries`)?
- [ ] `pytest` (+ coverage ber-`--cov-fail-under`) lulus; validasi input di boundary (Pydantic/serializer)?
- [ ] Jalur kritis + migrasi diuji di engine DB yang SAMA dengan produksi (bukan cuma SQLite `:memory:`)?

> **Verifikasi WAJIB cuma-baca**: membuktikan = baca kode + jalankan `bandit`/`pytest` (cuma-periksa) + menalar, JANGAN jalankan migrasi destruktif di lingkungan hidup.

---

## 5. Definition-of-Done (kapan skill Python dianggap benar-selesai)

- [ ] **Kontrak (§1) terpenuhi:** 7 pagar (rahasia, error tak ditelan, unique constraint DB, anti-bocor field, setelan produksi Django, MD5 hanya di tes, task latar sesudah commit).
- [ ] **Edge case** ditangani: 2 request barengan mendaftar email sama (balapan), PATCH tanpa `exclude_unset` menghapus data, migrasi jalan tak urut, endpoint tanpa `response_model` bocor field sensitif, task latar jalan sebelum commit ("data tak ditemukan" acak).
- [ ] **Self-verify (§4) tercentang** dengan bukti `berkas:baris`.
- [ ] `bandit -r src/` + `pytest` (+ coverage) lulus lokal; kalau project pakai `ruff`/`mypy`, keduanya juga lulus.

---

## 6. Handoff / rujuk-silang (reuse-first — JANGAN salin, RUJUK)

- 📐 **Kalau yang dibangun API** (desain kode status, bentuk respons, versi endpoint) — **jangan dirancang ulang di sini** → `skills/backend/SKILL.md`.
- 📐 **Keamanan web mendalam** (IDOR, rate-limit, CORS, SSRF, input tak-tepercaya) → `skills/owasp/SKILL.md`.
- 📐 **Login/sesi/cek-izin** (RBAC, alur auth) → `skills/auth/SKILL.md`.
- 📐 **Struktur DB / migrasi aman umum / RLS / index** (di luar jebakan ORM Django spesifik di §3) → `skills/database/SKILL.md`.
- 📐 **Kerja latar/antrean** (Celery dan sejenisnya) → `skills/background-job/SKILL.md`.
- 📐 **Panggilan API luar tahan-gagal** (retry/backoff/circuit-breaker) → `skills/tahan-gagal/SKILL.md`.
- 📐 **Supabase dari sisi Python** (RLS, `service_role`) → `skills/supabase-prisma/SKILL.md` untuk konsep umum RLS lintas-stack.
- 🗃️ **LATAR — kredit (MIT © Affaan Mustafa):** cek-unik anti-balapan, exception chaining, anti-blokir event loop, Pydantic v2, penjaga serializer DRF, setelan produksi + jebakan ORM + error migrasi + tes cepat Django diadaptasi dari skill/agen ECC v2.0.0 `fastapi-patterns`, `python-patterns`, `django-reviewer`, `django-security`, `django-build-resolver`, `django-tdd`, `python-testing` (ditulis-ulang non-programmer + dinetralkan). Gelombang 2026-07-27: "kirim `obj.pk` bukan objek model" diserap dari `django-celery`.
- 🗃️ **LATAR — ASLI kit (BUKAN dari sumber luar, jangan salah-kreditkan):** `transaction.on_commit` sebelum enqueue task (§1/§3 — ECC `django-celery` nol sebutan, ia justru cuma menambal gejalanya), pengunci hitungan query `assertNumQueries`/`django_assert_num_queries` (§2 — nol di kedua belah pihak; ECC hanya menyarankan periksa N+1 MANUAL lewat Debug Toolbar), `--cov-fail-under` sebagai gerbang bergigi, koreksi `CSRF_COOKIE_HTTPONLY` + `escapejs`→`json_script` + DRF 403-bukan-401 (ketiganya membetulkan nasihat ECC yang salah/kontradiktif), dan peringatan paritas SQLite-tes vs Postgres-produksi.

---

## 7. Threat-model 3-baris + batas jujur

- 🗃️ **LATAR — Threat-model:** **Aset:** data user (kolom sensitif lewat serializer/response) & integritas database (unik, migrasi). **Mode-gagal khas:** rahasia ke-commit ke kode, error `except: pass` menyembunyikan kegagalan, dua request barengan lolos precheck lalu dobel-insert, serializer `__all__` mengekspos `password_hash`, Django online dengan `DEBUG=True`/cookie tak aman, file migrasi terhapus merusak riwayat lingkungan lain. **Mitigasi:** `bandit` + env untuk rahasia, exception chaining `from e`, `UNIQUE` di DB + tangkap `IntegrityError`, `response_model`/kolom eksplisit, daftar setelan keamanan `settings.py` produksi, `--fake` bukan hapus migrasi.
- 🗃️ **LATAR — Batas jujur:** skill ini menaikkan **lantai** keandalan & keamanan kode Python (FastAPI/Django); **tidak menggantikan** review keamanan mendalam untuk auth/pembayaran (buka `skills/owasp/SKILL.md`) maupun load-testing untuk skala tinggi. Pydantic v1↔v2 dan setelan Django berubah antar-versi — selalu cek versi terpasang sebelum menyalin.

🙂 **Non-Programmer:** kode Python diperiksa otomatis — cek rahasia (`bandit`), tulisan rapi (type hints), error tak ditelan diam-diam (dicatat sebabnya, bukan cuma "gagal"). FastAPI/Django: router/view tipis, kerja berat di service — biar rapi & mudah diperbaiki. Django yang mau dibuka ke publik punya daftar setelan keamanan wajib diaktifkan; satu yang terlewat = celah keamanan.
