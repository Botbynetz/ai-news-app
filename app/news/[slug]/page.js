"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function NewsDetail() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [aiArticle, setAiArticle] = useState("");
  const [loading, setLoading] = useState(true);

  // 🔄 Ambil artikel dari localStorage (diset di homepage)
  useEffect(() => {
    const savedNews = JSON.parse(localStorage.getItem("latestNews") || "[]");
    const found = savedNews.find(
      (n) => slug === n.title?.toLowerCase().replace(/\s+/g, "-")
    );
    setArticle(found || null);
  }, [slug]);

  // ✍️ Generate artikel panjang via OpenAI
  useEffect(() => {
    if (!article) return;

    const generateAIArticle = async () => {
      try {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content:
                  "Kamu adalah AI penulis berita. Buat artikel panjang (3-5 paragraf) dalam bahasa Indonesia. Gaya formal, informatif, mudah dipahami.",
              },
              {
                role: "user",
                content: `Judul: ${article.title}\nRingkasan: ${article.description}\nSumber: ${article.source}\n\nTolong tulis ulang artikel ini dengan detail.`,
              },
            ],
            max_tokens: 600,
          }),
        });

        const data = await res.json();
        setAiArticle(data.choices?.[0]?.message?.content || "");
      } catch (err) {
        console.error("⚠️ Gagal generate artikel AI:", err.message);
        setAiArticle(article.description || "");
      } finally {
        setLoading(false);
      }
    };

    generateAIArticle();
  }, [article]);

  if (!article) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-8">
        <p className="text-red-500">❌ Artikel tidak ditemukan.</p>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
        {article.title}
      </h1>

      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6">
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

      {article.imageUrl && (
        <img
          src={article.imageUrl}
          alt={article.title}
          className="w-full h-64 object-cover rounded-lg shadow mb-6"
        />
      )}

      {loading ? (
        <p className="text-gray-500 dark:text-gray-400">
          ⏳ AI sedang menulis artikel...
        </p>
      ) : (
        <article className="prose dark:prose-invert max-w-none">
          {aiArticle.split("\n").map((para, idx) => (
            <p key={idx}>{para}</p>
          ))}
        </article>
      )}

      <div className="mt-6">
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
        >
          🔗 Baca sumber asli
        </a>
      </div>
    </main>
  );
}
