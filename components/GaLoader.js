"use client";
import Script from 'next/script';
import { useEffect } from 'react';

export default function GaLoader() {
  useEffect(() => {
    const isProd = process.env.NODE_ENV === 'production';
    const gaId = process.env.NEXT_PUBLIC_GA_ID || process.env.NEXT_PUBLIC_GA_ID_FALLBACK;

    if (!gaId) {
      if (!isProd) {
        // developer warning
        console.warn('NEXT_PUBLIC_GA_ID is not set. Google Analytics will be disabled in development.');
      }
    }
  }, []);

  // Use env var when present; fallback to placeholder to avoid build errors
  const gaId = process.env.NEXT_PUBLIC_GA_ID || process.env.NEXT_PUBLIC_GA_ID_FALLBACK || 'G-XXXXXXX';

  // Only include GA scripts in production builds to avoid noise in dev
  if (process.env.NODE_ENV !== 'production') {
    // in development, do nothing (but console warning already emitted)
    return null;
  }

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
      <Script id="gtag-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${gaId}');`}
      </Script>
    </>
  );
}
