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

    // enqueue
    queue.current.push(...toProcess);

    const results = {};

    const runNext = async () => {
      if (!mounted.current) return;
      if (running.current >= concurrency) return;
      const item = queue.current.shift();
      if (!item) return;
      running.current++;

      try {
        const text = item.description || item.content || item.title || item.url;
        const res = await fetch("/api/summarize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
        if (res.ok) {
          const data = await res.json();
          const s = (data.summary || "").trim();
          if (summaryCache.current) summaryCache.current.set(item.url, s);
          results[item.url] = s;
          if (onSummaries) onSummaries({ [item.url]: s });
        }
      } catch (err) {
        // ignore individual errors
        console.error("summary loader error:", err);
      } finally {
        running.current--;
        // continue until queue empty
        if (queue.current.length > 0) runNext();
      }
    };

    // start initial workers
    for (let i = 0; i < concurrency; i++) runNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articles]);

  return null;
}
