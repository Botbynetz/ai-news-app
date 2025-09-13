export async function generateMetadata({ params }) {
  const slug = params.slug;
  const site = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_ORIGIN || "https://ai-news-app.vercel.app";
  const canonical = `${site}/news/${slug}`;

  try {
    const apiUrl = `${site}/api/article?slug=${encodeURIComponent(slug)}`;
    const res = await fetch(apiUrl, { cache: "no-store" });
    const data = await res.json();
    const article = data.article || {};

    const title = article.title || `Berita: ${slug}`;
    const description = (article.description || article.summary || "").slice(0, 160) || `Baca detail berita: ${slug}`;
    const image = article.urlToImage || `${site}/download.png`;

    return {
      title,
      description,
      alternates: { canonical },
      metadataBase: site,
      openGraph: {
        title,
        description,
        url: canonical,
        siteName: "AI News",
        images: [{ url: image }],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [image],
      },
      robots: "index, follow",
      other: {
        'news_keywords': article.keywords ? article.keywords.join(',') : undefined,
        'author': article.author || article.source || undefined,
        'robots': 'index, follow',
        'link:amphtml': `${site}/news/${slug}/amp`,
      }
    };
  } catch (err) {
    console.error('generateMetadata error:', err.message || err);
    return {
      title: `Berita: ${slug}`,
      description: `Baca detail berita: ${slug}`,
      alternates: { canonical },
      robots: "index, follow",
    };
  }
}
