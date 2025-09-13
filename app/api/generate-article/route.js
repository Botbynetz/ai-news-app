import { NextResponse } from "next/server";

// Simple in-memory cache (process-lifetime). Keyed by title+description.
const cache = new Map();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

function cacheKey(title, description) {
  return `${(title || "").slice(0, 200)}::${(description || "").slice(0, 200)}`;
}

async function callOpenAI(prompt) {
  const maxAttempts = 3;
  let attempt = 0;
  let lastErr = null;

  while (attempt < maxAttempts) {
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
            { role: "system", content: "Kamu adalah AI penulis berita. Buat artikel panjang (3-5 paragraf) dalam bahasa Indonesia." },
            { role: "user", content: prompt },
          ],
          max_tokens: 600,
        }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`OpenAI error ${res.status}: ${txt}`);
      }

      const data = await res.json();
      return data.choices?.[0]?.message?.content || null;
    } catch (err) {
      lastErr = err;
      attempt += 1;
      const backoff = 200 * Math.pow(2, attempt);
      await new Promise((r) => setTimeout(r, backoff));
    }
  }

  throw lastErr;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { title, description, source } = body;

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
    }

    const key = cacheKey(title, description);
    const now = Date.now();

    // return cached if fresh
    if (cache.has(key)) {
      const entry = cache.get(key);
      if (now - entry.ts < CACHE_TTL) {
        return NextResponse.json({ content: entry.content, cached: true });
      }
    }

    const prompt = `Judul: ${title}\nRingkasan: ${description}\nSumber: ${source}\n\nTolong tulis ulang artikel ini dengan detail (3-5 paragraf) dalam bahasa Indonesia, gaya formal dan informatif.`;

    const content = await callOpenAI(prompt);

    const finalContent = content || description || "";
    cache.set(key, { content: finalContent, ts: now });

    return NextResponse.json({ content: finalContent, cached: false });
  } catch (err) {
    console.error("/api/generate-article error:", err.message || err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
