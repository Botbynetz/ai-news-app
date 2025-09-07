import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);

  const q = searchParams.get("q") || "AI"; // default query biar gak kosong
  const page = searchParams.get("page") || 1;
  const pageSize = searchParams.get("pageSize") || 9;
  const category = searchParams.get("category") || "";

  // 🔑 API keys
  const NEWS_API_KEY = process.env.NEWS_API_KEY;
  const GNEWS_API_KEY = process.env.GNEWS_API_KEY;
  const CURRENTS_API_KEY = process.env.CURRENTS_API_KEY;
  const GUARDIAN_API_KEY = process.env.GUARDIAN_API_KEY;

  // ===== Fetcher Functions =====
  async function fetchNewsAPI() {
    let url;
    if (q) {
      url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(
        q
      )}&language=en&page=${page}&pageSize=${pageSize}&sortBy=publishedAt&apiKey=${NEWS_API_KEY}`;
    } else {
      url = `https://newsapi.org/v2/top-headlines?country=us&language=en&page=${page}&pageSize=${pageSize}&apiKey=${NEWS_API_KEY}`;
      if (category) url += `&category=${encodeURIComponent(category)}`;
    }
    const res = await fetch(url);
    return res.json();
  }

  async function fetchGNews() {
    const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(
      q
    )}&lang=en&max=${pageSize}&page=${page}&token=${GNEWS_API_KEY}`;
    const res = await fetch(url);
    return res.json();
  }

  async function fetchCurrents() {
    const url = `https://api.currentsapi.services/v1/search?keywords=${encodeURIComponent(
      q
    )}&language=en&page_number=${page}&page_size=${pageSize}&apiKey=${CURRENTS_API_KEY}`;
    const res = await fetch(url);
    return res.json();
  }

  async function fetchGuardian() {
    const url = `https://content.guardianapis.com/search?q=${encodeURIComponent(
      q
    )}&page=${page}&page-size=${pageSize}&api-key=${GUARDIAN_API_KEY}&show-fields=trailText,thumbnail`;
    const res = await fetch(url);
    return res.json();
  }

  // ===== Try APIs one by one =====
  try {
    let data;

    // 1. NewsAPI
    if (NEWS_API_KEY) {
      data = await fetchNewsAPI();
      if (data?.status === "ok" && data.articles?.length) {
        return NextResponse.json({
          totalResults: data.totalResults,
          articles: data.articles.map((a) => ({
            title: a.title || "No title",
            description: a.description || "",
            url: a.url,
            source: a.source?.name || "NewsAPI",
            publishedAt: a.publishedAt,
            imageUrl: a.urlToImage,
          })),
        });
      }
    }

    // 2. GNews
    if (GNEWS_API_KEY) {
      data = await fetchGNews();
      if (data?.articles?.length) {
        return NextResponse.json({
          totalResults: data.totalArticles || data.articles.length,
          articles: data.articles.map((a) => ({
            title: a.title,
            description: a.description || "",
            url: a.url,
            source: a.source?.name || "GNews",
            publishedAt: a.publishedAt,
            imageUrl: a.image,
          })),
        });
      }
    }

    // 3. Currents
    if (CURRENTS_API_KEY) {
      data = await fetchCurrents();
      if (data?.news?.length) {
        return NextResponse.json({
          totalResults: data.news.length,
          articles: data.news.map((a) => ({
            title: a.title,
            description: a.description || "",
            url: a.url,
            source: a.author || "Currents",
            publishedAt: a.published || null,
            imageUrl: a.image || null,
          })),
        });
      }
    }

    // 4. Guardian
    if (GUARDIAN_API_KEY) {
      data = await fetchGuardian();
      if (data?.response?.results?.length) {
        return NextResponse.json({
          totalResults: data.response.total,
          articles: data.response.results.map((a) => ({
            title: a.webTitle,
            description: a.fields?.trailText || "",
            url: a.webUrl,
            source: "The Guardian",
            publishedAt: a.webPublicationDate,
            imageUrl: a.fields?.thumbnail || null,
          })),
        });
      }
    }

    // fallback kosong
    return NextResponse.json({ totalResults: 0, articles: [] });
  } catch (err) {
    console.error("❌ Internal error:", err);
    return NextResponse.json(
      { error: "Gagal fetch berita", details: err.message },
      { status: 500 }
    );
  }
}
