"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

// 🔧 Helper slugify biar konsisten sama homepage
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // semua non-alfanumerik jadi "-"
    .replace(/(^-|-$)+/g, ""); // hapus "-" di awal/akhir
}

export default function NewsDetail() {
  const { slug } = useParams();
  const router = useRouter();
  const [article, setArticle] = useState(null);
  const [aiArticle, setAiArticle] = useState("");
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState([]);
  const [relatedTitle, setRelatedTitle] = useState("Berita Terkait");

  // 🔄 Ambil artikel & cari related
  useEffect(() => {
    const savedNews = JSON.parse(localStorage.getItem("latestNews") || "[]");
    const found = savedNews.find((n) => slugify(n.title || "") === slug);
    setArticle(found || null);

    if (found) {
      let filtered = savedNews.filter((n) => slugify(n.title || "") !== slug);

      let result = [];

      // 1️⃣ Prioritas kategori sama (kalau ada)
      if (found.category) {
        result = filtered.filter(
          (n) => n.category && n.category === found.category
        );
        if (result.length > 0) {
          setRelatedTitle(`Berita ${found.category} Terkait`);
        }
      }

      // 2️⃣ Kalau kategori ga ada / masih kurang → fallback keyword
      if (result.length < 3) {
        const keywords = (found.title || "")
          .toLowerCase()
          .split(" ")
          .filter((w) => w.length > 3);

        const keywordMatches = filtered.filter((n) =>
          keywords.some((kw) => n.title?.toLowerCase().includes(kw))
        );

        if (keywordMatches.length > 0 && result.length === 0) {
          setRelatedTitle("Bacaan Lainnya untuk Kamu");
        }

        result = [...result, ...keywordMatches];
      }

      // 3️⃣ Kalau masih kurang → tambahin random biar tetap ada 3
      if (result.length < 3) {
        const others = filtered.filter((n) => !result.includes(n));
        const shuffled = others.sort(() => 0.5 - Math.random());
        if (result.length === 0) {
          setRelatedTitle("Rekomendasi Berita Lain");
        }
        result = [...result, ...shuffled.slice(0, 3 - result.length)];
      }

      setRelated(result.slice(0, 3));
    }
  }, [slug]);

  // ✍️ Generate artikel panjang via OpenAI
  useEffect(() => {
    let mounted = true;

    const fetchArticleFromServer = async (slugParam) => {
      try {
        const res = await fetch(`/api/article?slug=${encodeURIComponent(slugParam)}`);
        if (!res.ok) return null;
        const data = await res.json();
        return data.article || null;
      } catch (err) {
        console.warn("/api/article fetch failed:", err.message || err);
        return null;
      }
    };

    const generateAIArticle = async (srcArticle) => {
      try {
        const res = await fetch(`/api/generate-article`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: srcArticle.title,
            description: srcArticle.description || srcArticle.content || "",
            source: srcArticle.source || "",
          }),
        });

        if (!res.ok) {
          console.warn("/api/generate-article failed");
          return srcArticle.description || "";
        }

        const data = await res.json();
        return data.content || srcArticle.description || "";
      } catch (err) {
        console.error("/api/generate-article error:", err.message || err);
        return srcArticle.description || "";
      }
    };

    (async () => {
      try {
        let src = article;

        if (!src) {
          // coba ambil dari server fallback
          const srv = await fetchArticleFromServer(slug);
          if (srv) {
            src = srv;
            if (mounted) setArticle(src);
          }
        }

        if (src) {
          const content = await generateAIArticle(src);
          if (mounted) setAiArticle(content || "");
        } else {
          if (mounted) setAiArticle("");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [article, slug]);

  if (!article) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-8">
        <p className="text-red-500">❌ Artikel tidak ditemukan.</p>
        <button
          onClick={() => router.push("/")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
        >
          ⬅ Kembali ke Beranda
        </button>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      {/* Judul */}
      <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
        {article.title}
      </h1>

      {/* Info artikel */}
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

      {/* Gambar */}
      {article.imageUrl && (
        <img
          src={article.imageUrl}
          alt={article.title}
          className="w-full h-64 object-cover rounded-lg shadow mb-6"
        />
      )}

      {/* Konten */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        </div>
      ) : (
        <article className="prose dark:prose-invert max-w-none">
          {aiArticle.split("\n").map((para, idx) => (
            <p key={idx}>{para}</p>
          ))}
        </article>
      )}

      {/* Disclaimer */}
      <p className="mt-6 text-sm text-gray-500 dark:text-gray-400 italic">
        Artikel ini ditulis ulang oleh AI berdasarkan sumber berita terpercaya.
      </p>

      {/* Related News */}
      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
            {relatedTitle}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {related.map((rel, idx) => (
              <Link
                key={idx}
                href={`/news/${slugify(rel.title || `related-${idx}`)}`}
                className="block border rounded-lg shadow hover:shadow-lg transition bg-white dark:bg-gray-900 overflow-hidden"
              >
                {rel.imageUrl ? (
                  <img
                    src={rel.imageUrl}
                    alt={rel.title}
                    className="w-full h-40 object-cover"
                    onError={(e) => (e.currentTarget.src = "/logo.png")}
                  />
                ) : (
                  <div className="w-full h-40 bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                    No image
                  </div>
                )}
                <div className="p-4">
                  <h3 className="text-lg font-medium line-clamp-2 dark:text-white">
                    {rel.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                    {rel.description || ""}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Tombol Back */}
      <div className="mt-10 flex justify-center">
        <button
          onClick={() => {
            if (window.history.length > 1) {
              router.back();
            } else {
              router.push("/");
            }
          }}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
        >
          ⬅ Kembali
        </button>
      </div>
    </main>
  );
}