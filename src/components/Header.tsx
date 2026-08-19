import Image from "next/image";
import Link from "next/link";
import { getAuthPayload, isPopsAdmin } from "@/lib/auth";
import logoNovamix from "@/assets/logo-novamix.jpeg";

export default async function Header() {
  const payload = await getAuthPayload();
  const podeGerenciar = isPopsAdmin(payload);

  return (
    <header className="w-full bg-white border-b border-gray-base/20 shadow-sm">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src={logoNovamix}
            alt="Logo Novamix"
            className="h-9 w-9 rounded-md object-cover"
          />
          <span className="text-lg font-bold text-orange-base">POPs</span>
        </Link>

        <nav className="flex items-center gap-4 text-sm font-medium text-gray-dark">
          <Link href="/" className="hover:text-orange-base transition-colors">
            Consultar
          </Link>
          {podeGerenciar && (
            <Link
              href="/admin"
              className="rounded-md bg-orange-base px-3 py-1.5 text-xs font-medium text-white hover:bg-orange-light transition"
            >
              Admin
            </Link>
          )}
          <a
            href="https://hub.lojanovamix.com.br"
            className="rounded-md bg-red-base px-3 py-1.5 text-xs font-medium text-white hover:bg-red-light transition"
          >
            Hub Novamix
          </a>
        </nav>
      </div>
    </header>
  );
}
