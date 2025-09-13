"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import SearchBar from "../components/SearchBar";
import NewsCard from "../components/NewsCard";
import LoadMoreButton from "../components/LoadMoreButton";
import SummaryLoader from "../components/SummaryLoader";

function slugify(text) {
  return text.toString().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}

export default function Home() {
  const [query, setQuery] = useState("AI");
  const [news, setNews] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [suggestions, setSuggestions] = useState(["AI", "Machine Learning", "Deep Learning", "Startup", "Robotics"]);
  const [summaries, setSummaries] = useState({});

  const pageSize = 9;
  const summaryCache = useRef(new Map());

  useEffect(() => {
    // Load persisted suggestions or user prefs
    const s = JSON.parse(localStorage.getItem("suggestions") || "null");
    if (s) setSuggestions(s);
  }, []);

  const fetchNews = async (q = query, p = page, append = false) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/news?q=${encodeURIComponent(q)}&page=${p}&pageSize=${pageSize}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "fetch error");

      const newArticles = append ? [...news, ...(data.articles || [])] : data.articles || [];
      setNews(newArticles);
      localStorage.setItem("latestNews", JSON.stringify(newArticles));
      setHasMore(p * pageSize < (data.totalResults || 0));
    } catch (err) {
      console.error("fetchNews error:", err);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (q) => {
    setQuery(q);
    setPage(1);
    fetchNews(q, 1, false);
  };

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchNews(query, next, true);
  };

  // Trending & Popular using localStorage clicks
  const [clickCounts, setClickCounts] = useState({});
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("clickCounts") || "{}");
    setClickCounts(stored || {});
  }, []);

  const incrementClick = (id) => {
    const next = { ...clickCounts, [id]: (clickCounts[id] || 0) + 1 };
    setClickCounts(next);
    localStorage.setItem("clickCounts", JSON.stringify(next));
  };

  const trending = Object.entries(clickCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k]) => k);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <header className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">G-NEWS TODAY</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Berita AI terkini dan ringkasan singkat.</p>
          </div>

          <div className="w-full md:w-1/2">
            <SearchBar query={query} setQuery={setQuery} onSearch={handleSearch} suggestions={suggestions} />
          </div>
        </div>
      </header>

      {/* Ad after search */}
      <div className="mb-6">
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">AdSlot (after search)</div>
      </div>

      {/* Trending & Popular */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Trending</h2>
        <div className="flex gap-3 overflow-auto pb-2">
          {trending.length === 0 ? (
            <p className="text-sm text-gray-500">No trending yet</p>
          ) : (
            trending.map((t, i) => (
              <div key={i} className="px-3 py-2 bg-white dark:bg-gray-900 border rounded">{t}</div>
            ))
          )}
        </div>
      </section>

      {/* Articles grid */}
      <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.map((article, idx) => (
          <div key={article.url || idx} className="news-card">
            <NewsCard article={article} onClick={() => incrementClick(article.url || idx)} onHover={() => { /* prefetch logic can be added */ }} />
          </div>
        ))}
      </section>

      {/* Load More alternative to infinite scroll */}
      <div className="mt-6">
        <LoadMoreButton onClick={loadMore} disabled={!hasMore || loading} />
      </div>

      <SummaryLoader articles={news} onSummaries={(m) => setSummaries((s) => ({ ...s, ...m }))} summaryCache={summaryCache} concurrency={3} />
    </main>
  );
}