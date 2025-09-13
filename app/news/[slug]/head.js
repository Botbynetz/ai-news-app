import { readFileSync } from "fs";

export async function generateMetadata({ params }) {
  const slug = params.slug;

  // Try to read latestNews from a file? fallback to defaults
  // NOTE: at runtime on server we don't have client's localStorage; metadata will be generic or empty.
  const title = `G-NEWS - ${slug.replace(/-/g, " ")}`;
  const description = `Baca artikel: ${slug.replace(/-/g, " ")}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: ["/og-image.png"],
    },
    robots: "index, follow",
    alternates: { canonical: `${process.env.SITE_URL || "https://ai-news-app.vercel.app"}/news/${slug}` },
  };
}
