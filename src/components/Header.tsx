import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full bg-white border-b border-gray-base/20 shadow-sm">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-baseline gap-1">
          <span className="text-lg font-bold text-orange-base">POPs</span>
          <span className="text-sm font-medium text-gray-dark">Novamix</span>
        </Link>

        <nav className="flex items-center gap-4 text-sm font-medium text-gray-dark">
          <Link href="/" className="hover:text-orange-base transition-colors">
            Consultar
          </Link>
        </nav>
      </div>
    </header>
  );
}
