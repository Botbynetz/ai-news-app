export const metadata = {
  title: "About - G-News",
  description: "G-News - Sumber berita terbaru tentang AI dan teknologi. Dibuat untuk menyajikan ringkasan berita yang mudah dibaca.",
};

export default function AboutPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Tentang G-News</h1>
      <p className="text-gray-700 dark:text-gray-300 mb-4">
        G-News adalah agregator berita yang mengumpulkan berita dari berbagai sumber dan menyajikannya dengan format yang mudah dibaca. Artikel dapat direwrite oleh AI untuk menambah konteks dan kejelasan.
      </p>
      <p className="text-gray-700 dark:text-gray-300">Tujuan: menyediakan ringkasan cepat dan artikel yang mudah dibaca untuk pembaca yang ingin tahu perkembangan terbaru di dunia AI dan teknologi.</p>
    </main>
  );
}
