"use client";
import { useEffect, useState } from "react";

export default function AdSlot() {
  const [consent, setConsent] = useState(null);
  const adsenseId = typeof window !== "undefined" ? process.env.NEXT_PUBLIC_ADSENSE_ID : null;

  useEffect(() => {
    try {
      const c = localStorage.getItem("ads_consent");
      setConsent(c);
    } catch (e) {
      setConsent(null);
    }
  }, []);

  // If consent granted and adsense id available, render real ad container
  if (consent === "granted" && adsenseId) {
    return (
      <div className="w-full my-6 flex justify-center">
        <div className="w-full max-w-3xl">
          {/* Example AdSense slot - publisher must configure ad unit in AdSense console */}
          <ins className="adsbygoogle"
            style={{ display: "block" }}
            data-ad-client={adsenseId}
            data-ad-slot="" // optional: set ad slot id
            data-ad-format="auto"
            data-full-width-responsive="true"></ins>
          <script dangerouslySetInnerHTML={{ __html: `(adsbygoogle = window.adsbygoogle || []).push({});` }} />
        </div>
      </div>
    );
  }

  // fallback placeholder
  return (
    <div className="w-full my-6 flex justify-center">
      <div className="w-full max-w-3xl bg-gray-100 dark:bg-gray-800 border rounded-lg p-4 text-center text-gray-600 dark:text-gray-300">
        <div className="aspect-video bg-gray-200 dark:bg-gray-700 mx-auto rounded-lg flex items-center justify-center">
          <span className="text-sm">Ad Slot (placeholder)</span>
        </div>
      </div>
    </div>
  );
}
