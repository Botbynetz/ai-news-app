import { NextResponse } from "next/server";

function slugify(text) {
  return (text || "")
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug") || "";

    if (!slug) {
      return NextResponse.json({ error: "Missing slug" }, { status: 400 });
    }

    // Try to query the main /api/news endpoint with likely keywords from slug
    const keywords = slug.split("-").filter((w) => w.length > 2).slice(0, 5).join(" ") || slug;
    const pageSize = 20;

    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_ORIGIN || ""}/api/news?q=${encodeURIComponent(keywords)}&page=1&pageSize=${pageSize}`, {
      headers: { "User-Agent": "GNews-App/1.0" },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch articles" }, { status: 502 });
    }

    const data = await res.json();
    const found = (data.articles || []).find((a) => slugify(a.title) === slug);

    if (!found) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    return NextResponse.json({ article: found });
  } catch (err) {
    console.error("/api/article error:", err.message || err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
