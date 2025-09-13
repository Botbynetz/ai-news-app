"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("bookmarks") || "[]");
    setBookmarks(stored);
  }, []);

  const remove = (url) => {
    const filtered = bookmarks.filter((b) => b.url !== url);
    setBookmarks(filtered);
    localStorage.setItem("bookmarks", JSON.stringify(filtered));
  };

  if (!bookmarks.length) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Bookmarks</h1>
        <p className="text-gray-600">Belum ada berita tersimpan.</p>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Bookmarks</h1>
      <div className="grid md:grid-cols-2 gap-6">
        {bookmarks.map((b, idx) => (
          <div key={idx} className="border rounded-lg p-4 bg-white dark:bg-gray-900">
            <h2 className="font-semibold mb-2">
              <Link href={`/news/${(b.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>{b.title}</Link>
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">{b.description}</p>
            <div className="mt-3 flex items-center gap-2">
              <button onClick={() => remove(b.url)} className="px-3 py-2 bg-red-500 text-white rounded">Hapus</button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
