Deployment verification checklist

1. Set environment variables in Vercel (Project Settings → Environment Variables):
   - NEXT_PUBLIC_SITE_ORIGIN = https://your-domain.com
   - NEXT_PUBLIC_GA_ID = G-XXXXXXXX
   - NEXT_PUBLIC_ADSENSE_ID = ca-pub-XXXXXXXX
   - ADSENSE_TXT = (full ads.txt contents) OR put ads.txt in public/
   - NEXT_PUBLIC_GSC_VERIFICATION = (optional verification token)
   - OPENAI_API_KEY (already required for AI features)

2. Deploy to Vercel (Production).

3. Post-deploy checks (open the production URL):
   - Search Network tab for `gtag/js?id=` to confirm GA loaded.
   - Visit `/ads.txt` and `/robots.txt` to confirm proper content.
   - Visit a sample article `/news/<slug>` and `/news/<slug>/amp` to check AMP page.
   - Use Google Rich Results Test for an article URL (JSON-LD validation).
   - In GA Real-time, verify hits appear (test by opening site in new incognito window).

4. If AdSense not showing immediately, confirm AdSense account approval and that `NEXT_PUBLIC_ADSENSE_ID` is correct.
