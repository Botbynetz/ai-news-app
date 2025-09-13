# 📰 AI News App

AI News App adalah aplikasi berita berbasis **Next.js 15** yang menampilkan artikel terkini dari berbagai sumber menggunakan **NewsAPI**.  
Didesain modern, responsif, dan mendukung **dark mode toggle (light/dark/system)** dengan preferensi tersimpan di localStorage.

---

## 🚀 Features
- ✅ Cari berita berdasarkan **keyword**
- ✅ Filter berita berdasarkan **kategori** (business, sports, technology, dll)
- ✅ Pagination dengan navigasi Prev/Next
- ✅ **Dark mode toggle** (Light / Dark / System) dengan penyimpanan di localStorage
- ✅ **Responsive design** → support Desktop, Tablet, Mobile
- ✅ Optimized dengan **Tailwind CSS**
- ✅ Deploy-ready ke **Vercel**

---

## 📸 Screenshots
### Tampilan Desktop
![Desktop Preview](public/desktop-preview.png)

### Tampilan Mobile
![Mobile Preview](public/mobile-preview.png)

---

## ⚡ Getting Started

Clone repo & install dependencies:

```bash
git clone https://github.com/Botbynetz/ai-news-app.git
cd ai-news-app

npm install

### Environment variables

Untuk fitur generasi artikel AI dan fallback server-side, set environment variable berikut sebelum menjalankan aplikasi:


And run `npm run dev`.

## 🛠️ PWA & Service Worker

Project ships a minimal service worker at `public/sw.js` for basic offline support and runtime caching of API responses. The service worker is automatically registered on the client via a small React component. To test it locally:

```powershell
npm run dev
# open DevTools -> Application -> Service Workers to inspect registration
```

Note: the service worker is intentionally minimal. For production-grade caching strategies (precaching, stale-while-revalidate, granular runtime rules), consider using Workbox or a dedicated SW build step.

## 💰 Monetization / Ads

This project includes a consent-driven ad flow. To enable real Google AdSense ads, set the following environment variable in your deployment (for example, in Vercel Environment Variables):

- `NEXT_PUBLIC_ADSENSE_ID` - your AdSense publisher id in the format `ca-pub-XXXXXXXXXXXX`.

The app will show a consent banner (once per browser) and only inject the AdSense script when the user grants consent. Until `NEXT_PUBLIC_ADSENSE_ID` is set, a visual placeholder is shown where ad slots would appear.

## 📊 Google Analytics (GA4) Integration

To enable GA4 tracking, set the environment variable `NEXT_PUBLIC_GA_ID` in your deployment (Vercel). Steps:

1. Masuk ke Google Analytics → Admin → Buat Property baru.
2. Pilih platform "Web" dan masukkan domain situs (mis. yoursite.vercel.app atau domain custom).
3. Setelah property dibuat, buka bagian "Data Streams" → pilih stream web → salin "Measurement ID" (format: G-XXXXXXXX).
4. Di Vercel, buka Settings → Environment Variables → tambahkan `NEXT_PUBLIC_GA_ID=G-XXXXXXXX` untuk Environment `Production` (pilihan recommended).
5. Deploy ulang (or re-run build) agar script GA aktif pada production build.

GA4 dapat membantu tracking trafik, user retention, dan integrasi dengan AdSense/Ads products.

Automatic handling in this project:
- The app loads GA only in production builds using a client-side loader component.
- If `NEXT_PUBLIC_GA_ID` is not set, the loader will use a safe placeholder `G-XXXXXXX` to avoid build-time failures and will warn in development console.


Contoh (PowerShell):

```powershell
$env:OPENAI_API_KEY = "sk-..."
$env:NEXT_PUBLIC_SITE_ORIGIN = "http://localhost:3000"
npm run dev
```

Jika menggunakan Redis secara lokal untuk cache ringkasan, set `REDIS_URL` juga:

```powershell
$env:REDIS_URL = "redis://localhost:6379"
``` 

Jangan lupa install dependensi baru (`ioredis`) jika kamu men-deploy / menjalankan lokal setelah perubahan ini:

```powershell
npm install
```

### Perbaikan & optimasi

- Panggilan OpenAI sekarang dijalankan di server-side melalui `/api/generate-article` sehingga API key tidak terekspos ke client.
- Endpoint `/api/generate-article` memiliki cache in-memory (TTL 1 jam) dan retry/backoff sederhana untuk mengurangi duplikasi panggilan dan menangani transient error.
- Detail page sekarang menampilkan skeleton loading saat artikel AI sedang dibuat, dan menggunakan fallback server `/api/article?slug=...` bila `localStorage` kosong.

### Automasi setup Vercel (opsional)

Jika mau otomatisasi setup env via CLI, ada skrip PowerShell helper di `scripts/setup-vercel-env.ps1`:

1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Jalankan skrip: `.\scripts\setup-vercel-env.ps1` dan ikuti prompt (masukkan nilai env ketika diminta).

Catatan: skrip ini interaktif dan tidak menyimpan kunci apa pun ke repository.

### Sitemap

Project sudah menyertakan `next-sitemap` config. Jika belum terinstall, jalankan:

```powershell
npm install next-sitemap --save-dev
```

Dan jalankan `npm run postbuild` setelah build untuk menghasilkan sitemap.
