"use client";
import { useState, useEffect } from "react";

export default function SearchBar({ query, setQuery, onSearch, suggestions = [] }) {
  const [input, setInput] = useState(query || "");
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    setInput(query || "");
  }, [query]);

  const handleChange = (e) => {
    setInput(e.target.value);
    setShowSuggestions(true);
  };

  const choose = (val) => {
    setInput(val);
    setShowSuggestions(false);
    setQuery(val);
    onSearch && onSearch(val);
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={input}
        onChange={handleChange}
        onKeyDown={(e) => e.key === "Enter" && (setQuery(input), onSearch && onSearch(input))}
        className="w-full p-3 border rounded-lg shadow-sm focus:ring focus:ring-blue-300 outline-none dark:bg-gray-800 dark:text-white"
        placeholder="Cari berita..."
      />

      {showSuggestions && input.length > 0 && (
        <ul className="absolute left-0 right-0 bg-white dark:bg-gray-900 border mt-1 rounded shadow z-50 max-h-56 overflow-auto">
          {suggestions.length > 0 ? (
            suggestions.map((s, i) => (
              <li key={i} onClick={() => choose(s)} className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">{s}</li>
            ))
          ) : (
            <li className="px-3 py-2 text-gray-500">No suggestions</li>
          )}
        </ul>
      )}
    </div>
  );
}
