import { NextResponse } from "next/server";

// Simple in-memory cache for summaries: Map<key, { summary, expiresAt }>
const summaryCache = new Map();
const SUMMARY_TTL = parseInt(process.env.SUMMARY_TTL || "86400", 10); // seconds, default 1 day

async function callOpenAI(prompt) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured");
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a summarizer. Provide a short TLDR in Indonesian (2-3 sentences)." },
        { role: "user", content: prompt },
      ],
      max_tokens: 120,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI error: ${res.status} ${text}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || null;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const text = body.text || body.content || "";
    if (!text) return NextResponse.json({ error: "Missing text" }, { status: 400 });

    const key = `s:${Buffer.from(text).toString("base64")}`;
    const cached = summaryCache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      return NextResponse.json({ summary: cached.summary, cached: true });
    }

    const summary = await callOpenAI(text);
    if (summary) {
      summaryCache.set(key, { summary, expiresAt: Date.now() + SUMMARY_TTL * 1000 });
    }
    return NextResponse.json({ summary });
  } catch (err) {
    console.error("/api/summarize error:", err.message || err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
