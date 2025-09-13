import { NextResponse } from "next/server";

// Simple in-memory rate limiter (per IP) - resets every minute
const rateMap = new Map();
const RATE_LIMIT = 60; // requests per minute per IP

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateMap.get(ip) || { count: 0, ts: now };
  if (now - entry.ts > 60 * 1000) {
    // reset window
    entry.count = 1;
    entry.ts = now;
    rateMap.set(ip, entry);
    return false;
  }
  entry.count += 1;
  rateMap.set(ip, entry);
  return entry.count > RATE_LIMIT;
}

// ✅ Summarizer dengan OpenAI
async function summarizeText(text) {
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Kamu adalah AI summarizer. Buat ringkasan singkat (max 40 kata, bahasa Indonesia).",
          },
          { role: "user", content: text },
        ],
        max_tokens: 80,
      }),
    });

    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || text.slice(0, 100);
  } catch (err) {
    console.error("⚠️ Summarizer gagal:", err.message);
    return text.slice(0, 120); // fallback ke potongan teks
  }
}

export async function GET(req) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "anonymous";
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }
  } catch (e) {
    console.warn("Rate limiter error", e.message || e);
  }
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
      const res = await fetch(url, {
        headers: { "User-Agent": "GNews-App/1.0 (+https://ai-news-app.vercel.app)" },
        cache: "no-store",
      });
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
        const articles = await Promise.all(
          data.articles.map(async (a) => ({
            title: a.title || "No title",
            description: await summarizeText(a.description || a.content || a.title),
            url: a.url,
            source: a.source?.name || "NewsAPI",
            publishedAt: a.publishedAt,
            imageUrl: a.urlToImage,
          }))
        );
        return withCache({
          sourceProvider: "NewsAPI",
          totalResults: data.totalResults,
          articles,
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
        const articles = await Promise.all(
          data.articles.map(async (a) => ({
            title: a.title,
            description: await summarizeText(a.description || a.title),
            url: a.url,
            source: a.source?.name || "GNews",
            publishedAt: a.publishedAt,
            imageUrl: a.image,
          }))
        );
        return withCache({
          sourceProvider: "GNews",
          totalResults: data.totalArticles || data.articles.length,
          articles,
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
        const articles = await Promise.all(
          data.news.map(async (a) => ({
            title: a.title,
            description: await summarizeText(a.description || a.title),
            url: a.url,
            source: a.author || "Currents",
            publishedAt: a.published || null,
            imageUrl: a.image || null,
          }))
        );
        return withCache({
          sourceProvider: "Currents",
          totalResults: data.news.length,
          articles,
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
        const articles = await Promise.all(
          data.response.results.map(async (a) => ({
            title: a.webTitle,
            description: await summarizeText(a.fields?.trailText || a.webTitle),
            url: a.webUrl,
            source: "The Guardian",
            publishedAt: a.webPublicationDate,
            imageUrl: a.fields?.thumbnail || null,
          }))
        );
        return withCache({
          sourceProvider: "Guardian",
          totalResults: data.response.total,
          articles,
        });
      }
    }

    // 5️⃣ Kompas (RSS)
    try {
      const kompasUrl = `https://www.kompas.id/berita/feed`;
      const kompasRes = await fetch(kompasUrl, { cache: "no-store" });
      if (kompasRes.ok) {
        const xml = await kompasRes.text();
        const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];
        if (items.length) {
          const articles = await Promise.all(
            items.slice(0, pageSize).map(async (m) => {
              const block = m[1];
              const get = (tag) =>
                (block.match(new RegExp(`<${tag}>(.*?)</${tag}>`, "s")) || [])[1] || "";
              return {
                title: get("title"),
                description: await summarizeText(get("description") || get("title")),
                url: get("link"),
                source: "Kompas.id",
                publishedAt: get("pubDate") || null,
                imageUrl: null,
              };
            })
          );
          return withCache({
            sourceProvider: "KompasRSS",
            totalResults: articles.length,
            articles,
          });
        }
      }
    } catch (err) {
      console.warn("⚠️ Kompas RSS gagal:", err.message);
    }

    // 6️⃣ Google News RSS
    try {
      const gnewsRss = `https://news.google.com/rss/search?q=${encodeURIComponent(
        q
      )}&hl=id&gl=ID&ceid=ID:id`;
      const gnewsRes = await fetch(gnewsRss, { cache: "no-store" });
      if (gnewsRes.ok) {
        const xml = await gnewsRes.text();
        const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];
        if (items.length) {
          const articles = await Promise.all(
            items.slice(0, pageSize).map(async (m) => {
              const block = m[1];
              const get = (tag) =>
                (block.match(new RegExp(`<${tag}>(.*?)</${tag}>`, "s")) || [])[1] || "";
              return {
                title: get("title"),
                description: await summarizeText(get("description") || get("title")),
                url: get("link"),
                source: "Google News",
                publishedAt: get("pubDate") || null,
                imageUrl: null,
              };
            })
          );
          return withCache({
            sourceProvider: "GoogleNewsRSS",
            totalResults: articles.length,
            articles,
          });
        }
      }
    } catch (err) {
      console.warn("⚠️ Google News RSS gagal:", err.message);
    }

    return withCache({ sourceProvider: "None", totalResults: 0, articles: [] });
  } catch (err) {
    console.error("❌ Fatal error:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}

// ✅ Cache wrapper
function withCache(jsonData) {
  return new NextResponse(JSON.stringify(jsonData), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "s-maxage=900, stale-while-revalidate=600",
    },
  });
}
