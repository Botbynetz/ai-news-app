"use client";
import { useEffect, useState } from "react";

export default function AdAdminPanel() {
  const [slot, setSlot] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.get('ad_admin') === '1') setVisible(true);
    } catch (e) {
      // ignore
    }

    try {
      const existing = localStorage.getItem('ad_data_slot');
      if (existing) setSlot(existing);
    } catch (e) {}
  }, []);

  if (!visible) return null;

  const save = () => {
    try {
      localStorage.setItem('ad_data_slot', slot || '');
      alert('Ad slot saved to localStorage (ad_data_slot)');
    } catch (e) {
      console.error(e);
      alert('Failed to save');
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <h4 className="font-semibold mb-2">Ad Admin</h4>
      <input value={slot} onChange={(e) => setSlot(e.target.value)} placeholder="data-ad-slot (e.g. 1234567890)" className="w-64 p-2 border rounded mb-2" />
      <div className="flex gap-2">
        <button onClick={save} className="px-3 py-1 bg-blue-600 text-white rounded">Save</button>
        <button onClick={() => { setSlot(''); localStorage.removeItem('ad_data_slot'); }} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded">Clear</button>
      </div>
    </div>
  );
}
