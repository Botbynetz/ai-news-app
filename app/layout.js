import { Geist, Geist_Mono } from "next/font/google";
import ConsentBanner from "../components/ConsentBanner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "AI News - Berita AI Terbaru",
  description:
    "Update berita terbaru seputar Artificial Intelligence, teknologi, bisnis, sains, dan tren global.",
  keywords: [
    "AI",
    "Artificial Intelligence",
    "Berita AI",
    "Teknologi",
    "Machine Learning",
    "Deep Learning",
    "Startup AI",
    "Berita Teknologi",
  ],
  openGraph: {
    title: "AI News - Berita AI Terbaru",
    description:
      "Berita AI terbaru, update teknologi, bisnis, sains, dan tren global dengan Next.js.",
    url: "https://ai-news-app.vercel.app", // ganti domain kalo udah pake custom
    siteName: "AI News",
    images: [
      {
        url: "/og-image.png", // bikin file og-image.png di /public
        width: 1200,
        height: 630,
        alt: "AI News Thumbnail",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  alternates: {
    canonical: "https://ai-news-app.vercel.app", // ganti sesuai domain lo
  },
};

export default function RootLayout({ children }) {
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;

  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        {/* Sertakan AdSense script hanya jika NEXT_PUBLIC_ADSENSE_ID tersedia */}
        {adsenseId && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
            crossOrigin="anonymous"
          ></script>
        )}
      </head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100`}
      >
        {/* 🌓 Apply theme sebelum render konten biar no flicker */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const root = document.documentElement;
                  const theme = localStorage.getItem("theme") || "system";
                  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                  if (theme === "dark") {
                    root.classList.add("dark");
                  } else if (theme === "light") {
                    root.classList.remove("dark");
                  } else {
                    if (prefersDark) {
                      root.classList.add("dark");
                    } else {
                      root.classList.remove("dark");
                    }
                  }
                } catch (e) {
                  console.error("Theme init error:", e);
                }
              })();
            `,
          }}
        />

        {/* Google Analytics jika tersedia */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}></script>
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');`,
              }}
            />
          </>
        )}

        {children}

        {/* Consent banner di-render sebagai client component */}
        <ConsentBanner />
      </body>
    </html>
  );
}
