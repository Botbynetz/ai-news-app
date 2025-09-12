"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

// 🔧 Helper slugify biar konsisten dengan detail page
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // ganti non-alfanumerik jadi "-"
    .replace(/(^-|-$)+/g, "");   // hapus "-" di awal/akhir
}

export default function Home() {
  const [query, setQuery] = useState("AI");
  const [category, setCategory] = useState("");
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [theme, setTheme] = useState("system");
  const [sourceProvider, setSourceProvider] = useState("");
  const [hasMore, setHasMore] = useState(true);

  const pageSize = 9;
  const observer = useRef();

  // 🔄 Load theme preference
  useEffect(() => {
    const saved = localStorage.getItem("theme") || "system";
    setTheme(saved);
  }, []);

  // 🎨 Apply theme
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else if (theme === "light") {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      localStorage.setItem("theme", "system");
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
  }, [theme]);

  // 📡 Fetch news
  const fetchNews = async (search = query, pageNum = 1, cat = category, append = false) => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/news?q=${encodeURIComponent(search)}&page=${pageNum}&pageSize=${pageSize}&category=${cat}`
      );
      const data = await res.json();

      if (!res.ok) {
        console.error("❌ API error:", data.error || data);
        setNews(append ? news : []);
        setTotalResults(0);
        setSourceProvider("");
        setHasMore(false);
        return;
      }

      const newArticles = append
        ? [...(news || []), ...(data.articles || [])]
        : data.articles || [];

      setNews(newArticles);

      // ✅ Simpan artikel ke localStorage (buat detail page)
      localStorage.setItem("latestNews", JSON.stringify(newArticles));

      setTotalResults(data.totalResults || 0);
      setSourceProvider(data.sourceProvider || "");
      setHasMore(pageNum * pageSize < (data.totalResults || 0));
    } catch (err) {
      console.error("❌ Fetch failed:", err);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Fetch on page/query/category change
  useEffect(() => {
    fetchNews(query, page, category, page > 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, query, category]);

  // 🔍 Search
  const handleSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchNews(query, 1, category, false);
  };

  // 📂 Category
  const handleCategory = (cat) => {
    setCategory(cat);
    setQuery("");
    setPage(1);
  };

  // 🔄 Infinite scroll observer
  const lastNewsElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  // 🏷️ Categories
  const categories = [
    { key: "business", label: "Business" },
    { key: "entertainment", label: "Entertainment" },
    { key: "general", label: "General" },
    { key: "health", label: "Health" },
    { key: "science", label: "Science" },
    { key: "sports", label: "Sports" },
    { key: "technology", label: "Technology" },
  ];

  // 📰 Schema builder
  const buildSchema = () => {
    const articlesSchema = news.map((a) => ({
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      headline: a.title,
      description: a.description || "",
      url: a.url,
      image: a.imageUrl ? [a.imageUrl] : [],
      datePublished: a.publishedAt,
      author: {
        "@type": "Organization",
        name: a.source || "Unknown",
      },
      publisher: {
        "@type": "Organization",
        name: "G-News",
        logo: {
          "@type": "ImageObject",
          url: "https://ai-news-app.vercel.app/logo.png",
        },
      },
    }));

    return [
      {
        "@context": "https://schema.org",
        "@type": "NewsMediaOrganization",
        name: "G-News",
        url: "https://ai-news-app.vercel.app",
        logo: "https://ai-news-app.vercel.app/logo.png",
      },
      ...articlesSchema,
    ];
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <header className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="G-News Logo" width={60} height={60} priority />
          <div>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">
              G-NEWS TODAY
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {query
                ? `Sumber berita terbaru seputar "${query}"`
                : category
                ? `Kategori berita: ${category}`
                : "Berita terbaru"}
            </p>
            {totalResults > 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Menampilkan {news.length} dari {totalResults} hasil
              </p>
            )}
            {sourceProvider && (
              <p className="text-xs text-green-600 dark:text-green-400">
                ✅ Berita dari: <b>{sourceProvider}</b>
              </p>
            )}
          </div>
        </div>

        {/* Theme select */}
        <div>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:text-gray-100 shadow-sm"
          >
            <option value="light">☀ Light</option>
            <option value="dark">🌙 Dark</option>
            <option value="system">🖥 Default (System)</option>
          </select>
        </div>
      </header>

      {/* Search bar */}
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 p-3 border rounded-lg shadow-sm focus:ring focus:ring-blue-300 outline-none dark:bg-gray-800 dark:text-white"
          placeholder="Cari berita..."
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition"
        >
          Cari
        </button>
      </form>

      {/* Category buttons */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => handleCategory(cat.key)}
            className={`shrink-0 px-4 py-2 rounded-lg border transition ${
              category === cat.key
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-gray-800 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-gray-700"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid berita */}
      <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.map((article, idx) => {
          const slug = slugify(article.title || `news-${idx}`);
          return (
            <article
              key={article.url || idx}
              ref={idx === news.length - 1 ? lastNewsElementRef : null}
              className="border rounded-xl shadow hover:shadow-lg transition bg-white dark:bg-gray-900 overflow-hidden flex flex-col"
            >
              <div className="w-full">
                {article.imageUrl ? (
                  <img
                    src={article.imageUrl}
                    alt={article.title || "Article image"}
                    className="w-full h-48 sm:h-56 object-cover"
                    loading="lazy"
                    onError={(e) => (e.currentTarget.src = "/logo.png")}
                  />
                ) : (
                  <div className="w-full h-48 sm:h-56 bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                    No image
                  </div>
                )}
              </div>
              <div className="p-4 flex flex-col justify-between flex-1">
                <div>
                  <h2 className="text-lg font-semibold mb-2 line-clamp-2 dark:text-white">
                    <Link href={`/news/${slug}`}>{article.title}</Link>
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-4">
                    {article.description || ""}
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>📌 {article.source}</span>
                  {article.publishedAt && (
                    <span>
                      🗓{" "}
                      {new Date(article.publishedAt).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  )}
                </div>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-blue-600 dark:text-blue-400 font-medium hover:underline"
                >
                  🔗 Baca sumber asli
                </a>
              </div>
            </article>
          );
        })}
      </section>

      {/* Loading indicator */}
      {loading && (
        <p className="text-gray-500 dark:text-gray-400 text-center mt-6">
          ⏳ Memuat berita...
        </p>
      )}

      {/* ✅ Schema Markup JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildSchema()),
        }}
      />
    </main>
  );
}