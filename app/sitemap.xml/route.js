import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    // Prefer serving a pre-generated static sitemap from /public
    const publicDir = path.join(process.cwd(), "public");
    const staticSitemap = path.join(publicDir, "sitemap.xml");
    const staticSitemap0 = path.join(publicDir, "sitemap-0.xml");

    if (fs.existsSync(staticSitemap)) {
      const xml = fs.readFileSync(staticSitemap, "utf8");
      return new NextResponse(xml, { headers: { "Content-Type": "application/xml", "Cache-Control": "s-maxage=86400, stale-while-revalidate=3600" } });
    }

    if (fs.existsSync(staticSitemap0)) {
      const xml = fs.readFileSync(staticSitemap0, "utf8");
      return new NextResponse(xml, { headers: { "Content-Type": "application/xml", "Cache-Control": "s-maxage=86400, stale-while-revalidate=3600" } });
    }

    // Fallback to building sitemap dynamically from internal API if static files missing
    const site = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_ORIGIN || "https://ai-news-app.vercel.app";
    const res = await fetch(new URL(`/api/news?q=AI&page=1&pageSize=100`, process.env.NEXT_PUBLIC_SITE_ORIGIN || "http://localhost:3000"), { next: { revalidate: 86400 } });
    const data = await res.json();

    const articles = data.articles || [];

    const urls = articles.map((a) => {
      const slug = (a.title || "").toString().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
      const loc = `${site}/news/${slug}`;
      const lastmod = a.publishedAt ? new Date(a.publishedAt).toISOString() : new Date().toISOString();
      return `<url><loc>${loc}</loc><lastmod>${lastmod}</lastmod></url>`;
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${urls.join("\n")}
      </urlset>`;

    return new NextResponse(xml, {
      headers: { "Content-Type": "application/xml", "Cache-Control": "s-maxage=86400, stale-while-revalidate=3600" },
    });
  } catch (err) {
    console.error("/sitemap.xml error:", err.message || err);
    return new NextResponse("", { status: 500 });
  }
}
