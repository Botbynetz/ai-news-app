# Deploy dan environment

1. Buat file `.env.local` di root project dan masukkan nilai dari `.env.example` (isi `OPENAI_API_KEY` minimal).

2. Untuk deploy ke Vercel:
   - Login ke Vercel dan import project dari GitHub.
   - Pada project settings → Environment Variables, tambahkan:
     - `OPENAI_API_KEY` (Value: your OpenAI key) — Environment: Production & Preview
     - `NEXT_PUBLIC_SITE_ORIGIN` — set ke `https://your-domain.com` atau `https://<vercel-app>.vercel.app`
     - (Opsional) `NEWS_API_KEY`, `GNEWS_API_KEY`, `CURRENTS_API_KEY`, `GUARDIAN_API_KEY` jika mau pakai provider berbayar.

3. Deploy. Setelah deploy, coba buka halaman berita dan detail article. Jika menggunakan fitur AI generate, pastikan `OPENAI_API_KEY` tersedia di env.
