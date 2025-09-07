import { Geist, Geist_Mono } from "next/font/google";
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
  title: "AI News",
  description: "Berita AI terbaru dengan Next.js",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
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
                    // system
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
        {children}
      </body>
    </html>
  );
}
