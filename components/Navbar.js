import Link from "next/link";
import Image from "next/image";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-40 bg-white/70 backdrop-blur-md dark:bg-gray-900/70 border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative w-10 h-10">
            <Image src="/next.svg" alt="G-News" fill className="object-contain" />
          </div>
          <span className="font-bold text-lg dark:text-white">G-NEWS TODAY</span>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
