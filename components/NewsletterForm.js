"use client";
import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!email.includes("@")) return setStatus("Invalid email");
    // For now, save to localStorage as placeholder
    const list = JSON.parse(localStorage.getItem("newsletterList") || "[]");
    list.push({ email, date: new Date().toISOString() });
    localStorage.setItem("newsletterList", JSON.stringify(list));
    setStatus("Thanks! Subscribed.");
    setEmail("");
  };

  return (
    <form onSubmit={submit} className="mt-6 flex gap-2">
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email kamu" className="flex-1 p-3 border rounded-lg dark:bg-gray-800" />
      <button className="px-4 py-2 bg-green-600 text-white rounded">Subscribe</button>
      {status && <p className="text-sm text-gray-600 ml-4">{status}</p>}
    </form>
  );
}
