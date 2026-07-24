---
nama: react-patterns
deskripsi: Pola & performa React kelas industri — anti-waterfall, bundle ramping, re-render minimal, key stabil, tes komponen jujur, race fetch, Motion anti-CLS, compound components + custom hooks.
divisi: stack
pemicu: [react, react-patterns, react-testing-library, react-useeffect, framer-motion, react-animasi, custom-hooks, compound-components, tanstack-query, react-query, use-memo, use-callback]
rawan_keamanan: false
menggantikan: []
---

# Skill: Pola & Performa React — kelas industri

> **Kapan skill ini aktif:** deteksi config — paket `react`/`next` terpasang, berkas `*.tsx`. Teks "react/hooks/react-query/framer-motion/testing-library" jadi pemicu sekunder. Skill ini paket pola React DI ATAS standar inti (§5/§10); batas Server/Client & keamanan Next.js dipisah ke `skills/next-core/SKILL.md`, aksesibilitas ke `skills/a11y/SKILL.md`.
>
> 🙂 **Analogi:** ini **bagian finishing bengkel** — memastikan mobil (aplikasi) cepat menyala (performa), robot QC-nya (tes) tak asal bilang "lulus", data di layar tak "ketuker" gara-gara dua permintaan balapan, dan gerak/tampilannya halus tanpa bikin layar "meloncat".

Skill ini **advisory** (§4.17): otak native yang memutuskan adopsi/adaptasi/abaikan tiap 📐/💡. Butir **🔒 HASIL** = hasil yang tak boleh gagal. Cek **versi paket terpasang** dulu (§8.2 A3) sebelum menyalin pola apa pun — API `MSW`/`userEvent`/`motion`/React Query/Tailwind berubah antar-versi & jadi sumber #1 kode yang "kelihatan benar tapi tak nyambung".

---

## 1. Kontrak (yang HARUS benar — hasil yang tak boleh gagal)

- 🔒 **HASIL — Tes komponen tak boleh "lolos palsu" (false-green).** Tes yang mencari elemen lewat struktur DOM internal (bukan yang user LIHAT/pakai), menunggu pakai `setTimeout` tebak-tebakan, atau membiarkan request jaringan tak ter-*mock* lolos diam-diam — semuanya bisa tampak HIJAU padahal fitur aslinya rusak. Robot QC yang bohong lebih berbahaya daripada tak ada robot QC.
- 🔒 **HASIL — Respons `fetch` yang datang terlambat tak boleh menimpa data terbaru.** `useEffect` yang memanggil API tanpa pembatalan (`AbortController`) bisa membuat balapan: permintaan LAMA yang selesai belakangan menimpa hasil BARU yang sudah tampil — user melihat data salah tanpa ada error.
- 🔒 **HASIL — Animasi/layout tak boleh membuat halaman "meloncat" (CLS) atau mengunci teks di satu ukuran.** CLS (*Cumulative Layout Shift* = skor seberapa sering tata letak bergeser) adalah Ambang Profesional wajib (CLS < 0,1, §1b, Core Web Vitals). Teks yang ukurannya HANYA terikat lebar layar (`vw` murni) gagal ikut membesar saat user menaikkan ukuran font default browser/OS — melanggar WCAG 2.2 SC 1.4.4, pengguna low-vision terkunci.

---

## 2. Cara rakit (📐 CARA BAKU / 💡 SARAN — boleh diganti cara lain yang capai HASIL sama)

### A. Performa — anti-waterfall (paling berdampak: ambil-data berurutan = pembunuh #1 kecepatan)

1. 📐 Data yang TIDAK saling bergantung pakai `Promise.all([...])` (paralel), bukan `await` berturut-turut. Server Components: pecah jadi child component agar React jalan paralel. 🙂 titip 3 GoFood sekaligus, bukan pesan 1 → tunggu → baru ke-2.
2. 📐 Cek syarat MURAH (props/env/flag) DULU sebelum `await` data jarak-jauh (`if (!id) return null` di awal); geser `await` ke cabang yang BENAR-BENAR pakai datanya. `<Suspense>` dekat data biar halaman tampil sebagian (sisakan ruang skeleton agar layout tak loncat).

