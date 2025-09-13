import { NextResponse } from "next/server";
import { getCached, setCached } from "../../../lib/summaryCache";
const SUMMARY_TTL = parseInt(process.env.SUMMARY_TTL || "86400", 10);

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
    const texts = Array.isArray(body.texts) ? body.texts : body.texts ? [body.texts] : [];
    if (texts.length === 0) return NextResponse.json({ error: "Missing texts array" }, { status: 400 });

    const results = [];
    for (const t of texts) {
      const key = `s:${Buffer.from(t).toString("base64")}`;
      const cached = await getCached(key);
      if (cached) {
        results.push({ text: t, summary: cached, cached: true });
        continue;
      }

      try {
        const s = await callOpenAI(t);
        if (s) await setCached(key, s, SUMMARY_TTL);
        results.push({ text: t, summary: s });
      } catch (err) {
        console.error("summarize-batch item error:", err.message || err);
        results.push({ text: t, summary: null, error: true });
      }
    }

    return NextResponse.json({ results });
  } catch (err) {
    console.error("/api/summarize-batch error:", err.message || err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
