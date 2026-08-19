import Link from "next/link";

type AdminNavProps = {
  isGlobalAdmin: boolean;
};

export default function AdminNav({ isGlobalAdmin }: AdminNavProps) {
  return (
    <nav className="w-full border-b border-gray-base/20 bg-white">
      <div className="max-w-4xl mx-auto px-6 flex items-center gap-4 text-sm font-medium text-gray-dark h-12">
        <Link href="/admin" className="hover:text-orange-base transition-colors">
          POPs
        </Link>
        {isGlobalAdmin && (
          <Link href="/admin/categorias" className="hover:text-orange-base transition-colors">
            Categorias
          </Link>
        )}
        <Link href="/admin/tags" className="hover:text-orange-base transition-colors">
          Tags
        </Link>
      </div>
    </nav>
  );
}
