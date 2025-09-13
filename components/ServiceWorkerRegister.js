"use client";
import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const register = async () => {
        try {
          const reg = await navigator.serviceWorker.register('/sw.js');
          // optional: listen for updates
          reg.addEventListener('updatefound', () => {
            // notify when new SW found
            console.log('Service worker update found');
          });
          console.log('Service worker registered', reg.scope);
        } catch (e) {
          console.warn('Service worker registration failed', e);
        }
      };
      register();
    }
  }, []);

  return null;
}
