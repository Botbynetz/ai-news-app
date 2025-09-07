import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);

  const q = searchParams.get("q") || "AI";
  const page = searchParams.get("page") || 1;
  const pageSize = searchParams.get("pageSize") || 9;

  // API keys
  const NEWS_API_KEY = process.env.NEWS_API_KEY;
  const GNEWS_API_KEY = process.env.GNEWS_API_KEY;
  const CURRENTS_API_KEY = process.env.CURRENTS_API_KEY;
  const GUARDIAN_API_KEY = process.env.GUARDIAN_API_KEY;

  async function safeFetch(url, provider) {
    try {
      const res = await fetch(url);
      if (res.status === 429) {
        console.warn(`⚠️ ${provider} kena limit (429)`);
        return null;
      }
      if (!res.ok) {
        console.error(`❌ ${provider} error:`, res.status, res.statusText);
        return null;
      }
      return await res.json();
    } catch (err) {
      console.error(`❌ ${provider} gagal:`, err.message);
      return null;
    }
  }

  try {
    let data;

    // 1️⃣ NewsAPI
    if (NEWS_API_KEY) {
      const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(
        q
      )}&language=en&page=${page}&pageSize=${pageSize}&sortBy=publishedAt&apiKey=${NEWS_API_KEY}`;
      data = await safeFetch(url, "NewsAPI");
      if (data?.status === "ok" && data.articles?.length) {
        return NextResponse.json({
          sourceProvider: "NewsAPI",
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

    // 2️⃣ GNews
    if (GNEWS_API_KEY) {
      const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(
        q
      )}&lang=en&max=${pageSize}&page=${page}&token=${GNEWS_API_KEY}`;
      data = await safeFetch(url, "GNews");
      if (data?.articles?.length) {
        return NextResponse.json({
          sourceProvider: "GNews",
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

    // 3️⃣ Currents
    if (CURRENTS_API_KEY) {
      const url = `https://api.currentsapi.services/v1/search?keywords=${encodeURIComponent(
        q
      )}&language=en&page_number=${page}&page_size=${pageSize}&apiKey=${CURRENTS_API_KEY}`;
      data = await safeFetch(url, "Currents");
      if (data?.news?.length) {
        return NextResponse.json({
          sourceProvider: "Currents",
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

    // 4️⃣ Guardian
    if (GUARDIAN_API_KEY) {
      const url = `https://content.guardianapis.com/search?q=${encodeURIComponent(
        q
      )}&page=${page}&page-size=${pageSize}&api-key=${GUARDIAN_API_KEY}&show-fields=trailText,thumbnail`;
      data = await safeFetch(url, "Guardian");
      if (data?.response?.results?.length) {
        return NextResponse.json({
          sourceProvider: "Guardian",
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

    return NextResponse.json({ sourceProvider: "None", totalResults: 0, articles: [] });
  } catch (err) {
    console.error("❌ Fatal error:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
