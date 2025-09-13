"use client";
import { useState, useEffect } from "react";

export default function ConsentBanner({ onConsent }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem("ads_consent");
      if (!consent) setVisible(true);
    } catch (e) {
      setVisible(true);
    }
  }, []);

  const giveConsent = () => {
    try {
      localStorage.setItem("ads_consent", "granted");
      setVisible(false);
      if (onConsent) onConsent(true);
    } catch (e) {
      console.error("consent save failed", e);
    }
  };

  const denyConsent = () => {
    try {
      localStorage.setItem("ads_consent", "denied");
      setVisible(false);
      if (onConsent) onConsent(false);
    } catch (e) {
      console.error("consent save failed", e);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 z-50">
      <div className="bg-white dark:bg-gray-800 border rounded-lg p-4 shadow-lg flex items-center justify-between gap-4">
        <div className="text-sm text-gray-800 dark:text-gray-200">
          Kami menggunakan iklan (Google AdSense) untuk mendukung situs ini. Setujui penggunaan cookie untuk menampilkan iklan.
        </div>
        <div className="flex items-center gap-2">
          <button onClick={denyConsent} className="px-3 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-sm">Tolak</button>
          <button onClick={giveConsent} className="px-3 py-2 rounded-md bg-blue-600 text-white text-sm">Setuju</button>
        </div>
      </div>
    </div>
  );
}
