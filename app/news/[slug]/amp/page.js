export const runtime = 'edge';

import React from 'react';

export default async function AmpArticle({ params }) {
  const slug = params.slug;
  const site = process.env.NEXT_PUBLIC_SITE_ORIGIN || 'https://ai-news-app.vercel.app';
  const apiUrl = `${site}/api/article?slug=${encodeURIComponent(slug)}`;

  try {
    const res = await fetch(apiUrl, { cache: 'no-store' });
    const data = await res.json();
    const article = data.article || {};

    return (
      <html amp="" lang="id">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1" />
          <link rel="canonical" href={`${site}/news/${slug}`} />
          <title>{article.title || 'Artikel'}</title>
          <style amp-boilerplate>{`body{visibility:hidden}`}</style>
          <script async src="https://cdn.ampproject.org/v0.js"></script>
          <script async custom-element="amp-img" src="https://cdn.ampproject.org/v0/amp-img-0.1.js"></script>
        </head>
        <body>
          <main>
            <h1>{article.title}</h1>
            {article.imageUrl && (
              <amp-img src={article.imageUrl} width="1200" height="630" layout="responsive" alt={article.title}></amp-img>
            )}
            <p>{article.description}</p>
            <section>
              <div dangerouslySetInnerHTML={{ __html: article.content || article.description || '' }} />
            </section>
          </main>
        </body>
      </html>
    );
  } catch (e) {
    return new Response('AMP article not available', { status: 500 });
  }
}
