"use client";
import { useEffect, useState } from "react";

export default function SwUpdateToast() {
  const [show, setShow] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const onMessage = (e) => {
      try {
        const data = e.data || {};
        if (data && data.type === 'SW_ACTIVATED') {
          // A new worker activated — prompt user to reload
          setShow(true);
        }
      } catch (err) {
        console.error(err);
      }
    };

    navigator.serviceWorker.addEventListener('message', onMessage);
    return () => navigator.serviceWorker.removeEventListener('message', onMessage);
  }, []);

  const reloadToUpdate = async () => {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration && registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
    } catch (e) {
      console.warn('SW reload failed', e);
    }
    window.location.reload();
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-blue-600 text-white px-4 py-2 rounded shadow flex items-center gap-3">
        <span>Update tersedia</span>
        <button onClick={reloadToUpdate} className="bg-white text-blue-600 px-3 py-1 rounded">Muat ulang</button>
      </div>
    </div>
  );
}