### B. Ukuran bundle (JS halaman pertama)

3. 📐 import LANGSUNG dari path (`@/components/Button`), JANGAN barrel-import (`@/components`) — barrel paksa bundler telusuri seluruh modul (boros 200-800ms). `import()` dinamis WAJIB statis-bisa-dianalisa (cabang eksplisit, jangan `import(\`./pages/${name}\`)`).
4. 📐 Komponen berat (chart, editor, peta) muat via `dynamic(...)` (`ssr: false`) — di-download saat dibutuhkan; skrip pihak-ketiga (analytics, chat) muat SETELAH interaktif (`next/script` `strategy="afterInteractive"`/`"lazyOnload"`).

### C. Re-render (gambar-ulang berlebihan = interaksi berat)

5. 📐 **TURUNKAN nilai saat render** (`const full = \`${first} ${last}\``), JANGAN simpan di `state` lewat `useEffect` (render dobel + flicker). 🙂 hitung langsung saat butuh, jangan simpan salinan gampang basi (mirip rumus Excel).
6. 📐 PENTING (data/render): perbarui `state` dengan SALINAN baru (`setItems([...items, baru])`, `setUser({...user, name})`) — JANGAN mutasi objek lama lalu `setState` objek yang sama; React membandingkan referensi, mutasi di tempat bisa GAGAL memicu render. `Array.sort()`/`reverse()` mengubah aslinya → salin dulu (`[...arr].sort()`). 🙂 edit "fotokopinya", jangan corat-coret lembar asli.
7. 💡 RAPIKAN: JANGAN definisikan komponen DI DALAM komponen lain (`const Inner = ...` di body `Outer`) — tiap render bikin tipe baru, anaknya ikut bongkar-pasang. Update tak-mendesak (filter, pencarian) bungkus `startTransition`/`useDeferredValue`. `useMemo` untuk komputasi mahal, `useCallback` untuk fungsi yang dioper ke child ber-`React.memo` — **jangan** taburkan di mana-mana (biaya sendiri).

### D. Rendering & list panjang

8. 📐 PENTING (integritas data): `key` di `.map()` WAJIB stabil-unik antar-saudara — pakai id database (`key={row.id}`), JANGAN posisi array (`key={index}`) untuk list yang bisa di-urut-ulang/disisipi/dihapus. `index` bikin React salah-cocokkan baris → state anak (isi `<input>`, centang checkbox, fokus) NEMPEL ke baris SALAH, tanpa error. 🙂 beri tiap baris "NIP tetap" dari database, bukan nomor-urut.
9. 💡 RAPIKAN: list ratusan baris → `content-visibility: auto` (lewati render baris di luar layar). Render kondisional pakai ternary (`count > 0 ? <Badge/> : null`), JANGAN `{count && <Badge/>}` — `0` bisa muncul jadi teks "0".

### E. Tes komponen React (RTL — React Testing Library)

> 📐 **WAJIB cek versi terpasang dulu (§8.2):** MSW v1→v2 breaking (`rest`→`http`, `res(ctx.json)`→`HttpResponse.json`); `userEvent` v13→v14 (wajib `setup()`); `jest-axe` (Jest) vs `vitest-axe` (Vitest).

