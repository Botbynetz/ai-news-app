import { NextResponse } from "next/server";

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
        { role: "system", content: "You are a translator. Translate the user text between Indonesian and English as requested." },
        { role: "user", content: prompt },
      ],
      max_tokens: 600,
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
    const { text, target = "id" } = body;
    if (!text) return NextResponse.json({ error: "Missing text" }, { status: 400 });

    const prompt = `Translate the following text to ${target === 'en' ? 'English' : 'Indonesian'}:\n\n${text}`;
    const translated = await callOpenAI(prompt);
    return NextResponse.json({ translated });
  } catch (err) {
    console.error("/api/translate error:", err.message || err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
