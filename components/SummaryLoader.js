"use client";
import { useEffect, useRef } from "react";

export default function SummaryLoader({ articles = [], onSummaries, summaryCache, concurrency = 3 }) {
  const running = useRef(0);
  const queue = useRef([]);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!articles || articles.length === 0) return;

    const toProcess = [];
    for (let i = 0; i < Math.min(6, articles.length); i++) {
      const a = articles[i];
      if (!a || !a.url) continue;
      if (summaryCache.current && summaryCache.current.has(a.url)) continue;
      toProcess.push(a);
    }

    if (toProcess.length === 0) return;

    const texts = toProcess.map((a) => a.description || a.content || a.title || a.url);

    // mark as loading (empty string) so UI can show skeleton
    const loadingMap = {};
    toProcess.forEach((a) => (loadingMap[a.url] = ""));
    if (onSummaries) onSummaries(loadingMap);

    (async () => {
      try {
        const res = await fetch("/api/summarize-batch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ texts }),
        });
        if (!res.ok) return;
        const data = await res.json();
        const results = data.results || [];
        const map = {};
        results.forEach((r, idx) => {
          const item = toProcess[idx];
          const s = (r.summary || "").trim();
          if (summaryCache.current) summaryCache.current.set(item.url, s);
          map[item.url] = s;
        });
        if (onSummaries) onSummaries(map);
      } catch (err) {
        console.error("summary batch error:", err);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articles]);

  return null;
}
