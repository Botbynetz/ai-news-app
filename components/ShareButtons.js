import Link from "next/link";

export function ShareButtons({ url, title }) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const whatsapp = `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`;
  const twitter = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
  const linkedin = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;

  return (
    <div className="flex gap-3 mt-4">
      <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="px-3 py-2 bg-green-500 text-white rounded-md hover:shadow-lg transition transform hover:scale-105">WhatsApp</a>
      <a href={twitter} target="_blank" rel="noopener noreferrer" className="px-3 py-2 bg-blue-500 text-white rounded-md hover:shadow-lg transition transform hover:scale-105">Twitter</a>
      <a href={linkedin} target="_blank" rel="noopener noreferrer" className="px-3 py-2 bg-blue-700 text-white rounded-md hover:shadow-lg transition transform hover:scale-105">LinkedIn</a>
    </div>
  );
}

export function BookmarkButton({ article }) {
  const save = () => {
    try {
      const stored = JSON.parse(localStorage.getItem("bookmarks") || "[]");
      const exists = stored.find((a) => a.url === article.url);
      if (exists) return;
      stored.unshift(article);
      localStorage.setItem("bookmarks", JSON.stringify(stored));
      alert("Berita disimpan ke bookmark");
    } catch (err) {
      console.error("Bookmark error", err);
    }
  };

  return (
    <button onClick={save} className="ml-2 px-3 py-2 bg-yellow-500 text-white rounded-md hover:shadow-lg transition transform hover:scale-105">🔖 Simpan</button>
  );
}
