"use client";
import { useEffect, useState } from "react";
import AdAdminPanel from "./AdAdminPanel";

export default function AdSlot() {
  const [consent, setConsent] = useState(null);
  const [dataSlot, setDataSlot] = useState("");
  const adsenseId = typeof window !== "undefined" ? process.env.NEXT_PUBLIC_ADSENSE_ID : null;

  useEffect(() => {
    try {
      const c = localStorage.getItem("ads_consent");
      setConsent(c);
    } catch (e) {
      setConsent(null);
    }
    try {
      const s = localStorage.getItem('ad_data_slot');
      if (s) setDataSlot(s);
    } catch (e) {
      setDataSlot('');
    }
  }, []);

  useEffect(() => {
    if (consent !== "granted") return;

    const tryPush = () => {
      try {
        if (window && window.adsbygoogle) {
          try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) { console.warn('adsbygoogle push failed', e); }
        }
      } catch (e) {
        console.error(e);
      }
    };

    // If adsbygoogle already loaded, push immediately
    if (window && window.adsbygoogle) {
      tryPush();
    }

    // Otherwise wait for loaded event
    const onLoaded = () => tryPush();
    window.addEventListener('adsense:loaded', onLoaded);
    return () => window.removeEventListener('adsense:loaded', onLoaded);
  }, [consent]);

  // If consent granted and adsense id available, render real ad container
  if (consent === "granted" && adsenseId) {
    return (
      <>
        <AdAdminPanel />
        <div className="w-full my-6 flex justify-center">
          <div className="w-full max-w-3xl">
            {/* Example AdSense slot - publisher must configure ad unit in AdSense console */}
            <ins className="adsbygoogle"
              style={{ display: "block" }}
              data-ad-client={adsenseId}
              data-ad-slot={dataSlot || undefined}
              data-ad-format="auto"
              data-full-width-responsive="true"></ins>
          </div>
        </div>
      </>
    );
  }

  // fallback placeholder (also include admin panel so publisher can set slot)
  return (
    <>
      <AdAdminPanel />
      <div className="w-full my-6 flex justify-center">
        <div className="w-full max-w-3xl bg-gray-100 dark:bg-gray-800 border rounded-lg p-4 text-center text-gray-600 dark:text-gray-300">
          <div className="aspect-video bg-gray-200 dark:bg-gray-700 mx-auto rounded-lg flex items-center justify-center">
            <span className="text-sm">Ad Slot (placeholder)</span>
          </div>
        </div>
      </div>
    </>
  );
}
