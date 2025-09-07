import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);

  const q = searchParams.get("q") || "";
  const page = searchParams.get("page") || 1;
  const pageSize = searchParams.get("pageSize") || 9;
  const category = searchParams.get("category") || "";

  // 🔑 pakai env aman (server-only)
 const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    console.error("❌ NEWS_API_KEY tidak terbaca dari .env.local");
    return NextResponse.json(
      { error: "Server tidak menemukan NEWS_API_KEY" },
      { status: 500 }
    );
  }

  // 📰 pilih endpoint NewsAPI
  let url;
  if (q) {
    url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(
      q
    )}&language=en&page=${page}&pageSize=${pageSize}&sortBy=publishedAt&apiKey=${apiKey}`;
  } else {
    url = `https://newsapi.org/v2/top-headlines?country=us&language=en&page=${page}&pageSize=${pageSize}&apiKey=${apiKey}`;
    if (category) {
      url += `&category=${encodeURIComponent(category)}`;
    }
  }

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "AI-News-App/1.0" },
    });

    if (!res.ok) {
      console.error("❌ Gagal fetch NewsAPI:", res.status, res.statusText);
      return NextResponse.json(
        { error: `News API error: ${res.status} ${res.statusText}` },
        { status: res.status }
      );
    }

    const data = await res.json();

    if (data.status === "error") {
      console.error("❌ NewsAPI error:", data);
      return NextResponse.json(
        { error: data.message || "NewsAPI error" },
        { status: 500 }
      );
    }

    // 🎯 mapping artikel
    const articles = (data.articles || []).map((a) => ({
      title: a.title || "No title",
      description: a.description || "",
      url: a.url,
      source: a.source?.name || "Unknown",
      publishedAt: a.publishedAt || null,
      imageUrl: a.urlToImage || null,
    }));

    // 🚀 response ke frontend
    return NextResponse.json({
      totalResults: data.totalResults || 0,
      articles,
    });
  } catch (err) {
    console.error("❌ Internal error:", err);
    return NextResponse.json(
      { error: "Gagal fetch dari NewsAPI", details: err.message },
      { status: 500 }
    );
  }
}
