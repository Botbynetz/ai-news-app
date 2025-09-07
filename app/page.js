"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [query, setQuery] = useState("AI");
  const [category, setCategory] = useState("");
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [theme, setTheme] = useState("system");
  const [sourceProvider, setSourceProvider] = useState(""); // ✅ tambahan

  const pageSize = 9;

  // ambil theme dari localStorage
  useEffect(() => {
    const saved = localStorage.getItem("theme") || "system";
    setTheme(saved);
  }, []);

  // update theme tiap berubah
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

  const fetchNews = async (search = query, pageNum = 1, cat = category) => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/news?q=${encodeURIComponent(search)}&page=${pageNum}&pageSize=${pageSize}&category=${cat}`
      );
      const data = await res.json();

      if (!res.ok) {
        console.error("❌ API error:", data.error || data);
        setNews([]);
        setTotalResults(0);
        setSourceProvider("");
        return;
      }

      setNews(data.articles || []);
      setTotalResults(data.totalResults || 0);
      setSourceProvider(data.sourceProvider || ""); // ✅ simpan provider
    } catch (err) {
      console.error("❌ Fetch failed:", err);
      setNews([]);
      setTotalResults(0);
      setSourceProvider("");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews(query, page, category);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, query, category]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchNews(query, 1, category);
  };

  const handleCategory = (cat) => {
    setCategory(cat);
    setQuery("");
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(totalResults / pageSize));

  const categories = [
    { key: "business", label: "Business" },
    { key: "entertainment", label: "Entertainment" },
    { key: "general", label: "General" },
    { key: "health", label: "Health" },
    { key: "science", label: "Science" },
    { key: "sports", label: "Sports" },
    { key: "technology", label: "Technology" },
  ];

  const handleImgError = (e) => {
    e.currentTarget.src = "/next.svg";
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      {/* Header + Theme Dropdown */}
      <header className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            📰 G-NEWS UPDATE
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {query
              ? `Sumber berita terbaru seputar "${query}"`
              : category
              ? `Kategori berita: ${category}`
              : "Berita terbaru"}
          </p>
          {totalResults > 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Menampilkan {Math.min(totalResults, pageSize)} dari {totalResults} hasil
            </p>
          )}
          {sourceProvider && (
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              ✅ Berita dari: <b>{sourceProvider}</b>
            </p>
          )}
        </div>

        {/* Theme select */}
        <div>
          <label className="sr-only" htmlFor="theme-select">Theme</label>
          <select
            id="theme-select"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:text-gray-100 shadow-sm"
            aria-label="Pilih tema"
          >
            <option value="light">☀ Light</option>
            <option value="dark">🌙 Dark</option>
            <option value="system">🖥 Default (System)</option>
          </select>
        </div>
      </header>

      {/* Search bar */}
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <label htmlFor="search" className="sr-only">Cari berita</label>
        <input
          id="search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 p-3 border rounded-lg shadow-sm focus:ring focus:ring-blue-300 outline-none dark:bg-gray-800 dark:text-white"
          placeholder="Cari berita..."
          aria-label="Cari berita"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition"
          aria-label="Cari"
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
            aria-pressed={category === cat.key}
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

      {/* Loading */}
      {loading && (
        <p className="text-gray-500 dark:text-gray-400 text-lg mb-6">
          ⏳ Sedang memuat berita...
        </p>
      )}

      {/* No results */}
      {!loading && news.length === 0 && (
        <p className="text-red-500 text-lg mb-6">
          ❌ Tidak ada berita ditemukan.
        </p>
      )}

      {/* Grid berita */}
      <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.map((article, idx) => (
          <article
            key={article.url || idx}
            className="border rounded-xl shadow hover:shadow-lg transition bg-white dark:bg-gray-900 overflow-hidden flex flex-col"
          >
            <div className="w-full">
              {article.imageUrl ? (
                <img
                  src={article.imageUrl}
                  alt={article.title || "Article image"}
                  className="w-full h-48 sm:h-56 object-cover"
                  loading="lazy"
                  onError={handleImgError}
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
                  {article.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3">
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
                aria-label={`Baca selengkapnya: ${article.title}`}
              >
                🔗 Baca selengkapnya
              </a>
            </div>
          </article>
        ))}
      </section>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-10">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            aria-disabled={page === 1}
            className={`px-4 py-2 rounded-lg ${
              page === 1
                ? "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            ⬅ Prev
          </button>
          <span className="text-gray-700 dark:text-gray-300 font-medium">
            Page {page} / {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            aria-disabled={page === totalPages}
            className={`px-4 py-2 rounded-lg ${
              page === totalPages
                ? "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            Next ➡
          </button>
        </div>
      )}
    </main>
  );
}
