"use client";
import Script from 'next/script';
import { useEffect } from 'react';

export default function AdsenseLoader() {
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_ADSENSE_ID) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('NEXT_PUBLIC_ADSENSE_ID not set — AdSense will not load.');
      }
    }
  }, []);

  if (!process.env.NEXT_PUBLIC_ADSENSE_ID) return null;

  const id = process.env.NEXT_PUBLIC_ADSENSE_ID;
  return (
    <Script
      id="adsense"
      strategy="afterInteractive"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${id}`}
      crossOrigin="anonymous"
    />
  );
}
