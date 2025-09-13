import Link from "next/link";
import ShimmerImage from "./ShimmerImage";

export default function NewsCard({ article, onClick, onHover }) {
  const slug = (article.title || "").toString().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

  return (
    <article className="border rounded-xl bg-white dark:bg-gray-900 overflow-hidden flex flex-col transform transition hover:shadow-xl hover:-translate-y-1">
      <div className="w-full overflow-hidden">
        {article.imageUrl ? (
          <div className="relative w-full h-48 overflow-hidden">
            <ShimmerImage src={article.imageUrl} alt={article.title} />
          </div>
        ) : (
          <div className="w-full h-48 bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-400">No image</div>
        )}
      </div>
      <div className="p-4 flex flex-col justify-between flex-1">
        <div>
          <h2 className="text-lg font-semibold mb-2 line-clamp-2">
            <Link href={`/news/${slug}`} onMouseEnter={onHover} onClick={onClick}>{article.title}</Link>
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">{article.description}</p>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>📌 {article.source}</span>
          {article.publishedAt && (
            <span>🗓 {new Date(article.publishedAt).toLocaleDateString("id-ID")}</span>
          )}
        </div>
      </div>
    </article>
  );
}