10. 📐 **Prioritas query: `getByRole` > `getByLabelText` > `getByPlaceholderText` > `getByText` > `getByTestId`** — uji yang user LIHAT/pakai, bukan DOM internal. `userEvent.setup()` + SELALU `await`. Async pakai `findBy*`/`waitFor`, JANGAN `setTimeout` (flaky #1). Mock jaringan pakai MSW `onUnhandledRequest: 'error'` (request tak ter-mock → MERAH keras, lihat 🔒 §1). Gotcha `renderHook` + React Query: buat `QueryClient` **SEKALI di luar** wrapper.

### F. Race fetch, debounce & data-fetching

11. 📐 Utamakan **SWR/TanStack Query** untuk data (dedup + cache + revalidate). Kalau TERPAKSA gulung sendiri `useEffect`+`fetch`: **WAJIB `AbortController` + `return () => controller.abort()`** — batalkan request lama saat `deps` ganti/unmount (tanpa cleanup: respons lama menimpa baru → balapan 🔒 §1). Set-state pakai **functional updater** `setX(prev => ...)` (anti nilai-basi di async). `<ErrorBoundary>` HANYA menangkap error render/lifecycle — BUKAN event handler/`fetch().then` (untuk itu `try/catch` + set-state).
12. 📐 **Debounce search-as-you-type.** JANGAN tembak query tiap ketikan — turunkan `debouncedQuery` lewat `useDebounce(value, 300-500ms)` lalu fetch HANYA saat debounce berubah. GOTCHA: SWR/TanStack Query TIDAK men-debounce (tiap huruf = cache-key beda = tetap 1 hit DB) → debounce DULU baru serahkan ke Query. Pasangkan `AbortController` + guard panjang minimal. 🙂 tunggu ~⅓ detik user berhenti mengetik baru cari.

### G. Motion (animasi Framer / `motion`) — anti-CLS & anti-glitch

> 📐 **Cek versi (§8.2):** paket lama `framer-motion` kini `motion` (`npm install motion`, impor `motion/react`) — API bergeser; JANGAN campur keduanya.

13. 📐 **`AnimatePresence` `mode` WAJIB eksplisit** — default `"sync"` bikin glitch tumpang-tindih; modal/toast → `mode="wait"`, list/tab → `mode="popLayout"`. Tiap child `key` unik.
14. 📐 **Animasikan HANYA `transform` + `opacity`** (murah, GPU) — JANGAN `width/height/top/left` (memicu re-layout + **CLS** 🔒 §1). `will-change` pasang SESAAT sebelum animasi (mis. `onMouseEnter`) lalu HAPUS (`onAnimationEnd`), jangan permanen/massal (memori GPU bengkak, parah di HP RAM kecil). Motion tokens terpusat + `stagger` ≤ 0.1s + hormati `navigator.deviceMemory <= 2` & `prefers-reduced-motion` (`skills/a11y/SKILL.md`). SSR App Router: komponen beranimasi WAJIB `"use client"` + `initial` eksplisit (cegah hydration-mismatch).

### H. Jebakan CSS layout, viewport & poles rapi (mobile-first + CWV)

15. 📐 **Full-height HP: JANGAN `100vh` polos — berlapis.** `height: 100vh; height: 100dvh;` (`dvh` = tinggi yang benar-benar terlihat). Overlay/modal yang tak boleh geser → `svh` (paling aman, tak resize). Tailwind `h-dvh`/`min-h-dvh` (butuh Tailwind ≥3.4). 🙂 di HP, `100vh` menipu — bagian bawah hero/tombol ketutup bilah alamat.
16. 📐 **Grid kartu responsif tanpa media query:** `grid-template-columns: repeat(auto-fit, minmax(min(100%, 250px), 1fr))` — BUKAN `minmax(250px, 1fr)` polos (yang meluber → scrollbar horizontal, langgar WCAG Reflow `skills/a11y/SKILL.md` #10).
17. 📐 **Fluid type `clamp()` + jebakan a11y (Resize Text, WCAG 1.4.4 🔒 §1).** JANGAN satuan viewport MURNI di nilai tengah (`clamp(1rem, 5vw, 2rem)`) — teks tak ikut membesar saat user menaikkan font default → gagal WCAG. Selalu sisipkan `rem`: `clamp(1rem, 0.9rem + 0.6vw, 1.5rem)`. `min` teks-isi ≥ ~1rem.
18. 📐 **Gotcha:** minus langsung di depan fungsi CSS (`right: -clamp(...)`) = nilai TAK SAH, dibuang browser diam-diam (bug hening) → bungkus `calc(-1 * clamp(...))`. **Angka berubah** (harga/saldo/timer) pakai `font-variant-numeric: tabular-nums` (anti-geser). **JANGAN `transition: all`** — sebut properti eksplisit (`transition-property: transform, box-shadow`).

### I. Komponen & hook yang bisa dipakai-ulang (serapan ECC)

19. 📐 **Compound components** (Tabs/Accordion/Menu) — bagi state lewat Context ke sub-komponen, bukan prop-drilling berlapis. Induk pegang state; anak (`Tabs.List`, `Tabs.Panel`) konsumsi Context. 🙂 satu "papan induk" pegang saklar, tiap bagian tinggal colok.
20. 📐 **Custom hooks** untuk logika berulang: `useToggle` (boolean + fungsi balik), `useDebounce` (§F butir 12), `useQuery` (fetch + loading/error). Ekstrak logika, bukan tampilan.
21. 📐 **🔒 HASIL — Jebakan infinite-loop `useQuery`/`useEffect` (unstable dependency).** Kalau fetcher/opsi dioper sebagai fungsi-inline atau object-literal, tiap render bikin referensi BARU → efek yang bergantung padanya jalan lagi → set-state → render lagi → **loop fetch tak berujung** (bisa jatuhkan API/tagihan membengkak). Perbaiki: simpan fetcher/opsi terbaru di `useRef` (di-update via `useEffect` sebelum efek fetch), supaya `refetch` tetap **stabil-referensi** walau caller mengoper literal. Alternatif: bungkus dengan `useMemo`/`useCallback` di sisi caller, atau serahkan ke TanStack Query (query key sebagai array primitif stabil). 🙂 jangan bikin "kunci" baru tiap detik — mesin pencarian jadi bolak-balik tak berhenti.

---

## 3. Powerful — 🧪 pola siap-adaptasi (ambil polanya, cek versi paket dulu)

🧪 **`AbortController` di `useEffect` (§F):**
```tsx
useEffect(() => {
  const c = new AbortController()
  fetch(url, { signal: c.signal })
    .then(handleResponse)
    .catch(e => { if (e.name !== 'AbortError') setError(e) })  // AbortError = batal normal; error NYATA → set-state
  return () => c.abort()
}, [url])
```

🧪 **`useDebounce` (§F):**
```tsx
function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const h = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(h)              // RESET timer tiap ketikan baru
  }, [value, delay])
  return debounced
}
```

🧪 **`useQuery` stabil-referensi — cegah infinite-loop (§I butir 21):**
```tsx
function useQuery<T>(fetcher: () => Promise<T>, opts?: object) {
  const fetcherRef = useRef(fetcher); const optsRef = useRef(opts)
  useEffect(() => { fetcherRef.current = fetcher; optsRef.current = opts })  // simpan yang terbaru
  const refetch = useCallback(() => fetcherRef.current(), [])               // STABIL walau caller oper literal
  useEffect(() => { refetch().then(setData).catch(setError) }, [refetch])   // TIDAK loop: refetch tak berubah
}
```

🧪 **Compound component (Tabs + Context, §I butir 19):**
```tsx
const TabsContext = createContext<TabsContextValue | undefined>(undefined)
export function Tabs({ children, defaultTab }: { children: React.ReactNode; defaultTab: string }) {
  const [activeTab, setActiveTab] = useState(defaultTab)
  return <TabsContext.Provider value={{ activeTab, setActiveTab }}>{children}</TabsContext.Provider>
}
// Tabs.List / Tabs.Tab / Tabs.Panel konsumsi useContext(TabsContext) — tanpa prop-drilling
```

🧪 **`dvh`/`svh` + minus `calc` (§H):**
```css
.hero    { height: 100vh; height: 100dvh; }  /* section penuh: ikut bilah URL */
.overlay { height: 100svh; }                 /* modal/overlay: tinggi teraman, tak loncat */
.badge   { right: calc(-1 * clamp(28px, 3.5vw, 44px)); } /* ✅ minus dibungkus calc */
```

### Peta Web Vitals → kategori perbaikan (pakai saat audit Lighthouse)

| Metrik (Lighthouse) | Lihat bagian di atas |
|---|---|
| **LCP** (konten utama muncul) | A Anti-waterfall · B Bundle |
| **INP** (respons saat diklik) | C Re-render · D Rendering |
| **CLS** (layout loncat) | D Rendering + G Motion (`<Suspense>` + sisakan ruang, set dimensi gambar) |
| **TBT** (waktu blokir) | B Bundle · tunda skrip pihak-ketiga |

---

## 4. Self-verify (sangkal diri sendiri SEBELUM bilang "selesai" — §8.2 Aturan 3)

- [ ] Data independen diambil paralel (`Promise.all`), bukan `await` berurutan? Syarat murah dicek dulu sebelum fetch jarak-jauh?
- [ ] Import langsung per-path (bukan barrel); komponen berat pakai `dynamic(...)`?
- [ ] `key` di `.map()` pakai id database (bukan `index`) untuk list yang bisa berubah urutan?
- [ ] State diupdate dengan salinan baru (`{...obj}`/`[...arr]`), bukan mutasi objek/array lama? Nilai turunan dihitung saat render, bukan disimpan via `useEffect`?
- [ ] Tes: query pakai `getByRole`/`getByLabelText` (bukan `getByTestId` dulu), `userEvent` di-`await`, async `findBy*`/`waitFor`, MSW `onUnhandledRequest: 'error'`, `QueryClient` dibuat SEKALI di luar wrapper?
- [ ] `useEffect` fetch (bukan SWR/Query) punya `AbortController` + cleanup; set-state functional updater; `<ErrorBoundary>` tak dipakai untuk error event/async?
- [ ] Search-as-you-type di-`useDebounce` SEBELUM fetch? `useQuery`/`useEffect` tak infinite-loop (fetcher/opsi stabil-referensi, bukan literal tiap render)?
- [ ] `AnimatePresence` punya `mode` eksplisit + child `key` unik; animasi cuma `transform`/`opacity`; `prefers-reduced-motion` dihormati; komponen beranimasi App Router `"use client"` + `initial`?
- [ ] Full-height HP `100dvh`/`svh` (bukan `100vh` polos)? Grid `auto-fit`+`minmax(min(100%,N),1fr)`? `clamp()` punya `rem` di nilai tengah? Tak ada `-clamp(...)` tanpa `calc`? Angka berubah `tabular-nums`? Tak ada `transition: all`?

> **Verifikasi WAJIB cuma-baca** (§8.2 Aturan 3): membuktikan = baca kode + jalankan tes (cuma-periksa) + menalar. "0 masalah" dari tes yang sebenarnya error = klaim palsu (A4) — pastikan tes benar-benar HIJAU, bukan cuma ditulis.

---

## 5. Definition-of-Done (kapan skill react-patterns dianggap benar-selesai)

- [ ] **Kontrak (§1) terpenuhi:** tes tak lolos-palsu + fetch `useEffect` tak balapan + animasi/layout tak bikin CLS & tak mengunci ukuran teks.
- [ ] **Edge case** ditangani: request tak ter-mock (gagal keras), `deps` berganti cepat (request lama batal), ketik cepat di search (tak 1 query/huruf), perangkat lemah + `prefers-reduced-motion`, bilah URL HP muncul/hilang, lebar 360px (grid tak meluber), user menaikkan ukuran font (teks ikut besar), fetcher literal (tak infinite-loop).
- [ ] **Self-verify (§4) tercentang** dengan bukti `berkas:baris`.
- [ ] Audit Lighthouse dicek terhadap Peta Web Vitals (§3) untuk halaman yang disentuh; `jest-axe`/`vitest-axe` untuk komponen interaktif.
- [ ] build + lint + test lulus lokal; min 1 tes komponen happy-path dijalankan sungguhan (bukan cuma ditulis).
- [ ] **Gerbang Pra-Rilis §4.6 LULUS** — "selesai" = terbukti (tes dijalankan + keluaran dilihat), bukan "sudah kutulis".

---

## 6. Handoff / rujuk-silang (reuse-first — JANGAN salin, RUJUK)

- 📐 **Batas Server/Client, secret, Server Action auth, middleware** → `skills/next-core/SKILL.md`.
- 📐 **Aksesibilitas** (label, fokus, ARIA, kontras, Reflow #10, Resize-Text) → `skills/a11y/SKILL.md`.
- 📐 **Arah desain & kualitas visual** → `skills/design-direction/SKILL.md`.
- 📐 **Kontrak API penuh** (status code, amplop respons) → `skills/backend/SKILL.md`; **panggilan API luar tahan-gagal** (retry/backoff/circuit-breaker) → `skills/tahan-gagal/SKILL.md`.
- 🗃️ **LATAR — kredit (MIT © Affaan Mustafa):** §performa dari `react-performance`; `key` stabil / immutability state dari `react-patterns` + `coding-standards`; tes dari `react-testing`; `useDebounce` + compound components + custom hooks + jebakan `useQuery` dari `frontend-patterns`; Motion/CSS dari `motion-ui` + `frontend-slides` — ECC v2.0.0 (ditulis-ulang non-programmer + dinetralkan). Skill `make-interfaces-feel-better` (origin komunitas, via ECC v2.0.0) — ditulis-ulang.

---

## 7. Threat-model 3-baris + batas jujur

- 🗃️ **LATAR — Threat-model:** **Aset:** kepercayaan pada UI (data tampil benar & terbaru, tata letak stabil) + keandalan tes (tak false-green) + kapasitas API (tak di-hammer loop). **Mode-gagal khas:** tes lolos padahal skenario gagal (request tak ter-mock, `setTimeout`) · respons `fetch` lama menimpa baru · `useQuery` infinite-loop menghantam API · animasi bikin CLS (SEO/CWV jeblok) · teks terkunci ukuran (WCAG 1.4.4) · `key={index}` bikin state input nempel baris salah · nilai CSS negatif hilang senyap. **Mitigasi:** query-by-role + `await` + MSW error-mode + `AbortController` + functional updater + debounce + fetcher stabil-referensi + `AnimatePresence mode` + `transform`/`opacity` saja + `dvh`/`svh` + grid `min()` + `clamp` ber-`rem` + `key` id-database.
- 🗃️ **LATAR — Batas jujur:** skill ini menaikkan **lantai** performa & kualitas React; **tidak menggantikan** audit Lighthouse manual atau uji perangkat nyata untuk performa animasi. Cek versi paket terpasang (MSW, `userEvent`, `motion`/`framer-motion`, React Query, Tailwind) sebelum menyalin pola — API berubah antar-versi (§8.2 A3).

🙂 **Non-Programmer:** hal-hal kecil ini yang sering bikin aplikasi React "kelihatan jalan" tapi rapuh: (1) tes yang bohong bilang lulus, (2) data di layar bukan yang terbaru karena dua permintaan balapan, (3) pencarian yang menembak server tak berhenti (loop), (4) halaman "meloncat" saat animasi, (5) teks tak mau membesar untuk pengguna low-vision. Skill ini memasang pagar untuk semuanya, plus resep bikin halaman kebuka lebih cepat & hemat baterai HP.
