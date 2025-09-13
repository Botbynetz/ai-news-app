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

- `OPENAI_API_KEY` - (required) API key OpenAI untuk endpoint server-side `/api/generate-article`.
- `NEXT_PUBLIC_SITE_ORIGIN` - (optional but disarankan) URL base dari situs saat dijalankan (mis. `http://localhost:3000`) digunakan oleh `/api/article` untuk memanggil internal API.

Contoh (PowerShell):

```powershell
$env:OPENAI_API_KEY = "sk-..."
$env:NEXT_PUBLIC_SITE_ORIGIN = "http://localhost:3000"
npm run dev
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
