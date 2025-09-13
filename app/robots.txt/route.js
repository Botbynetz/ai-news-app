export async function GET() {
  const site = process.env.NEXT_PUBLIC_SITE_ORIGIN || process.env.NEXT_PUBLIC_VERCEL_URL || 'https://ai-news-app.vercel.app';
  const sitemapUrl = `${site.replace(/\/$/, '')}/sitemap.xml`;
  const body = `User-agent: *\nAllow: /\nSitemap: ${sitemapUrl}\n`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
