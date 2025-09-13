PR Summary

- Integrates SEO, AdSense, GA4, GSC verification support, JSON-LD for articles, AMP article pages, and documentation.
- Adds runtime fallbacks and routes for `/ads.txt`, `/robots.txt`, and `google-site-verification.html`.
- Adds a basic CI workflow that runs build & sitemap generation for feature branches.

How to test

1. Set required env vars in Vercel and deploy the `feature/seo-ads-analytics-amp` branch.
2. Follow steps in DEPLOY_CHECKLIST.md.

Notes

- Many features (AdSense, GSC) require a deployed site and real account IDs for full verification.
