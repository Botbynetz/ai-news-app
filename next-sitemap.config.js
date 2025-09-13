module.exports = {
  siteUrl: process.env.SITE_URL || "https://ai-news-app.vercel.app",
  generateRobotsTxt: false, // we'll provide custom robots.txt
};
/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://ai-news-app.vercel.app", // 🔥 ganti ke domain custom kalau udah ada
  generateRobotsTxt: true, // generate robots.txt juga
  sitemapSize: 5000,       // split kalau >5000 url
  changefreq: "hourly",    // update frekuensi (karena news cepat update)
  priority: 0.8,           // default priority
  exclude: ["/api/*"],     // API routes gak usah diindex
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"], // jangan index endpoint API
      },
    ],
  },
};
